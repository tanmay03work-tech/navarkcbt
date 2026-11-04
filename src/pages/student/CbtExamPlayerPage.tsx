import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLogo } from '@/components/branding/AppLogo';
import { TimerDisplay } from '@/components/exams/TimerDisplay';
import { QuestionPalette } from '@/components/exams/QuestionPalette';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { questionService } from '@/services/question.service';
import { resultService } from '@/services/result.service';
import { getDeviceFingerprint } from '@/services/cbt/deviceFingerprint';
import { cbtProctorService } from '@/services/cbt/cbtProctorService';
import { CbtProctoringEngine } from '@/services/cbt/cbtProctoringEngine';
import { localCbtEngine } from '@/services/cbt/localCbtEngine';
import { BackgroundSyncWorker, SyncState } from '@/services/cbt/backgroundSyncWorker';
import { isNumericAnswerValid } from '@/utils/numericAnswer';
import { FormattedExamText } from '@/components/common/FormattedExamText';
import { normalizeExamText } from '@/utils/examText';
import { Exam, Question, QuestionPaletteStatus, StudentAnswer, ExamResult } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  RotateCcw,
  Send,
  Cloud,
  RefreshCw,
  WifiOff,
  Shield,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  Lock,
} from 'lucide-react';

export const CbtExamPlayerPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user, institution } = useAuth();

  // Core Data State
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');

  // Candidate Answers & Status State
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [paletteStatuses, setPaletteStatuses] = useState<Record<number, QuestionPaletteStatus>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');

  // CBT Proctoring & Security State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceBlocked, setDeviceBlocked] = useState<boolean>(false);
  const [deviceBlockedMessage, setDeviceBlockedMessage] = useState<string>('');
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningModalMessage, setWarningModalMessage] = useState<string>('');
  const [strikeNumber, setStrikeNumber] = useState<number>(0);
  const [isExamLocked, setIsExamLocked] = useState<boolean>(false);
  const [lockReason, setLockReason] = useState<string>('');
  const [fullscreenPrompt, setFullscreenPrompt] = useState<boolean>(true);

  // Submit Modal
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for Background Workers
  const proctorEngineRef = useRef<CbtProctoringEngine | null>(null);
  const syncWorkerRef = useRef<BackgroundSyncWorker | null>(null);
  const answersRef = useRef<Record<string, StudentAnswer>>({});
  const timeRemainingRef = useRef<number>(0);
  const currentIndexRef = useRef<number>(0);

  // Keep refs synchronized
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (timeRemaining !== null) {
      timeRemainingRef.current = timeRemaining;
    }
  }, [timeRemaining]);

  // Extract distinct subjects/sections for NTA-style section tabs
  const sections = useMemo(() => {
    if (questions.length === 0) return [];
    const distinct = Array.from(new Set(questions.map(q => q.subjectName || 'General')));
    return distinct;
  }, [questions]);

  // Filtered questions based on selected section tab
  const activeQuestions = useMemo(() => {
    if (selectedSection === 'ALL') return questions;
    return questions.filter(q => (q.subjectName || 'General') === selectedSection);
  }, [questions, selectedSection]);

  // Load Exam, Device Binding Gate & Session Startup
  useEffect(() => {
    let isCancelled = false;

    const initializeCbtArena = async () => {
      if (!examId || !institution || !user) return;

      try {
        // 1. Fetch Exam Configuration
        const examData = await examService.getExamById(examId);
        if (!examData) {
          navigate('/student/exams');
          return;
        }
        if (isCancelled) return;
        setExam(examData);

        // 2. Fetch Questions
        const qList = await questionService.getQuestions(examData.institutionId);
        const examQs = qList.filter(q => examData.questionIds.includes(q.id));
        if (isCancelled) return;
        setQuestions(examQs);

        // Set default section
        if (examQs.length > 0 && examQs[0].subjectName) {
          setSelectedSection(examQs[0].subjectName);
        }

        // 3. Hardware & Browser Device Binding Check
        const fingerprint = await getDeviceFingerprint();
        const deviceVerification = await cbtProctorService.verifyDevice(
          institution.id,
          user.id,
          fingerprint,
          navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Workstation'
        );

        if (!deviceVerification.success && deviceVerification.status === 'LOCKED_TO_ANOTHER_DEVICE') {
          setDeviceBlocked(true);
          setDeviceBlockedMessage(
            deviceVerification.message ||
              'Your examination is locked to another physical computer or browser. Please contact your proctor to unbind your previous session.'
          );
          return;
        }

        // 4. Start or Resume Live Session in Supabase
        const sessionResult = await cbtProctorService.startOrResumeSession(
          institution.id,
          examData.id,
          user.id,
          fingerprint,
          examData.durationMinutes
        );

        if (!sessionResult.success) {
          console.warn('Session startup notice:', sessionResult.error);
        }

        const sid = sessionResult.session?.id || `sess_${examData.id}_${user.id}`;
        setSessionId(sid);

        // 5. Disaster Recovery Engine: Check Local Cache vs Server Recovery
        const localCached = localCbtEngine.loadLocalSession(examData.id, user.id);
        const serverRecoveredAnswers = sessionResult.recoveredAnswers || {};

        let initialAnswers: Record<string, StudentAnswer> = {};
        if (localCached && Object.keys(localCached.answers).length > 0) {
          initialAnswers = localCached.answers;
        } else if (Object.keys(serverRecoveredAnswers).length > 0) {
          initialAnswers = serverRecoveredAnswers as Record<string, StudentAnswer>;
        }

        // Reconstruct Palette Statuses
        const initialPalette: Record<number, QuestionPaletteStatus> = {};
        examQs.forEach((q, idx) => {
          const ans = initialAnswers[q.id];
          if (ans) {
            initialPalette[idx] = ans.paletteStatus;
          } else if (idx === 0) {
            initialPalette[0] = 'VISITED';
          } else {
            initialPalette[idx] = 'NOT_VISITED';
          }
        });

        setAnswers(initialAnswers);
        setPaletteStatuses(initialPalette);

        // Determine Time Remaining (Server session time or full exam duration)
        const initialSeconds =
          sessionResult.timeRemainingSeconds && sessionResult.timeRemainingSeconds > 0
            ? sessionResult.timeRemainingSeconds
            : localCached && localCached.timeRemainingSeconds > 0
            ? localCached.timeRemainingSeconds
            : examData.durationMinutes * 60;

        setTimeRemaining(initialSeconds);
        timeRemainingRef.current = initialSeconds;

        // Restore active question index if available
        if (localCached && localCached.currentQuestionIndex < examQs.length) {
          setCurrentIndex(localCached.currentQuestionIndex);
        }

        // 6. Launch Anti-Cheat Proctoring Engine
        const initialViolations = sessionResult.violationsCount || 0;
        const proctor = new CbtProctoringEngine(
          sid,
          institution.id,
          user.id,
          initialViolations,
          {
            onWarning: (strike, msg) => {
              setStrikeNumber(strike);
              setWarningModalMessage(msg);
              setWarningModalOpen(true);
            },
            onLockSession: (reason) => {
              setIsExamLocked(true);
              setLockReason(reason);
              // Trigger auto-submit when locked due to violations
              setTimeout(() => {
                handleFinalSubmit();
              }, 3000);
            },
          }
        );
        proctorEngineRef.current = proctor;
        proctor.startMonitoring();

        // 7. Launch 10-Second Delta Background Sync Worker
        const syncWorker = new BackgroundSyncWorker({
          sessionId: sid,
          institutionId: institution.id,
          examId: examData.id,
          studentId: user.id,
          getTimeRemainingSeconds: () => timeRemainingRef.current,
          getCurrentQIndex: () => currentIndexRef.current,
          getAttemptedCount: () => Object.values(answersRef.current).filter(a => a.selectedOptionIds.length > 0 || !!a.textResponse?.trim()).length,
          getUnattemptedCount: () => examQs.length - Object.values(answersRef.current).filter(a => a.selectedOptionIds.length > 0 || !!a.textResponse?.trim()).length,
          getFlaggedCount: () => Object.values(answersRef.current).filter(a => a.paletteStatus === 'MARKED_FOR_REVIEW' || a.paletteStatus === 'ANSWERED_AND_MARKED').length,
          getAllAnswers: () => answersRef.current,
          onSyncStateChange: (state, lastDate) => {
            setSyncState(state);
            if (lastDate) {
              setLastSavedTime(lastDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            }
          },
        });
        syncWorkerRef.current = syncWorker;
        syncWorker.start();
      } catch (err) {
        console.error('CBT arena initialization error:', err);
      }
    };

    initializeCbtArena();

    return () => {
      isCancelled = true;
      if (proctorEngineRef.current) {
        proctorEngineRef.current.stopMonitoring();
      }
      if (syncWorkerRef.current) {
        syncWorkerRef.current.stop();
      }
    };
  }, [examId, institution, user, navigate]);

  // Current Question
  const currentQ = questions[currentIndex];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  // Persist State to Local Disaster Recovery Cache
  const saveDisasterRecoveryState = (
    updatedAnswers: Record<string, StudentAnswer>,
    nextQIndex: number
  ) => {
    if (!exam || !user || !sessionId) return;
    localCbtEngine.saveLocalSession({
      sessionId,
      examId: exam.id,
      studentId: user.id,
      answers: updatedAnswers,
      timeRemainingSeconds: timeRemainingRef.current,
      currentQuestionIndex: nextQIndex,
      currentSectionIndex: 0,
      version: Date.now(),
      violationsCount: strikeNumber,
      lastSavedAt: new Date().toISOString(),
      isSubmitted: false,
    });
  };

  // Handle Option Selection (Single & Multiple Choice)
  const handleSelectOption = (optId: string) => {
    if (!currentQ || isExamLocked) return;

    let updatedAns: StudentAnswer;
    if (currentQ.type === 'SINGLE_CHOICE') {
      updatedAns = {
        questionId: currentQ.id,
        selectedOptionIds: [optId],
        paletteStatus: 'ANSWERED',
        timeSpentSeconds: (answers[currentQ.id]?.timeSpentSeconds || 0) + 2,
      };
    } else {
      const existing = answers[currentQ.id]?.selectedOptionIds || [];
      const updated = existing.includes(optId)
        ? existing.filter(id => id !== optId)
        : [...existing, optId];

      updatedAns = {
        questionId: currentQ.id,
        selectedOptionIds: updated,
        paletteStatus: updated.length > 0 ? 'ANSWERED' : 'VISITED',
        timeSpentSeconds: (answers[currentQ.id]?.timeSpentSeconds || 0) + 2,
      };
    }

    const newAnswers = { ...answers, [currentQ.id]: updatedAns };
    setAnswers(newAnswers);
    saveDisasterRecoveryState(newAnswers, currentIndex);
  };

  // Handle Numerical Input
  const handleNumericalInput = (val: string) => {
    if (!currentQ || isExamLocked) return;
    const cleanVal = val.replace(/[^0-9.-]/g, '');

    const updatedAns: StudentAnswer = {
      questionId: currentQ.id,
      selectedOptionIds: [],
      textResponse: cleanVal,
      paletteStatus: cleanVal.trim() ? 'ANSWERED' : 'VISITED',
      timeSpentSeconds: (answers[currentQ.id]?.timeSpentSeconds || 0) + 2,
    };

    const newAnswers = { ...answers, [currentQ.id]: updatedAns };
    setAnswers(newAnswers);
    saveDisasterRecoveryState(newAnswers, currentIndex);
  };

  // Clear Current Response
  const handleClearResponse = () => {
    if (!currentQ || isExamLocked) return;
    const updatedAnswers = { ...answers };
    delete updatedAnswers[currentQ.id];
    setAnswers(updatedAnswers);
    setPaletteStatuses(prev => ({ ...prev, [currentIndex]: 'VISITED' }));
    saveDisasterRecoveryState(updatedAnswers, currentIndex);
  };

  // Save & Next
  const handleSaveAndNext = () => {
    if (!currentQ || isExamLocked) return;
    const ans = answers[currentQ.id];
    const hasAnswer = ans && (ans.selectedOptionIds.length > 0 || !!ans.textResponse?.trim());

    setPaletteStatuses(prev => ({
      ...prev,
      [currentIndex]: hasAnswer ? 'ANSWERED' : 'VISITED',
    }));

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setPaletteStatuses(prev => {
        if (!prev[nextIndex] || prev[nextIndex] === 'NOT_VISITED') {
          return { ...prev, [nextIndex]: 'VISITED' };
        }
        return prev;
      });

      // Update Section Tab if moving into a question of a different section
      const nextQ = questions[nextIndex];
      if (nextQ?.subjectName && nextQ.subjectName !== selectedSection && selectedSection !== 'ALL') {
        setSelectedSection(nextQ.subjectName);
      }

      saveDisasterRecoveryState(answers, nextIndex);
    } else {
      saveDisasterRecoveryState(answers, currentIndex);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQ || isExamLocked) return;
    const ans = answers[currentQ.id];
    const hasAnswer = ans && (ans.selectedOptionIds.length > 0 || !!ans.textResponse?.trim());

    setPaletteStatuses(prev => ({
      ...prev,
      [currentIndex]: hasAnswer ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW',
    }));

    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setPaletteStatuses(prev => {
        if (!prev[nextIndex] || prev[nextIndex] === 'NOT_VISITED') {
          return { ...prev, [nextIndex]: 'VISITED' };
        }
        return prev;
      });

      const nextQ = questions[nextIndex];
      if (nextQ?.subjectName && nextQ.subjectName !== selectedSection && selectedSection !== 'ALL') {
        setSelectedSection(nextQ.subjectName);
      }

      saveDisasterRecoveryState(answers, nextIndex);
    } else {
      saveDisasterRecoveryState(answers, currentIndex);
    }
  };

  // Select Question directly from Question Palette
  const handleSelectFromPalette = (index: number) => {
    if (!currentQ || isExamLocked || index < 0 || index >= questions.length) return;

    // Preserve status of leaving question
    const ans = answers[currentQ.id];
    const hasAnswer = ans && (ans.selectedOptionIds.length > 0 || !!ans.textResponse?.trim());
    const currentStatus = paletteStatuses[currentIndex];

    if (currentStatus !== 'MARKED_FOR_REVIEW' && currentStatus !== 'ANSWERED_AND_MARKED') {
      setPaletteStatuses(prev => ({
        ...prev,
        [currentIndex]: hasAnswer ? 'ANSWERED' : 'VISITED',
      }));
    }

    setCurrentIndex(index);
    setPaletteStatuses(prev => {
      if (!prev[index] || prev[index] === 'NOT_VISITED') {
        return { ...prev, [index]: 'VISITED' };
      }
      return prev;
    });

    const targetQ = questions[index];
    if (targetQ?.subjectName && targetQ.subjectName !== selectedSection && selectedSection !== 'ALL') {
      setSelectedSection(targetQ.subjectName);
    }

    saveDisasterRecoveryState(answers, index);
  };

  // Switch Section Tab
  const handleSectionTabClick = (sectionName: string) => {
    setSelectedSection(sectionName);
    // Find the first question belonging to this section and focus it
    if (sectionName !== 'ALL') {
      const targetIdx = questions.findIndex(q => q.subjectName === sectionName);
      if (targetIdx !== -1) {
        handleSelectFromPalette(targetIdx);
      }
    }
  };

  // Request Fullscreen
  const handleEnterFullscreen = async () => {
    if (proctorEngineRef.current) {
      await proctorEngineRef.current.requestFullscreen();
    }
    setFullscreenPrompt(false);
  };

  // Final Exam Submission (Evaluated with Supabase RPC + Percentile calculation)
  const handleFinalSubmit = async () => {
    if (!exam || !user || !institution || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Flush any pending answer sync immediately
      if (syncWorkerRef.current) {
        await syncWorkerRef.current.performSync(true);
        syncWorkerRef.current.stop();
      }
      if (proctorEngineRef.current) {
        proctorEngineRef.current.stopMonitoring();
      }

      // 2. Client-side evaluation with Numerical Tolerance
      let totalScore = 0;
      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      const subjectScores: Record<string, { score: number; totalMarks: number; correct: number; incorrect: number }> = {};

      questions.forEach((q) => {
        const sub = q.subjectName || 'General';
        if (!subjectScores[sub]) {
          subjectScores[sub] = { score: 0, totalMarks: 0, correct: 0, incorrect: 0 };
        }
        subjectScores[sub].totalMarks += q.positiveMarks;

        const ans = answers[q.id];
        if (!ans || (ans.selectedOptionIds.length === 0 && !ans.textResponse?.trim())) {
          unattemptedCount++;
          return;
        }

        let isCorrect = false;
        if (q.type === 'NUMERICAL') {
          isCorrect = isNumericAnswerValid(ans.textResponse || '', q.correctAnswerText || '');
        } else {
          const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o.id);
          const selected = ans.selectedOptionIds;
          isCorrect =
            correctOptionIds.length === selected.length &&
            correctOptionIds.every(id => selected.includes(id));
        }

        if (isCorrect) {
          totalScore += q.positiveMarks;
          correctCount++;
          subjectScores[sub].score += q.positiveMarks;
          subjectScores[sub].correct++;
        } else {
          const neg = exam.negativeMarking ? (Number(q.negativeMarks) || 0) : 0;
          totalScore -= neg;
          incorrectCount++;
          subjectScores[sub].score -= neg;
          subjectScores[sub].incorrect++;
        }
      });

      // Clamp total score to min 0 (standard testing format)
      totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
      const computedTotalMarks = exam.totalMarks || (questions.length * 4);
      const percentage = computedTotalMarks > 0
        ? Number(((totalScore / computedTotalMarks) * 100).toFixed(1))
        : 0;
      const accuracy = correctCount + incorrectCount > 0
        ? Number(((correctCount / (correctCount + incorrectCount)) * 100).toFixed(1))
        : 0;

      const subjectBreakdown = Object.entries(subjectScores).map(([name, data]) => ({
        subjectName: name,
        score: Math.max(0, Math.round(data.score * 100) / 100),
        totalMarks: data.totalMarks,
        percentage: data.totalMarks > 0 ? Number(((Math.max(0, data.score) / data.totalMarks) * 100).toFixed(1)) : 0,
      }));

      // 3. Save Attempt & Result into Supabase
      const resultRecord: ExamResult = {
        id: `res-${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        examCode: exam.code,
        studentId: user.id,
        studentUserId: user.userId,
        studentName: user.name,
        batchId: user.batchId || 'batch-1',
        batchName: user.batchName || 'Default Cohort',
        institutionId: institution.id,
        submittedAt: new Date().toISOString(),
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage,
        isPassed: totalScore >= exam.passMarks,
        rank: 1,
        totalParticipants: Math.max(1, exam.totalRegisteredStudents || 1),
        correctAnswersCount: correctCount,
        incorrectAnswersCount: incorrectCount,
        unattemptedCount,
        timeTakenMinutes: Math.min(
          exam.durationMinutes,
          Math.max(1, Math.round((exam.durationMinutes * 60 - timeRemainingRef.current) / 60))
        ),
        accuracy,
        subjectBreakdown,
      };

      await resultService.recordResult(resultRecord);

      // Save attempt to exam_attempts table
      await examService.saveAttempt({
        id: sessionId || `att-${Date.now()}`,
        examId: exam.id,
        examTitle: exam.title,
        studentId: user.id,
        studentUserId: user.userId,
        studentName: user.name,
        batchId: user.batchId || 'batch-1',
        batchName: user.batchName || 'Default Cohort',
        institutionId: institution.id,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        timeSpentMinutes: Math.round((exam.durationMinutes * 60 - timeRemainingRef.current) / 60),
        status: isExamLocked ? 'AUTO_SUBMITTED' : 'SUBMITTED',
        answers,
        score: totalScore,
        totalMarks: exam.totalMarks,
        percentage,
        isPassed: totalScore >= exam.passMarks,
      });

      // Trigger NTA percentile computation
      try {
        await cbtProctorService.calculateNtaPercentiles(exam.id);
      } catch (e) {
        console.warn('Percentile compute deferred:', e);
      }

      // 4. Clear Local Disaster Cache for this completed exam
      localCbtEngine.clearLocalSession(exam.id, user.id);

      setIsSubmitting(false);
      navigate(`/student/exams/${exam.id}/submitted`);
    } catch (err) {
      console.error('Final submission error:', err);
      setIsSubmitting(false);
      // Still navigate gracefully to submitted screen
      navigate(`/student/exams/${exam.id}/submitted`);
    }
  };

  // Counts for Final Confirmation
  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(
      a => a.selectedOptionIds.length > 0 || !!a.textResponse?.trim()
    ).length;
  }, [answers]);

  const markedCount = useMemo(() => {
    return Object.values(paletteStatuses).filter(
      s => s === 'MARKED_FOR_REVIEW' || s === 'ANSWERED_AND_MARKED'
    ).length;
  }, [paletteStatuses]);

  const unansweredCount = questions.length - answeredCount;

  // 1. Device Blocked Security Screen
  if (deviceBlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFFBF5] p-6 text-foreground select-none">
        <Card className="max-w-md w-full border-rose-300 bg-white shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-[#481D1A]">Device Security Lockout</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {deviceBlockedMessage}
            </p>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
              <p className="font-semibold">Security Policy Enforcement:</p>
              <p>• Navark CBT binds each candidate to a single authenticated workstation.</p>
              <p>• Switching machines or running dual sessions is prohibited.</p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => navigate('/student/exams')}
                className="w-full bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold"
              >
                Return to Exam Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Loading State
  if (!exam || !currentQ || timeRemaining === null) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFBF5] text-foreground">
        <div className="h-10 w-10 border-4 border-[#481D1A] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-[#481D1A]">Loading CBT Examination Arena...</p>
        <p className="text-xs text-muted-foreground mt-1">Verifying device security & synchronizing paper state</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FFFBF5] text-foreground select-none overflow-hidden">
      {/* Top Banner Header */}
      <header className="h-14 border-b border-[#E7DCD3] bg-white px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <AppLogo size="sm" showText={false} linkToHome={false} />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-[#481D1A] truncate max-w-[200px] sm:max-w-md">
              {exam.title}
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">
              {institution?.name} • Code: {exam.code}
            </p>
          </div>
        </div>

        {/* Center: Live Background Sync Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-medium bg-[#FFFBF5]">
          {syncState === 'SYNCING' && (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-600 animate-spin" />
              <span className="text-amber-700">Syncing responses...</span>
            </>
          )}
          {syncState === 'SYNCED' && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">All answers saved ({lastSavedTime})</span>
            </>
          )}
          {syncState === 'OFFLINE_BUFFER' && (
            <>
              <WifiOff className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-rose-700 font-semibold">Offline (Buffered locally)</span>
            </>
          )}
          {syncState === 'IDLE' && (
            <>
              <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Ready</span>
            </>
          )}
        </div>

        {/* Right: Timer & Submit Button */}
        <div className="flex items-center gap-3">
          <TimerDisplay
            totalSeconds={exam.durationMinutes * 60}
            initialSeconds={timeRemaining}
            onTick={(sec) => {
              timeRemainingRef.current = sec;
            }}
            onTimeExpired={handleFinalSubmit}
          />
          <Button
            size="sm"
            onClick={() => setSubmitDialogOpen(true)}
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-4 shadow-sm"
          >
            Submit Exam
          </Button>
        </div>
      </header>

      {/* Multi-Section NTA Navigation Bar */}
      {sections.length > 0 && (
        <div className="h-10 bg-stone-100 border-b border-[#E7DCD3] px-4 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1">
            Sections:
          </span>
          {sections.map((secName) => {
            const count = questions.filter(q => q.subjectName === secName).length;
            const isSelected = selectedSection === secName;
            return (
              <button
                key={secName}
                onClick={() => handleSectionTabClick(secName)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#481D1A] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-[#E7DCD3] hover:bg-stone-50'
                }`}
              >
                <span>{secName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-stone-200 text-stone-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => handleSectionTabClick('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 ${
              selectedSection === 'ALL'
                ? 'bg-[#481D1A] text-white'
                : 'text-stone-600 hover:text-[#481D1A]'
            }`}
          >
            View All ({questions.length})
          </button>
        </div>
      )}

      {/* Main CBT Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question Arena (75% on desktop) */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 border-r border-[#E7DCD3]">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E7DCD3]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-[#481D1A]">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs text-muted-foreground">of {questions.length}</span>
              <Badge variant="outline" className="text-[10px] font-semibold ml-2 border-[#481D1A]/30 text-[#481D1A]">
                {currentQ.subjectName}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {currentQ.topic}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] font-mono ${
                  currentQ.type === 'NUMERICAL' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {currentQ.type === 'NUMERICAL' ? 'NUMERICAL VALUE' : currentQ.type}
              </Badge>
            </div>

            <div className="text-xs font-semibold text-[#481D1A]">
              Marking: <span className="text-emerald-700 font-bold">+{currentQ.positiveMarks}</span> / <span className="text-rose-700 font-bold">-{currentQ.negativeMarks}</span>
            </div>
          </div>

          {/* Question Content & Input */}
          <div className="py-6 flex-1 space-y-6">
            {/* Question Text */}
            <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
              <FormattedExamText text={currentQ.text} />
            </div>

            {/* Optional Embedded Diagram / Image */}
            {currentQ.imageUrl && (
              <div className="my-4 p-2 rounded-xl bg-white border border-[#E7DCD3] inline-block max-w-full shadow-xs">
                <img
                  src={currentQ.imageUrl}
                  alt="Question Diagram"
                  className="max-h-80 w-auto rounded object-contain cursor-pointer hover:opacity-95"
                  onClick={() => {
                    const w = window.open('', '_blank');
                    if (w) {
                      w.document.write(`<img src="${currentQ.imageUrl}" style="max-width:100%;height:auto;margin:auto;display:block;" />`);
                    }
                  }}
                  title="Click to view full size image"
                />
              </div>
            )}

            {/* Numerical Input Area */}
            {currentQ.type === 'NUMERICAL' ? (
              <div className="p-4 rounded-xl bg-white border border-[#E7DCD3] max-w-sm space-y-3 shadow-xs">
                <label className="block text-xs font-bold text-[#481D1A]">
                  Enter Numerical Answer (Keypad / Decimals):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={currentAnswer?.textResponse || ''}
                    onChange={(e) => handleNumericalInput(e.target.value)}
                    placeholder="e.g. 14.5 or -3.2"
                    className="w-full text-lg font-mono p-2.5 rounded-lg border border-input focus:ring-2 focus:ring-[#481D1A] outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  * Note: Answers evaluated up to 2 decimal places with ±0.05 tolerance.
                </p>
              </div>
            ) : (
              /* MCQ Option List */
              <div className="space-y-3 max-w-2xl">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = currentAnswer?.selectedOptionIds.includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 text-xs sm:text-sm ${
                        isSelected
                          ? 'border-[#481D1A] bg-[#481D1A]/5 shadow-xs font-semibold text-[#481D1A]'
                          : 'border-[#E7DCD3] bg-white hover:bg-[#FFFBF5]'
                      }`}
                    >
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#481D1A] text-white border-[#481D1A]'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{normalizeExamText(opt.text)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Action Controls Footer */}
          <div className="pt-4 border-t border-[#E7DCD3] flex flex-wrap items-center justify-between gap-3 bg-[#FFFBF5]">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearResponse}
                className="text-xs border-stone-300 text-stone-700 hover:bg-stone-100"
              >
                Clear Response
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkForReviewAndNext}
                className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Mark for Review & Next
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIndex === 0}
                onClick={() => handleSelectFromPalette(currentIndex - 1)}
                className="text-xs gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <Button
                size="sm"
                onClick={handleSaveAndNext}
                className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-5 gap-1 shadow-sm"
              >
                <span>Save & Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Question Palette Sidebar (25% on desktop) */}
        <div className="w-80 hidden lg:flex flex-col bg-white p-4 overflow-y-auto border-l border-[#E7DCD3]">
          {/* Candidate Profile summary */}
          <div className="flex items-center gap-3 pb-3 border-b border-[#E7DCD3]">
            <div className="h-9 w-9 rounded-full bg-[#481D1A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#481D1A] truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono">ID: {user?.userId}</p>
            </div>
          </div>

          {/* Interactive Question Palette */}
          <div className="py-4 flex-1">
            <QuestionPalette
              totalQuestions={questions.length}
              currentQuestionIndex={currentIndex}
              questionStatuses={paletteStatuses}
              onSelectQuestion={handleSelectFromPalette}
            />
          </div>

          {/* Security & Proctoring Status Indicator */}
          <div className="p-3 rounded-lg bg-stone-50 border border-[#E7DCD3] text-[11px] space-y-1">
            <div className="flex items-center justify-between font-bold text-[#481D1A]">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                Active Proctoring
              </span>
              <span className={strikeNumber > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                Strikes: {strikeNumber} / 3
              </span>
            </div>
            <p className="text-muted-foreground text-[10px]">
              Fullscreen locked. Tab switching and blur events are continuously recorded.
            </p>
          </div>
        </div>
      </div>

      {/* Fullscreen Prompt Dialog (on initial entry) */}
      <Dialog open={fullscreenPrompt} onOpenChange={setFullscreenPrompt}>
        <DialogContent className="bg-white border-[#E7DCD3] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#481D1A]">
              <Maximize2 className="h-5 w-5 text-[#481D1A]" />
              Enter Fullscreen Secure Arena
            </DialogTitle>
            <DialogDescription className="text-xs">
              This examination requires full-screen distraction-free mode.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs text-muted-foreground">
            <p>
              By proceeding, the examination arena will occupy your full screen. Pressing Esc, minimizing, or switching to other browser tabs or applications will trigger a security violation strike.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={handleEnterFullscreen}
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold"
            >
              Start Fullscreen Examination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proctoring Warning Strike Modal (Unclosable without acknowledgement) */}
      <Dialog open={warningModalOpen} onOpenChange={() => {}}>
        <DialogContent className="bg-white border-rose-300 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="h-5 w-5 text-rose-600" />
              Proctoring Security Alert (Violation #{strikeNumber})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
              {warningModalMessage}
            </div>
            <p className="text-muted-foreground text-[11px]">
              Every tab switch, window resize, or application switch is logged to the examination proctor console with an exact timestamp. Please remain on the test screen until you submit your test.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setWarningModalOpen(false);
                if (proctorEngineRef.current) {
                  proctorEngineRef.current.requestFullscreen();
                }
              }}
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold"
            >
              I Understand & Resume Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Final Exam Submission Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="bg-white border-[#E7DCD3] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base text-[#481D1A]">Submit Final Examination</DialogTitle>
            <DialogDescription className="text-xs">
              Review your question status breakdown before completing your attempt:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Answered</span>
                <span className="text-lg font-extrabold text-emerald-900">{answeredCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-800 uppercase font-bold block">Unanswered</span>
                <span className="text-lg font-extrabold text-rose-900">{unansweredCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-purple-800 uppercase font-bold block">Marked</span>
                <span className="text-lg font-extrabold text-purple-900">{markedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <p className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-[11px]">
                Caution: You have {unansweredCount} unanswered questions remaining in this paper.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSubmitDialogOpen(false)}
              className="text-xs"
            >
              Resume Answering
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-4"
            >
              {isSubmitting ? 'Evaluating & Submitting...' : 'Yes, Submit Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
