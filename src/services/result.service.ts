import { ExamResult, StudyMaterial, Announcement, AppNotification } from '@/types';
import { supabase } from '@/lib/supabase';

function mapResultRow(r: any): ExamResult {
  return {
    id: r.id,
    examId: r.exam_id,
    examTitle: r.exam_title || '',
    examCode: r.exam_code || '',
    studentId: r.student_id,
    studentUserId: r.student_user_id || '',
    studentName: r.student_name || '',
    batchId: r.batch_id || '',
    batchName: r.batch_name || '',
    institutionId: r.institution_id,
    submittedAt: r.submitted_at,
    score: Number(r.score || 0),
    totalMarks: Number(r.total_marks || 0),
    percentage: Number(r.percentage || 0),
    isPassed: Boolean(r.is_passed),
    rank: Number(r.rank || 1),
    totalParticipants: Number(r.total_participants || 1),
    correctAnswersCount: Number(r.correct_answers_count || 0),
    incorrectAnswersCount: Number(r.incorrect_answers_count || 0),
    unattemptedCount: Number(r.unattempted_count || 0),
    timeTakenMinutes: Number(r.time_taken_minutes || 0),
    accuracy: Number(r.accuracy || 0),
    subjectBreakdown: r.subject_breakdown || [],
  };
}

export const resultService = {
  async getResultsByInstitution(institutionId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('institution_id', institutionId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      return [];
    }

    return (data || []).map(mapResultRow);
  },

  async getStudentResults(studentId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching student results:', error);
      return [];
    }

    return (data || []).map(mapResultRow);
  },

  async getResultById(id: string): Promise<ExamResult | null> {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapResultRow(data);
  },

  async recordResult(result: ExamResult): Promise<ExamResult> {
    // 1. Ensure or upsert attempt row
    const attemptId = result.id;
    await supabase.from('exam_attempts').upsert({
      id: attemptId,
      institution_id: result.institutionId,
      exam_id: result.examId,
      exam_title: result.examTitle,
      student_id: result.studentId,
      student_user_id: result.studentUserId,
      student_name: result.studentName,
      batch_id: result.batchId || null,
      batch_name: result.batchName,
      submitted_at: result.submittedAt || new Date().toISOString(),
      time_spent_minutes: result.timeTakenMinutes,
      status: 'SUBMITTED',
      score: result.score,
      total_marks: result.totalMarks,
      percentage: result.percentage,
      rank: result.rank,
      is_passed: result.isPassed,
    });

    // 2. Insert into results table
    const payload = {
      institution_id: result.institutionId,
      exam_attempt_id: attemptId,
      exam_id: result.examId,
      exam_title: result.examTitle,
      exam_code: result.examCode,
      student_id: result.studentId,
      student_user_id: result.studentUserId,
      student_name: result.studentName,
      batch_id: result.batchId || null,
      batch_name: result.batchName,
      submitted_at: result.submittedAt || new Date().toISOString(),
      score: result.score,
      total_marks: result.totalMarks,
      percentage: result.percentage,
      is_passed: result.isPassed,
      rank: result.rank,
      total_participants: result.totalParticipants,
      correct_answers_count: result.correctAnswersCount,
      incorrect_answers_count: result.incorrectAnswersCount,
      unattempted_count: result.unattemptedCount,
      time_taken_minutes: result.timeTakenMinutes,
      accuracy: result.accuracy,
      subject_breakdown: result.subjectBreakdown,
    };

    const { data, error } = await supabase
      .from('results')
      .upsert(payload, { onConflict: 'exam_attempt_id' })
      .select('*')
      .single();

    if (error) {
      console.error('Error recording result in database:', error);
      throw new Error(error.message);
    }

    return mapResultRow(data);
  },
};

