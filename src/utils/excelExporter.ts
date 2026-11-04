/**
 * Institutional CBT Result & Gradebook CSV/Excel Export Engine
 * Full Parity with MIITJEE Digital:
 * - Official NTA / Cohort Percentile Calculation: (count <= score / N) * 100.0
 * - Multi-tier tie-breaking ranking:
 *   1. Total Score (DESC)
 *   2. Wrong Answers count (ASC - fewer negative marks prioritized)
 *   3. Subject scores (Physics DESC, Chemistry DESC, Mathematics/Biology DESC)
 *   4. Submission Timestamp (ASC - earlier submission wins)
 * - Per-subject breakdown (correct, wrong, unattempted, score)
 * - Safe CSV escaping (RFC 4180 standard)
 * - In-browser automated CSV file download trigger
 */

import { ExamResult } from '@/types';

export interface SubjectScoreBreakdown {
  correct: number;
  wrong: number;
  unattempted: number;
  score: number;
}

export interface FullStudentResultExportRow {
  studentId: string;
  studentName: string;
  examTitle: string;
  attemptStatus: string;
  physics: SubjectScoreBreakdown;
  chemistry: SubjectScoreBreakdown;
  mathsBio: SubjectScoreBreakdown;
  totalCorrect: number;
  totalWrong: number;
  totalUnattempted: number;
  totalScore: number;
  percentile: number;
  rank: number;
  submittedAt: string;
}

export interface LegacyExportRecord {
  rank: number;
  studentId: string;
  studentName: string;
  batchName: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattemptedAnswers: number;
  accuracy: number;
  percentile: number;
  submittedAt: string;
}

export function escapeCsvValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Computes exact N-based percentile:
 * Percentile = (Count of candidates with score <= candidate_score / total_candidates) * 100.0
 * 
 * Computes rank with tie-breaking rules:
 * 1. Total Score DESC
 * 2. Wrong Count ASC (fewer negative marks)
 * 3. Physics Score DESC
 * 4. Chemistry Score DESC
 * 5. Maths/Bio Score DESC
 * 6. SubmittedAt ASC (earlier submission)
 */
