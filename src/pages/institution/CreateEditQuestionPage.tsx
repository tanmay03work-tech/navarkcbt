import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { questionService } from '@/services/question.service';
import { institutionService } from '@/services/institution.service';
import { QuestionType, DifficultyLevel, Subject, QuestionOption } from '@/types';
import { Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

export const CreateEditQuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { institution, user } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    type: 'SINGLE_CHOICE' as QuestionType,
    difficulty: 'MEDIUM' as DifficultyLevel,
    text: '',
    positiveMarks: 4,
    negativeMarks: 1,
    explanation: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    correctAnswerText: '',
    imageUrl: '',
  });

  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt-1', text: 'Option A', isCorrect: true },
    { id: 'opt-2', text: 'Option B', isCorrect: false },
    { id: 'opt-3', text: 'Option C', isCorrect: false },
    { id: 'opt-4', text: 'Option D', isCorrect: false },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const sList = await institutionService.getSubjectsByInstitution(institution.id);
      setSubjects(sList);
      if (sList.length > 0 && !formData.subjectId) {
        setFormData(prev => ({ ...prev, subjectId: sList[0].id }));
      }

      if (isEditing && id) {
        const q = await questionService.getQuestionById(id);
        if (q) {
          setFormData({
            subjectId: q.subjectId,
            topic: q.topic,
            type: q.type,
            difficulty: q.difficulty,
            text: q.text,
            positiveMarks: q.positiveMarks,
            negativeMarks: q.negativeMarks,
            explanation: q.explanation,
            status: q.status,
            correctAnswerText: q.correctAnswerText || '',
            imageUrl: q.imageUrl || '',
          });
          if (q.options && q.options.length > 0) {
            setOptions(q.options);
          }
        }
      }
    };
    load();
  }, [institution, id, isEditing]);

  const handleOptionChange = (idx: number, text: string) => {
    const updated = [...options];
    updated[idx].text = text;
    setOptions(updated);
  };

  const handleToggleCorrect = (idx: number) => {
    if (formData.type === 'SINGLE_CHOICE') {
      const updated = options.map((opt, i) => ({
        ...opt,
        isCorrect: i === idx,
      }));
      setOptions(updated);
    } else {
      const updated = [...options];
      updated[idx].isCorrect = !updated[idx].isCorrect;
      setOptions(updated);
    }
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: `opt-${Date.now()}`, text: `Option ${String.fromCharCode(65 + options.length)}`, isCorrect: false },
    ]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !formData.text) return;

    const selectedSub = subjects.find(s => s.id === formData.subjectId);

    setLoading(true);
    if (isEditing && id) {
      await questionService.updateQuestion(id, {
        ...formData,
        subjectName: selectedSub?.name || 'General',
        imageUrl: formData.imageUrl.trim() || undefined,
        options: formData.type === 'NUMERICAL' ? [] : options,
      });
    } else {
      await questionService.createQuestion({
        institutionId: institution.id,
        subjectId: formData.subjectId,
        subjectName: selectedSub?.name || 'General',
        topic: formData.topic || 'General Topic',
        type: formData.type,
        difficulty: formData.difficulty,
        text: formData.text,
        imageUrl: formData.imageUrl.trim() || undefined,
        options: formData.type === 'NUMERICAL' ? [] : options,
        correctAnswerText: formData.type === 'NUMERICAL' ? formData.correctAnswerText : undefined,
        explanation: formData.explanation,
        positiveMarks: Number(formData.positiveMarks),
        negativeMarks: Number(formData.negativeMarks),
        authorId: user?.id || 'admin',
        authorName: user?.name || 'Staff Author',
        status: formData.status,
      });
    }
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={isEditing ? 'Edit Question' : 'Author New Problem'}
        description={`Contribute questions to ${institution?.name} repository.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Question Bank', href: '/institution/questions' },
          { label: isEditing ? 'Edit Question' : 'Author' },
        ]}
      />

      {success ? (
        <Card className="border-[#E7DCD3] bg-white text-center p-8 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <CardTitle className="text-xl text-[#481D1A]">Question Saved to Bank!</CardTitle>
          <p className="text-xs text-muted-foreground">
            The question has been cataloged and is available for examination drafting.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate('/institution/questions')}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs"
            >
              Back to Repository
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Question Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                    required
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Topic / Unit *</label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Electromagnetic Induction"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Question Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="NUMERICAL">Numerical Value</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Positive Marks</label>
                  <Input
                    type="number"
                    value={formData.positiveMarks}
                    onChange={(e) => setFormData({ ...formData, positiveMarks: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Negative Penalty</label>
                  <Input
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Problem Statement & Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Question Prompt Text *</label>
                <textarea
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter the complete question problem statement here..."
                  className="w-full rounded-md border border-input p-3 text-xs focus:ring-1 focus:ring-[#481D1A]"
                  required
                />
              </div>

              {/* Diagram / Image Attachment */}
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Diagram / Image URL or Base64 (Optional)</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://... or data:image/png;base64,..."
                    className="text-xs"
                  />
                  <label className="shrink-0 cursor-pointer">
                    <span className="inline-flex items-center px-3 py-2 border border-[#481D1A] text-[#481D1A] rounded-md text-xs font-semibold hover:bg-[#481D1A]/5">
                      Choose Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          if (base64) {
                            setFormData((prev) => ({ ...prev, imageUrl: base64 }));
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 p-2 border border-[#E7DCD3] rounded-lg bg-stone-50 inline-block">
                    <img
                      src={formData.imageUrl}
                      alt="Question preview"
                      className="max-h-36 rounded object-contain"
                    />
                  </div>
                )}
              </div>

              {formData.type === 'NUMERICAL' ? (
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Expected Numerical Value Answer *</label>
                  <Input
                    value={formData.correctAnswerText}
                    onChange={(e) => setFormData({ ...formData, correctAnswerText: e.target.value })}
                    placeholder="e.g. 3.56"
                    className="font-mono"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Students will type a numerical response.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#481D1A]">Answer Choices (Mark correct radio/box)</span>
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="h-7 text-xs gap-1">
                      <Plus className="h-3 w-3" />
                      <span>Add Option</span>
                    </Button>
                  </div>

                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-3">
                      <input
                        type={formData.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                        name="correctChoice"
                        checked={opt.isCorrect}
                        onChange={() => handleToggleCorrect(idx)}
                        className="h-4 w-4 text-[#481D1A] focus:ring-[#481D1A]"
                      />
                      <span className="font-bold text-[#481D1A] w-6">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <Input
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className={opt.isCorrect ? 'border-emerald-500 bg-emerald-50/30' : ''}
                        required
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(idx)}
                          className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Step-by-Step Solution / Explanation</label>
                <textarea
                  rows={3}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Explain mathematical reasoning or reference principles (revealed after exam submission)..."
                  className="w-full rounded-md border border-input p-3 text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/institution/questions')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Save to Question Bank'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

