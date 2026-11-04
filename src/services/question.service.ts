import { Question, QuestionSet } from '@/types';
import { supabase } from '@/lib/supabase';

export interface QuestionFilters {
  subjectId?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  status?: string;
  search?: string;
  questionBankId?: string;
}

function mapQuestionRow(q: any): Question {
  return {
    id: q.id,
    institutionId: q.institution_id,
    questionBankId: q.question_bank_id || undefined,
    subjectId: q.subject_id || '',
    subjectName: q.subject_name || '',
    topic: q.topic || 'General',
    type: q.type,
    difficulty: q.difficulty,
    text: q.text,
    imageUrl: q.image_url,
    options: q.options || [],
    correctAnswerText: q.correct_answer_text,
    explanation: q.explanation || '',
    positiveMarks: Number(q.positive_marks ?? 4),
    negativeMarks: Number(q.negative_marks ?? 1),
    authorId: q.author_id || '',
    authorName: q.author_name || 'Faculty',
    status: q.status,
    usageCount: q.usage_count || 0,
    createdAt: q.created_at,
  };
}

export const questionService = {
  // --- Question Sets (Banks) Management ---
  async getQuestionSets(institutionId: string): Promise<QuestionSet[]> {
    const { data: sets, error } = await supabase
      .from('question_banks')
      .select('*, subjects(name)')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching question sets:', error);
      return [];
    }

    // Get counts for each set
    const { data: counts } = await supabase
      .from('questions')
      .select('question_bank_id')
      .eq('institution_id', institutionId)
      .not('question_bank_id', 'is', null);

    const countsMap: Record<string, number> = {};
    (counts || []).forEach((row: any) => {
      if (row.question_bank_id) {
        countsMap[row.question_bank_id] = (countsMap[row.question_bank_id] || 0) + 1;
      }
    });

    return (sets || []).map((s: any) => ({
      id: s.id,
      institutionId: s.institution_id,
      title: s.title,
      subjectId: s.subject_id || undefined,
      subjectName: s.subjects?.name || 'General',
      status: (s.status as 'ACTIVE' | 'ARCHIVED') || 'ACTIVE',
      questionCount: countsMap[s.id] || 0,
      createdAt: s.created_at,
    }));
  },

  async createQuestionSet(
    institutionId: string,
    title: string,
    subjectId?: string
  ): Promise<QuestionSet> {
    const { data, error } = await supabase
      .from('question_banks')
      .insert({
        institution_id: institutionId,
        title,
        subject_id: subjectId || null,
        status: 'ACTIVE',
      })
      .select('*, subjects(name)')
      .single();

    if (error) {
      console.error('Error creating question set:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      institutionId: data.institution_id,
      title: data.title,
      subjectId: data.subject_id || undefined,
      subjectName: data.subjects?.name || 'General',
      status: (data.status as 'ACTIVE' | 'ARCHIVED') || 'ACTIVE',
      questionCount: 0,
      createdAt: data.created_at,
    };
  },

  async deleteQuestionSet(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('question_banks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question set:', error);
      return false;
    }
    return true;
  },

  async getQuestionsBySet(setId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('question_bank_id', setId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching questions for set:', error);
      return [];
    }

    return (data || []).map(mapQuestionRow);
  },

  // --- Questions Management ---
  async getQuestions(institutionId: string, filters?: QuestionFilters): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.questionBankId && filters.questionBankId !== 'ALL') {
        query = query.eq('question_bank_id', filters.questionBankId);
      }
      if (filters.subjectId && filters.subjectId !== 'ALL') {
        query = query.eq('subject_id', filters.subjectId);
      }
      if (filters.difficulty && filters.difficulty !== 'ALL') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.type && filters.type !== 'ALL') {
        query = query.eq('type', filters.type);
      }
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.ilike('text', `%${filters.search.trim()}%`);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    return (data || []).map(mapQuestionRow);
  },

  async getQuestionById(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapQuestionRow(data);
  },

  async createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'usageCount'>): Promise<Question> {
    const payload = {
      institution_id: data.institutionId,
      question_bank_id: data.questionBankId || null,
      subject_id: data.subjectId || null,
      subject_name: data.subjectName,
      topic: data.topic,
      type: data.type,
      difficulty: data.difficulty,
      text: data.text,
      image_url: data.imageUrl,
      options: data.options || [],
      correct_answer_text: data.correctAnswerText,
      explanation: data.explanation || '',
      positive_marks: data.positiveMarks,
      negative_marks: data.negativeMarks,
      author_id: data.authorId || null,
      author_name: data.authorName,
      status: data.status || 'PUBLISHED',
      usage_count: 0,
    };

    const { data: inserted, error } = await supabase
      .from('questions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating question:', error);
      throw new Error(error.message);
    }

    return mapQuestionRow(inserted);
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const payload: Record<string, any> = {};
    if (updates.text !== undefined) payload.text = updates.text;
    if (updates.questionBankId !== undefined) payload.question_bank_id = updates.questionBankId || null;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId || null;
    if (updates.subjectName !== undefined) payload.subject_name = updates.subjectName;
    if (updates.topic !== undefined) payload.topic = updates.topic;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.options !== undefined) payload.options = updates.options;
    if (updates.correctAnswerText !== undefined) payload.correct_answer_text = updates.correctAnswerText;
    if (updates.explanation !== undefined) payload.explanation = updates.explanation;
    if (updates.positiveMarks !== undefined) payload.positive_marks = updates.positiveMarks;
    if (updates.negativeMarks !== undefined) payload.negative_marks = updates.negativeMarks;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data: updated, error } = await supabase
      .from('questions')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating question:', error);
      throw new Error(error.message);
    }

    return mapQuestionRow(updated);
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return false;
    }
    return true;
  },

  async bulkImportQuestions(
    institutionId: string,
    imported: Partial<Question>[],
    questionBankId?: string
  ): Promise<{ importedCount: number; failedCount: number }> {
    const rows = imported
      .filter((item) => item.text && item.subjectId)
      .map((item) => ({
        institution_id: institutionId,
        question_bank_id: questionBankId || item.questionBankId || null,
        subject_id: item.subjectId,
        subject_name: item.subjectName || 'General',
        topic: item.topic || 'General Topic',
        type: item.type || 'SINGLE_CHOICE',
        difficulty: item.difficulty || 'MEDIUM',
        text: item.text,
        image_url: item.imageUrl || null,
        options: item.options || [
          { id: 'opt-a', text: 'Option A', isCorrect: true },
          { id: 'opt-b', text: 'Option B', isCorrect: false },
        ],
        correct_answer_text: item.correctAnswerText || null,
        explanation: item.explanation || 'Imported question explanation.',
        positive_marks: item.positiveMarks || 4,
        negative_marks: item.negativeMarks ?? 1,
        author_id: item.authorId || null,
        author_name: item.authorName || 'Import Wizard',
        status: 'PUBLISHED',
      }));

    if (rows.length === 0) {
      return { importedCount: 0, failedCount: 0 };
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(rows)
      .select('id');

    if (error) {
      console.error('Error in bulk import:', error);
      return { importedCount: 0, failedCount: rows.length };
    }

    return { importedCount: data?.length || 0, failedCount: 0 };
  },
};
