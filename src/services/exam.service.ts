import { Exam, ExamAttempt, ExamStatus } from '@/types';
import { supabase } from '@/lib/supabase';

function mapExamRow(e: any): Exam {
  return {
    id: e.id,
    institutionId: e.institution_id,
    title: e.title,
    code: e.code,
    description: e.description || '',
    subjectId: e.subject_id || '',
    subjectName: e.subject_name || '',
    assignedBatchIds: e.assigned_batch_ids || [],
    assignedBatchNames: e.assigned_batch_names || [],
    status: e.status,
    startTime: e.start_time,
    endTime: e.end_time,
    durationMinutes: Number(e.duration_minutes || 60),
    totalMarks: Number(e.total_marks || 100),
    passMarks: Number(e.pass_marks || 40),
    questionCount: Number(e.question_count || 0),
    questionIds: e.question_ids || [],
    negativeMarking: Boolean(e.negative_marking),
    shuffleQuestions: Boolean(e.shuffle_questions),
    showResultsImmediately: Boolean(e.show_results_immediately),
    instructions: e.instructions || [],
    createdBy: e.created_by || '',
    authorName: e.author_name || 'Faculty',
    totalRegisteredStudents: Number(e.total_registered_students || 0),
    totalSubmissions: Number(e.total_submissions || 0),
    averageScore: e.average_score ? Number(e.average_score) : undefined,
    highestScore: e.highest_score ? Number(e.highest_score) : undefined,
    createdAt: e.created_at,
  };
}

