-- ==============================================================================
-- Navark CBT Multi-Tenant Architecture
-- Migration 002: Advanced CBT Engine (Anti-Cheat, 10s Delta Sync, Disaster Recovery,
-- Admin Live Diagnostics & Official NTA Percentile Engine)
-- ==============================================================================

-- 1. STUDENT DEVICE BINDING TABLE (Anti-Cheat Single Device Lockdown)
CREATE TABLE IF NOT EXISTS public.student_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.institution_memberships(id) ON DELETE CASCADE,
    device_fingerprint TEXT NOT NULL,
    device_name TEXT DEFAULT 'Desktop Computer',
    os_version TEXT DEFAULT 'Windows 10/11',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_active_device UNIQUE(user_id, is_active)
);

CREATE INDEX IF NOT EXISTS idx_student_devices_lookup 
ON public.student_devices(user_id, device_fingerprint, is_active);

-- 2. ACTIVE EXAM SESSIONS TABLE (Real-Time Proctoring & Live State)
CREATE TABLE IF NOT EXISTS public.active_exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.institution_memberships(id) ON DELETE CASCADE,
    device_fingerprint TEXT,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'FORCE_SUBMITTED', 'LOCKED', 'WARNING_TRIGGERED', 'EXPIRED')),
    current_question_index INT NOT NULL DEFAULT 0,
    current_section_index INT NOT NULL DEFAULT 0,
    attempted_count INT NOT NULL DEFAULT 0,
    unattempted_count INT NOT NULL DEFAULT 0,
    flagged_count INT NOT NULL DEFAULT 0,
    violations_count INT NOT NULL DEFAULT 0,
    time_extended_minutes INT NOT NULL DEFAULT 0,
    time_remaining_seconds INT NOT NULL DEFAULT 3600,
    duration_minutes INT NOT NULL DEFAULT 60,
    is_unlocked_by_admin BOOLEAN NOT NULL DEFAULT true,
    device_info TEXT,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_active_session UNIQUE(exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_exam 
ON public.active_exam_sessions(exam_id, status);

-- 3. CBT ANSWER SNAPSHOTS TABLE (10-Second Delta Backups & Audit Trail)
CREATE TABLE IF NOT EXISTS public.cbt_answer_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.institution_memberships(id) ON DELETE CASCADE,
    version_id INT NOT NULL DEFAULT 1,
    time_remaining_seconds INT NOT NULL,
    snapshot_type TEXT NOT NULL DEFAULT 'DELTA_10S' CHECK (snapshot_type IN ('DELTA_10S', 'HEARTBEAT', 'FINAL_SUBMIT')),
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    client_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cbt_snapshots_session 
ON public.cbt_answer_snapshots(session_id, version_id DESC);

-- 4. CBT SECURITY AUDIT LOGS (Tab Switches, Fullscreen Exits, Device Violations)
CREATE TABLE IF NOT EXISTS public.cbt_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    session_id UUID,
    student_id UUID NOT NULL REFERENCES public.institution_memberships(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    details_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cbt_audit_session 
ON public.cbt_audit_logs(session_id, event_type);

-- 5. REATTEMPT REQUESTS TABLE (Disaster Recovery & Tech Issue Appeals)
CREATE TABLE IF NOT EXISTS public.reattempt_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.institution_memberships(id) ON DELETE CASCADE,
    student_name TEXT,
    student_user_id TEXT,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.institution_memberships(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- STORED PROCEDURES / RPC FUNCTIONS
-- ==============================================================================

-- 1. DEVICE BINDING VERIFICATION & REGISTRATION
CREATE OR REPLACE FUNCTION public.register_or_verify_device(
    p_institution_id UUID,
    p_user_id UUID,
    p_device_fingerprint TEXT,
    p_device_name TEXT DEFAULT 'Windows PC',
    p_os_version TEXT DEFAULT 'Windows 10/11'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing RECORD;
BEGIN
    -- Check if active device binding exists
    SELECT * INTO v_existing 
    FROM public.student_devices 
    WHERE user_id = p_user_id AND is_active = true 
    LIMIT 1;

    IF v_existing.id IS NOT NULL THEN
        -- If fingerprint matches, update last used time
        IF v_existing.device_fingerprint = p_device_fingerprint THEN
            UPDATE public.student_devices 
            SET last_used_at = now() 
            WHERE id = v_existing.id;

            RETURN jsonb_build_object(
                'success', true,
                'status', 'VERIFIED',
                'message', 'Registered device verified successfully.'
            );
        ELSE
            -- Mismatch: student is attempting to open exam on another machine
            RETURN jsonb_build_object(
                'success', false,
                'status', 'DEVICE_MISMATCH',
                'message', 'This account is locked to a different computer (' || COALESCE(v_existing.device_name, 'Registered PC') || '). Please use your registered computer or ask your teacher/admin to reset device registration.'
            );
        END IF;
    END IF;

    -- Register new binding
    INSERT INTO public.student_devices (
        institution_id, user_id, device_fingerprint, device_name, os_version, is_active
    )
    VALUES (
        p_institution_id, p_user_id, p_device_fingerprint, p_device_name, p_os_version, true
    );

    RETURN jsonb_build_object(
        'success', true,
        'status', 'NEWLY_BOUND',
        'message', 'Computer successfully bound to your student account.'
    );
END;
$$;

-- 2. START OR RESUME CBT EXAM SESSION (Disaster Recovery Aware)
CREATE OR REPLACE FUNCTION public.start_or_resume_cbt_session(
    p_institution_id UUID,
    p_exam_id UUID,
    p_student_id UUID,
    p_device_fingerprint TEXT,
    p_duration_minutes INT DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_exam RECORD;
    v_latest_snapshot RECORD;
    v_time_remaining INT;
BEGIN
    SELECT * INTO v_exam FROM public.exams WHERE id = p_exam_id;
    IF v_exam.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Examination not found.');
    END IF;

    -- Check if active session already exists
    SELECT * INTO v_session 
    FROM public.active_exam_sessions 
    WHERE exam_id = p_exam_id AND student_id = p_student_id;

    IF v_session.id IS NOT NULL THEN
        -- If locked by proctor
        IF v_session.status = 'LOCKED' AND NOT v_session.is_unlocked_by_admin THEN
            RETURN jsonb_build_object(
                'success', false,
                'status', 'LOCKED',
                'error', 'Your examination session is locked due to security violations. Please contact the exam supervisor to unlock.'
            );
        END IF;

        -- If already submitted
        IF v_session.status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'FORCE_SUBMITTED') THEN
            RETURN jsonb_build_object(
                'success', true,
                'status', 'ALREADY_SUBMITTED',
                'session', to_jsonb(v_session)
            );
        END IF;

        -- Fetch latest 10-second answers snapshot
        SELECT * INTO v_latest_snapshot 
        FROM public.cbt_answer_snapshots 
        WHERE session_id = v_session.id 
        ORDER BY version_id DESC 
        LIMIT 1;

        -- Calculate effective time remaining including extensions
        v_time_remaining := GREATEST(0, v_session.time_remaining_seconds + (COALESCE(v_session.time_extended_minutes, 0) * 60));

        UPDATE public.active_exam_sessions 
        SET last_active_at = now() 
        WHERE id = v_session.id;

        RETURN jsonb_build_object(
            'success', true,
            'status', 'RESUMED',
            'session', to_jsonb(v_session),
            'timeRemainingSeconds', v_time_remaining,
            'recoveredAnswers', COALESCE(v_latest_snapshot.answers_json, '{}'::jsonb),
            'violationsCount', v_session.violations_count
        );
    END IF;

    -- Create new session
    v_time_remaining := p_duration_minutes * 60;

    INSERT INTO public.active_exam_sessions (
        institution_id, exam_id, student_id, device_fingerprint,
        status, duration_minutes, time_remaining_seconds, is_unlocked_by_admin
    )
    VALUES (
        p_institution_id, p_exam_id, p_student_id, p_device_fingerprint,
        'IN_PROGRESS', p_duration_minutes, v_time_remaining, true
    )
    RETURNING * INTO v_session;

    RETURN jsonb_build_object(
        'success', true,
        'status', 'STARTED',
        'session', to_jsonb(v_session),
        'timeRemainingSeconds', v_time_remaining,
        'recoveredAnswers', '{}'::jsonb,
        'violationsCount', 0
    );
END;
$$;

-- 3. BATCH 10-SECOND DELTA SYNC WORKER RPC
CREATE OR REPLACE FUNCTION public.sync_cbt_answer_delta(
    p_session_id UUID,
    p_institution_id UUID,
    p_exam_id UUID,
    p_student_id UUID,
    p_version_id INT,
    p_time_remaining_seconds INT,
    p_answers_json JSONB,
    p_current_q_index INT DEFAULT 0,
    p_attempted_count INT DEFAULT 0,
    p_unattempted_count INT DEFAULT 0,
    p_flagged_count INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Save snapshot
    INSERT INTO public.cbt_answer_snapshots (
        session_id, institution_id, exam_id, student_id,
        version_id, time_remaining_seconds, answers_json, snapshot_type
    )
    VALUES (
        p_session_id, p_institution_id, p_exam_id, p_student_id,
        p_version_id, p_time_remaining_seconds, p_answers_json, 'DELTA_10S'
    );

    -- Update active exam session
    UPDATE public.active_exam_sessions
    SET time_remaining_seconds = p_time_remaining_seconds,
        current_question_index = p_current_q_index,
        attempted_count = p_attempted_count,
        unattempted_count = p_unattempted_count,
        flagged_count = p_flagged_count,
        last_active_at = now()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
        'success', true,
        'syncedVersion', p_version_id,
        'serverTimestamp', now()
    );
END;
$$;

-- 4. LOG PROCTORING SECURITY VIOLATION (Tab Switch, Fullscreen Exit)
CREATE OR REPLACE FUNCTION public.log_cbt_violation(
    p_session_id UUID,
    p_institution_id UUID,
    p_student_id UUID,
    p_event_type TEXT,
    p_details_json JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_violations INT;
    v_status TEXT := 'IN_PROGRESS';
BEGIN
    -- Record in audit log
    INSERT INTO public.cbt_audit_logs (
        institution_id, session_id, student_id, event_type, details_json
    )
    VALUES (
        p_institution_id, p_session_id, p_student_id, p_event_type, p_details_json
    );

    -- Increment violations count
    UPDATE public.active_exam_sessions
    SET violations_count = violations_count + 1,
        last_active_at = now()
    WHERE id = p_session_id
    RETURNING violations_count INTO v_new_violations;

    IF v_new_violations >= 3 THEN
        v_status := 'LOCKED';
        UPDATE public.active_exam_sessions 
        SET status = 'LOCKED', is_unlocked_by_admin = false 
        WHERE id = p_session_id;
    ELSIF v_new_violations > 0 THEN
        v_status := 'WARNING_TRIGGERED';
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'violationsCount', v_new_violations,
        'status', v_status
    );
END;
$$;

-- 5. ADMIN EMERGENCY PROCTORING ACTIONS
CREATE OR REPLACE FUNCTION public.admin_extend_session_time(
    p_session_id UUID,
    p_minutes INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.active_exam_sessions
    SET time_extended_minutes = time_extended_minutes + GREATEST(1, p_minutes),
        time_remaining_seconds = time_remaining_seconds + (GREATEST(1, p_minutes) * 60),
        last_active_at = now()
    WHERE id = p_session_id;

    RETURN jsonb_build_object('success', true, 'addedMinutes', p_minutes);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reset_session_warnings(
    p_session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.active_exam_sessions
    SET violations_count = 0,
        status = 'IN_PROGRESS',
        is_unlocked_by_admin = true,
        last_active_at = now()
    WHERE id = p_session_id;

    RETURN jsonb_build_object('success', true, 'message', 'Warnings reset successfully.');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_force_submit_session(
    p_session_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sess RECORD;
    v_snap RECORD;
BEGIN
    SELECT * INTO v_sess FROM public.active_exam_sessions WHERE id = p_session_id;
    IF v_sess.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Session not found');
    END IF;

    -- Fetch latest answers snapshot
    SELECT * INTO v_snap FROM public.cbt_answer_snapshots 
    WHERE session_id = p_session_id 
    ORDER BY version_id DESC 
    LIMIT 1;

    -- Auto-grade via submit_exam_attempt
    PERFORM public.submit_exam_attempt(
        v_sess.id,
        COALESCE(v_snap.answers_json, '{}'::jsonb),
        v_sess.duration_minutes
    );

    UPDATE public.active_exam_sessions 
    SET status = 'FORCE_SUBMITTED', last_active_at = now() 
    WHERE id = p_session_id;

    RETURN jsonb_build_object('success', true, 'message', 'Exam session force-submitted.');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_unbind_student_device(
    p_student_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.student_devices
    SET is_active = false
    WHERE user_id = p_student_id;

    RETURN jsonb_build_object('success', true, 'message', 'Student device unbound. Student can now log in on a new computer.');
END;
$$;

-- 6. LIVE PROCTOR COCKPIT DIAGNOSTICS QUERY
CREATE OR REPLACE FUNCTION public.admin_get_live_exam_sessions(
    p_institution_id UUID,
    p_exam_id UUID DEFAULT NULL
)
RETURNS TABLE (
    session_id UUID,
    exam_id UUID,
    exam_title TEXT,
    student_id UUID,
    student_name TEXT,
    student_user_id TEXT,
    batch_name TEXT,
    status TEXT,
    time_remaining_seconds INT,
    attempted_count INT,
    unattempted_count INT,
    flagged_count INT,
    violations_count INT,
    device_name TEXT,
    last_active_at TIMESTAMPTZ,
    issue_code TEXT,
    issue_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id AS session_id,
        s.exam_id,
        e.title AS exam_title,
        s.student_id,
        p.display_name AS student_name,
        m.user_code AS student_user_id,
        COALESCE(c.name, 'General') AS batch_name,
        s.status,
        s.time_remaining_seconds,
        s.attempted_count,
        s.unattempted_count,
        s.flagged_count,
        s.violations_count,
        COALESCE(d.device_name, 'Desktop PC') AS device_name,
        s.last_active_at,
        CASE
            WHEN s.violations_count >= 3 THEN 'MAX_VIOLATIONS'
            WHEN s.status = 'LOCKED' THEN 'LOCKED_BY_ADMIN'
            WHEN s.status = 'WARNING_TRIGGERED' THEN 'TAB_SWITCH_WARNING'
            WHEN s.last_active_at < now() - INTERVAL '45 seconds' THEN 'OFFLINE_DISCONNECTED'
            ELSE 'HEALTHY_ACTIVE'
        END AS issue_code,
        CASE
            WHEN s.violations_count >= 3 THEN 'Student reached maximum tab-switch violations limit.'
            WHEN s.status = 'LOCKED' THEN 'Session locked by supervisor.'
            WHEN s.status = 'WARNING_TRIGGERED' THEN 'Student switched browser tabs or exited fullscreen.'
            WHEN s.last_active_at < now() - INTERVAL '45 seconds' THEN 'Heartbeat lost. Student may be offline or tab closed.'
            ELSE 'Candidate actively solving.'
        END AS issue_reason
    FROM public.active_exam_sessions s
    JOIN public.exams e ON e.id = s.exam_id
    JOIN public.institution_memberships m ON m.id = s.student_id
    JOIN public.profiles p ON p.id = m.profile_id
    LEFT JOIN public.classes c ON c.id = m.batch_id
    LEFT JOIN public.student_devices d ON d.user_id = s.student_id AND d.is_active = true
    WHERE s.institution_id = p_institution_id
      AND (p_exam_id IS NULL OR s.exam_id = p_exam_id)
    ORDER BY s.last_active_at DESC;
END;
$$;

-- 7. AUTHORITATIVE NTA JEE PERCENTILE & NORMALIZATION ENGINE
CREATE OR REPLACE FUNCTION public.calculate_exam_nta_percentiles(p_exam_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_candidates INT;
BEGIN
    SELECT COUNT(*) INTO v_total_candidates
    FROM public.results
    WHERE exam_id = p_exam_id;

    IF v_total_candidates = 0 THEN
        RETURN;
    END IF;

    -- Update NTA percentile: (count of candidates with score <= candidate_score / total) * 100
    WITH ranked AS (
        SELECT 
            id,
            ROUND(
                (COUNT(*) OVER (
                    ORDER BY score ASC 
                    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                )::NUMERIC / v_total_candidates::NUMERIC) * 100,
                2
            ) AS nta_percentile,
            DENSE_RANK() OVER (ORDER BY score DESC, time_taken_minutes ASC) AS official_rank
        FROM public.results
        WHERE exam_id = p_exam_id
    )
    UPDATE public.results r
    SET percentage = ranked.nta_percentile,
        rank = ranked.official_rank,
        total_participants = v_total_candidates
    FROM ranked
    WHERE r.id = ranked.id;
END;
$$;

-- Grant permissions to public roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