export function calculateFullLeaderboardAndRanks(
  rawResults: Array<{
    studentId: string;
    studentName: string;
    examTitle: string;
    attemptStatus: string;
    physics: SubjectScoreBreakdown;
    chemistry: SubjectScoreBreakdown;
    mathsBio: SubjectScoreBreakdown;
    submittedAt: string;
  }>
): FullStudentResultExportRow[] {
  const candidateCount = rawResults.length;
  if (candidateCount === 0) return [];

  // Compute total scores & counts
  const processed = rawResults.map((r) => {
    const totalCorrect = r.physics.correct + r.chemistry.correct + r.mathsBio.correct;
    const totalWrong = r.physics.wrong + r.chemistry.wrong + r.mathsBio.wrong;
    const totalUnattempted = r.physics.unattempted + r.chemistry.unattempted + r.mathsBio.unattempted;
    const totalScore = r.physics.score + r.chemistry.score + r.mathsBio.score;

    return {
      ...r,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      totalScore,
    };
  });

  // Sort candidates strictly by tie-breaker rules
  const sorted = [...processed].sort((a, b) => {
    // 1. Total score DESC
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // 2. Wrong count ASC (fewer wrong is better)
    if (a.totalWrong !== b.totalWrong) return a.totalWrong - b.totalWrong;
    // 3. Physics score DESC
    if (b.physics.score !== a.physics.score) return b.physics.score - a.physics.score;
    // 4. Chemistry score DESC
    if (b.chemistry.score !== a.chemistry.score) return b.chemistry.score - a.chemistry.score;
    // 5. Maths/Bio score DESC
    if (b.mathsBio.score !== a.mathsBio.score) return b.mathsBio.score - a.mathsBio.score;
    // 6. SubmittedAt ASC (earlier submission)
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  // Calculate N-based percentile and rank
  return sorted.map((candidate, idx) => {
    const rank = idx + 1;

    // Count candidates with score <= candidate.totalScore
    const countLessThanOrEqual = processed.filter((other) => other.totalScore <= candidate.totalScore).length;
    const rawPercentile = (countLessThanOrEqual / candidateCount) * 100.0;
    const percentile = Math.round(rawPercentile * 100) / 100;

    return {
      ...candidate,
      rank,
      percentile,
    };
  });
}

export function generateFullResultsCsv(rows: FullStudentResultExportRow[]): string {
  const headers = [
    'Rank',
    'Student ID',
    'Student Full Name',
    'Exam Title',
    'Attempt Status',
    'Physics Correct',
    'Physics Wrong',
    'Physics Unattempted',
    'Physics Score',
    'Chemistry Correct',
    'Chemistry Wrong',
    'Chemistry Unattempted',
    'Chemistry Score',
    'Maths/Bio Correct',
    'Maths/Bio Wrong',
    'Maths/Bio Unattempted',
    'Maths/Bio Score',
    'Total Correct',
    'Total Wrong',
    'Total Unattempted',
    'Total Score',
    'Percentile',
    'Submitted At',
  ];

  const lines = [headers.map(escapeCsvValue).join(',')];

  rows.forEach((r) => {
    const rowValues = [
      r.rank,
      r.studentId,
      r.studentName,
      r.examTitle,
      r.attemptStatus,
      r.physics.correct,
      r.physics.wrong,
      r.physics.unattempted,
      r.physics.score,
      r.chemistry.correct,
      r.chemistry.wrong,
      r.chemistry.unattempted,
      r.chemistry.score,
      r.mathsBio.correct,
      r.mathsBio.wrong,
      r.mathsBio.unattempted,
      r.mathsBio.score,
      r.totalCorrect,
      r.totalWrong,
      r.totalUnattempted,
      r.totalScore,
      r.percentile,
      r.submittedAt,
    ];
    lines.push(rowValues.map(escapeCsvValue).join(','));
  });

  return lines.join('\n');
}

export function generateResultsCsv(records: LegacyExportRecord[]): string {
  const headers = [
    'Rank',
    'Student ID',
    'Student Full Name',
    'Batch Name',
    'Total Score',
    'Max Score',
    'Correct Answers',
    'Wrong Answers',
    'Unattempted Answers',
    'Accuracy (%)',
    'Percentile',
    'Submitted At',
  ];

  const lines = [headers.map(escapeCsvValue).join(',')];

  records.forEach((record) => {
    const row = [
      record.rank,
      record.studentId,
      record.studentName,
      record.batchName,
      record.score,
      record.maxScore,
      record.correctAnswers,
      record.wrongAnswers,
      record.unattemptedAnswers,
      record.accuracy,
      record.percentile,
      record.submittedAt,
    ];
    lines.push(row.map(escapeCsvValue).join(','));
  });

  return lines.join('\n');
}

/**
 * Triggers a browser download of the generated CSV content
 */
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * High-level exporter taking existing ExamResult array, computing ranks and percentiles,
 * and downloading the CSV file directly.
 */
export function exportExamResultsToCsv(results: ExamResult[], examTitle = 'Institutional_Exam'): void {
  if (results.length === 0) {
    alert('No results available to export.');
    return;
  }

  const candidateCount = results.length;

  // Compute NTA percentiles and tie-breaking ranks
  const sorted = [...results].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.incorrectAnswersCount !== b.incorrectAnswersCount) {
      return a.incorrectAnswersCount - b.incorrectAnswersCount;
    }
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  const exportRecords: LegacyExportRecord[] = sorted.map((res, index) => {
    const countLessThanOrEqual = results.filter((other) => other.score <= res.score).length;
    const percentile = Math.round(((countLessThanOrEqual / candidateCount) * 100) * 100) / 100;

    return {
      rank: index + 1,
      studentId: res.studentUserId || res.studentId,
      studentName: res.studentName,
      batchName: res.batchName || 'General',
      score: res.score,
      maxScore: res.totalMarks,
      correctAnswers: res.correctAnswersCount,
      wrongAnswers: res.incorrectAnswersCount,
      unattemptedAnswers: res.unattemptedCount,
      accuracy: res.accuracy,
      percentile,
      submittedAt: res.submittedAt,
    };
  });

  const csvContent = generateResultsCsv(exportRecords);
  const safeTitle = examTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadCsvFile(csvContent, `Navark_CBT_${safeTitle}_Results_${dateStr}.csv`);
}

