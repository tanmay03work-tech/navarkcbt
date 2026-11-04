import { supabase } from '@/lib/supabase';

export interface LiveProctorSession {
  sessionId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentUserId: string;
  batchName: string;
  status: string;
  timeRemainingSeconds: number;
  attemptedCount: number;
  unattemptedCount: number;
  flaggedCount: number;
  violationsCount: number;
  deviceName: string;
  lastActiveAt: string;
  issueCode: 'HEALTHY_ACTIVE' | 'TAB_SWITCH_WARNING' | 'MAX_VIOLATIONS' | 'LOCKED_BY_ADMIN' | 'OFFLINE_DISCONNECTED';
  issueReason: string;
}

export const cbtProctorService = {
  // Device verification
  async verifyDevice(
    institutionId: string,
    userId: string,
    fingerprint: string,
    deviceName: string = 'Desktop PC'
  ): Promise<{ success: boolean; status?: string; message?: string }> {
    const { data, error } = await supabase.rpc('register_or_verify_device', {
      p_institution_id: institutionId,
      p_user_id: userId,
      p_device_fingerprint: fingerprint,
      p_device_name: deviceName,
      p_os_version: navigator.platform || 'Windows',
    });

    if (error) {
      console.error('Device binding RPC error:', error);
      return { success: false, message: error.message };
    }
    return data;
  },

  // Start / Resume session
  async startOrResumeSession(
    institutionId: string,
    examId: string,
    studentId: string,
    fingerprint: string,
    durationMinutes: number
  ): Promise<{
    success: boolean;
    status?: string;
    session?: any;
    timeRemainingSeconds?: number;
    recoveredAnswers?: Record<string, any>;
    violationsCount?: number;
    error?: string;
  }> {
    const { data, error } = await supabase.rpc('start_or_resume_cbt_session', {
      p_institution_id: institutionId,
      p_exam_id: examId,
      p_student_id: studentId,
      p_device_fingerprint: fingerprint,
      p_duration_minutes: durationMinutes,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Admin Live Proctor Cockpit
  async getLiveSessions(institutionId: string, examId?: string): Promise<LiveProctorSession[]> {
    const { data, error } = await supabase.rpc('admin_get_live_exam_sessions', {
      p_institution_id: institutionId,
      p_exam_id: examId || null,
    });

    if (error) {
      console.error('Error fetching live proctor sessions:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      sessionId: row.session_id,
      examId: row.exam_id,
      examTitle: row.exam_title,
      studentId: row.student_id,
      studentName: row.student_name,
      studentUserId: row.student_user_id,
      batchName: row.batch_name,
      status: row.status,
      timeRemainingSeconds: Number(row.time_remaining_seconds || 0),
      attemptedCount: Number(row.attempted_count || 0),
      unattemptedCount: Number(row.unattempted_count || 0),
      flaggedCount: Number(row.flagged_count || 0),
      violationsCount: Number(row.violations_count || 0),
      deviceName: row.device_name,
      lastActiveAt: row.last_active_at,
      issueCode: row.issue_code,
      issueReason: row.issue_reason,
    }));
  },

  async extendTime(sessionId: string, minutes: number = 15): Promise<boolean> {
    const { data, error } = await supabase.rpc('admin_extend_session_time', {
      p_session_id: sessionId,
      p_minutes: minutes,
    });
    return !error && data?.success;
  },

  async resetWarnings(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('admin_reset_session_warnings', {
      p_session_id: sessionId,
    });
    return !error && data?.success;
  },

  async forceSubmit(sessionId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('admin_force_submit_session', {
      p_session_id: sessionId,
    });
    return !error && data?.success;
  },

  async unbindDevice(studentId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('admin_unbind_student_device', {
      p_student_id: studentId,
    });
    return !error && data?.success;
  },

  async calculateNtaPercentiles(examId: string): Promise<void> {
    await supabase.rpc('calculate_exam_nta_percentiles', {
      p_exam_id: examId,
    });
  },
};