export const examService = {
  async getExams(institutionId: string, status?: ExamStatus | 'ALL'): Promise<Exam[]> {
    let query = supabase
      .from('exams')
      .select('*')
      .eq('institution_id', institutionId)
      .order('start_time', { ascending: false });

    if (status && status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching exams:', error);
      return [];
    }

    return (data || []).map(mapExamRow);
  },

  async getExamById(id: string): Promise<Exam | null> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapExamRow(data);
  },

  async createExam(data: Omit<Exam, 'id' | 'createdAt' | 'totalSubmissions'>): Promise<Exam> {
    const payload = {
      institution_id: data.institutionId,
      title: data.title,
      code: data.code,
      description: data.description,
      subject_id: data.subjectId || null,
      subject_name: data.subjectName,
      assigned_batch_ids: data.assignedBatchIds || [],
      assigned_batch_names: data.assignedBatchNames || [],
      status: data.status || 'DRAFT',
      start_time: data.startTime,
      end_time: data.endTime,
      duration_minutes: data.durationMinutes,
      total_marks: data.totalMarks,
      pass_marks: data.passMarks,
      question_count: data.questionCount || (data.questionIds ? data.questionIds.length : 0),
      question_ids: data.questionIds || [],
      negative_marking: data.negativeMarking,
      shuffle_questions: data.shuffleQuestions,
      show_results_immediately: data.showResultsImmediately,
      instructions: data.instructions || [],
      created_by: data.createdBy || null,
      author_name: data.authorName,
      total_registered_students: data.totalRegisteredStudents || 0,
      total_submissions: 0,
    };

    const { data: inserted, error } = await supabase
      .from('exams')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      throw new Error(error.message);
    }

    return mapExamRow(inserted);
  },

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam> {
    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.code !== undefined) payload.code = updates.code;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId || null;
    if (updates.subjectName !== undefined) payload.subject_name = updates.subjectName;
    if (updates.assignedBatchIds !== undefined) payload.assigned_batch_ids = updates.assignedBatchIds;
    if (updates.assignedBatchNames !== undefined) payload.assigned_batch_names = updates.assignedBatchNames;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startTime !== undefined) payload.start_time = updates.startTime;
    if (updates.endTime !== undefined) payload.end_time = updates.endTime;
    if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
    if (updates.totalMarks !== undefined) payload.total_marks = updates.totalMarks;
    if (updates.passMarks !== undefined) payload.pass_marks = updates.passMarks;
    if (updates.questionCount !== undefined) payload.question_count = updates.questionCount;
    if (updates.questionIds !== undefined) payload.question_ids = updates.questionIds;
    if (updates.negativeMarking !== undefined) payload.negative_marking = updates.negativeMarking;
    if (updates.shuffleQuestions !== undefined) payload.shuffle_questions = updates.shuffleQuestions;
    if (updates.showResultsImmediately !== undefined) payload.show_results_immediately = updates.showResultsImmediately;
    if (updates.instructions !== undefined) payload.instructions = updates.instructions;

    const { data: updated, error } = await supabase
      .from('exams')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating exam:', error);
      throw new Error(error.message);
    }

    return mapExamRow(updated);
  },

  async deleteExam(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting exam:', error);
      return false;
    }
    return true;
  },

  async duplicateExam(id: string): Promise<Exam> {
    const original = await this.getExamById(id);
    if (!original) throw new Error('Exam not found');

    const copyData = {
      ...original,
      title: `${original.title} (Copy)`,
      code: `${original.code}-COPY`,
      status: 'DRAFT' as ExamStatus,
      totalRegisteredStudents: 0,
      totalSubmissions: 0,
      averageScore: undefined,
      highestScore: undefined,
    };

    return this.createExam(copyData);
  },

  async getStudentExams(institutionId: string, batchId?: string): Promise<{
    available: Exam[];
    upcoming: Exam[];
    completed: Exam[];
  }> {
    const allExams = await this.getExams(institutionId);
    const batchExams = batchId
      ? allExams.filter(e => e.assignedBatchIds.length === 0 || e.assignedBatchIds.includes(batchId))
      : allExams;

    return {
      available: batchExams.filter(e => e.status === 'LIVE'),
      upcoming: batchExams.filter(e => e.status === 'SCHEDULED'),
      completed: batchExams.filter(e => e.status === 'COMPLETED'),
    };
  },

  async getAttemptsForExam(examId: string): Promise<ExamAttempt[]> {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', examId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching exam attempts:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      examId: a.exam_id,
      examTitle: a.exam_title || '',
      studentId: a.student_id,
      studentUserId: a.student_user_id || '',
      studentName: a.student_name || '',
      batchId: a.batch_id || '',
      batchName: a.batch_name || '',
      institutionId: a.institution_id,
      startedAt: a.started_at,
      submittedAt: a.submitted_at,
      timeSpentMinutes: a.time_spent_minutes || 0,
      status: a.status,
      answers: a.answers || {},
      score: a.score !== null ? Number(a.score) : undefined,
      totalMarks: Number(a.total_marks || 0),
      percentage: a.percentage !== null ? Number(a.percentage) : undefined,
      rank: a.rank,
      isPassed: a.is_passed,
    }));
  },

  async saveAttempt(attempt: ExamAttempt): Promise<ExamAttempt> {
    const payload = {
      id: attempt.id,
      exam_id: attempt.examId,
      exam_title: attempt.examTitle,
      student_id: attempt.studentId,
      student_user_id: attempt.studentUserId,
      student_name: attempt.studentName,
      batch_id: attempt.batchId || null,
      batch_name: attempt.batchName,
      institution_id: attempt.institutionId,
      started_at: attempt.startedAt,
      submitted_at: attempt.submittedAt || null,
      time_spent_minutes: attempt.timeSpentMinutes,
      status: attempt.status,
      answers: attempt.answers || {},
      score: attempt.score,
      total_marks: attempt.totalMarks,
      percentage: attempt.percentage,
      rank: attempt.rank,
      is_passed: attempt.isPassed,
    };

    const { error } = await supabase
      .from('exam_attempts')
      .upsert(payload);

    if (error) {
      console.error('Error saving attempt:', error);
      throw new Error(error.message);
    }

    return attempt;
  },
};