export const contentService = {
  // Study Materials
  async getStudyMaterials(institutionId: string, batchId?: string): Promise<StudyMaterial[]> {
    let query = supabase
      .from('study_materials')
      .select('*')
      .eq('institution_id', institutionId)
      .order('uploaded_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching study materials:', error);
      return [];
    }

    let list: StudyMaterial[] = (data || []).map((m: any) => ({
      id: m.id,
      institutionId: m.institution_id,
      title: m.title,
      subjectId: m.subject_id || '',
      subjectName: m.subject_name || '',
      topic: m.topic || '',
      assignedBatchIds: m.assigned_batch_ids || [],
      assignedBatchNames: m.assigned_batch_names || [],
      fileType: m.file_type || 'PDF',
      fileSize: m.file_size || '1.2 MB',
      downloadUrl: m.download_url || '#',
      authorName: m.author_name || 'Faculty',
      uploadedAt: m.uploaded_at,
    }));

    if (batchId) {
      list = list.filter(m => m.assignedBatchIds.length === 0 || m.assignedBatchIds.includes(batchId));
    }

    return list;
  },

  async uploadStudyMaterial(data: Omit<StudyMaterial, 'id' | 'uploadedAt'>): Promise<StudyMaterial> {
    const payload = {
      institution_id: data.institutionId,
      title: data.title,
      subject_id: data.subjectId || null,
      subject_name: data.subjectName,
      topic: data.topic,
      assigned_batch_ids: data.assignedBatchIds || [],
      assigned_batch_names: data.assignedBatchNames || [],
      file_type: data.fileType || 'PDF',
      file_size: data.fileSize || '1.5 MB',
      download_url: data.downloadUrl || '#',
      author_name: data.authorName,
    };

    const { data: inserted, error } = await supabase
      .from('study_materials')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error uploading study material:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      institutionId: inserted.institution_id,
      title: inserted.title,
      subjectId: inserted.subject_id || '',
      subjectName: inserted.subject_name || '',
      topic: inserted.topic || '',
      assignedBatchIds: inserted.assigned_batch_ids || [],
      assignedBatchNames: inserted.assigned_batch_names || [],
      fileType: inserted.file_type,
      fileSize: inserted.file_size,
      downloadUrl: inserted.download_url,
      authorName: inserted.author_name,
      uploadedAt: inserted.uploaded_at,
    };
  },

  async deleteStudyMaterial(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting study material:', error);
      return false;
    }
    return true;
  },

  // Announcements
  async getAnnouncements(institutionId: string): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('institution_id', institutionId)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }

    return (data || []).map((a: any) => ({
      id: a.id,
      institutionId: a.institution_id,
      title: a.title,
      content: a.content,
      targetAudience: a.target_audience,
      batchId: a.batch_id,
      batchName: a.batch_name,
      authorName: a.author_name || 'Administration',
      priority: a.priority || 'MEDIUM',
      publishedAt: a.published_at,
    }));
  },

  async createAnnouncement(data: Omit<Announcement, 'id' | 'publishedAt'>): Promise<Announcement> {
    const payload = {
      institution_id: data.institutionId,
      title: data.title,
      content: data.content,
      target_audience: data.targetAudience,
      batch_id: data.batchId || null,
      batch_name: data.batchName,
      author_name: data.authorName,
      priority: data.priority,
    };

    const { data: inserted, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      throw new Error(error.message);
    }

    return {
      id: inserted.id,
      institutionId: inserted.institution_id,
      title: inserted.title,
      content: inserted.content,
      targetAudience: inserted.target_audience,
      batchId: inserted.batch_id,
      batchName: inserted.batch_name,
      authorName: inserted.author_name,
      priority: inserted.priority,
      publishedAt: inserted.published_at,
    };
  },

  // Notifications
  async getUserNotifications(userId: string): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: Boolean(n.is_read),
      link: n.link,
      createdAt: n.created_at,
    }));
  },

  async markNotificationRead(id: string): Promise<void> {
    await supabase
      .from('app_notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    await supabase
      .from('app_notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
  },
};
