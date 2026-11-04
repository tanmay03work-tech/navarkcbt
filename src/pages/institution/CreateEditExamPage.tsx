import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { institutionService } from '@/services/institution.service';
import { questionService } from '@/services/question.service';
import { parseDocxQuestionPaper } from '@/services/docx/docxParser';
import { Subject, Batch, Question, ExamStatus, QuestionSet } from '@/types';
import {
  CheckCircle2,
  Clock,
  CalendarCheck,
  HelpCircle,
  FolderOpen,
  Upload,
  Plus,
  X,
  FileText,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'navark_exam_creation_draft';

export const CreateEditExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSetId = searchParams.get('fromSet');

  const { institution, user } = useAuth();
  const location = useLocation();
  const isTeacherRoute = location.pathname.startsWith('/teacher');
  const returnUrl = isTeacherRoute ? '/teacher/exams' : '/institution/exams';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    subjectId: '',
    assignedBatchId: '',
    durationMinutes: 60,
    totalMarks: 16,
    passMarks: 7,
    correctMarks: 4,
    negativeMarks: 1,
    unattemptedMarks: 0,
    status: 'SCHEDULED' as ExamStatus,
    startTime: '2026-11-15T09:00',
    endTime: '2026-11-15T12:00',
    negativeMarking: true,
    shuffleQuestions: true,
    showResultsImmediately: true,
    subjectRangePlan: '1-30: Physics\n31-60: Chemistry\n61-90: Mathematics',
    instructionsText: 'The examination clock will be set at the server.\nMarking scheme: +4 for correct, -1 for incorrect in Single Choice.\nClick SUBMIT EXAM when completed.',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasDraftNotice, setHasDraftNotice] = useState(false);

  // Question Set Picker Modal State
  const [isSetPickerOpen, setIsSetPickerOpen] = useState(false);
  const [selectedSetToView, setSelectedSetToView] = useState<QuestionSet | null>(null);
  const [setModalQuestions, setSetModalQuestions] = useState<Question[]>([]);
  const [isLoadingSetQuestions, setIsLoadingSetQuestions] = useState(false);

  // Direct DOCX upload state
  const [isDocxParsing, setIsDocxParsing] = useState(false);
  const docxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const [s, b, q, sets] = await Promise.all([
        institutionService.getSubjectsByInstitution(institution.id),
        institutionService.getBatchesByInstitution(institution.id),
        questionService.getQuestions(institution.id),
        questionService.getQuestionSets(institution.id),
      ]);
      setSubjects(s);
      setBatches(b);
      setAvailableQuestions(q);
      setQuestionSets(sets);

      if (s.length > 0 && !formData.subjectId) {
        setFormData((prev) => ({ ...prev, subjectId: s[0].id }));
      }
      if (b.length > 0 && !formData.assignedBatchId) {
        setFormData((prev) => ({ ...prev, assignedBatchId: b[0].id }));
      }

      if (isEditing && id) {
        const exam = await examService.getExamById(id);
        if (exam) {
          setFormData({
            title: exam.title,
            code: exam.code,
            description: exam.description,
            subjectId: exam.subjectId,
            assignedBatchId: exam.assignedBatchIds[0] || '',
            durationMinutes: exam.durationMinutes,
            totalMarks: exam.totalMarks,
            passMarks: exam.passMarks,
            correctMarks: 4,
            negativeMarks: exam.negativeMarking ? 1 : 0,
            unattemptedMarks: 0,
            status: exam.status,
            startTime: exam.startTime ? exam.startTime.substring(0, 16) : '2026-11-15T09:00',
            endTime: exam.endTime ? exam.endTime.substring(0, 16) : '2026-11-15T12:00',
            negativeMarking: exam.negativeMarking,
            shuffleQuestions: exam.shuffleQuestions,
            showResultsImmediately: exam.showResultsImmediately,
            subjectRangePlan: '1-30: Physics\n31-60: Chemistry\n61-90: Mathematics',
            instructionsText: exam.instructions.join('\n'),
          });
          setSelectedQuestionIds(exam.questionIds || []);
        }
      } else if (fromSetId) {
        // Automatically select questions from requested Question Set
        const setQuestions = await questionService.getQuestionsBySet(fromSetId);
        if (setQuestions.length > 0) {
          const matchedSet = sets.find((item) => item.id === fromSetId);
          setSelectedQuestionIds(setQuestions.map((item) => item.id));
          setFormData((prev) => ({
            ...prev,
            title: matchedSet ? `${matchedSet.title} Test` : prev.title,
            code: matchedSet ? matchedSet.title.substring(0, 8).toUpperCase().replace(/\s+/g, '-') : prev.code,
            totalMarks: setQuestions.length * 4,
            passMarks: Math.round(setQuestions.length * 4 * 0.4),
          }));
        }
      } else {
        // Check for local draft
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed && parsed.institutionId === institution.id && (parsed.title || parsed.selectedQuestionIds?.length > 0)) {
              setHasDraftNotice(true);
            }
          } catch {
            // Ignore bad draft format
          }
        }
      }
    };
    load();
  }, [institution, id, isEditing, fromSetId]);

  // Auto-save draft every 1.5 seconds if new exam
  useEffect(() => {
    if (isEditing || success || !institution) return;

    const timer = setTimeout(() => {
      if (formData.title.trim() || selectedQuestionIds.length > 0) {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            institutionId: institution.id,
            formData,
            selectedQuestionIds,
            savedAt: new Date().toISOString(),
          })
        );
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, selectedQuestionIds, isEditing, success, institution]);

  const handleRestoreDraft = () => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.formData) setFormData(data.formData);
      if (data.selectedQuestionIds) setSelectedQuestionIds(data.selectedQuestionIds);
      setHasDraftNotice(false);
    } catch (e) {
      console.error('Failed to parse draft:', e);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraftNotice(false);
  };

  const toggleQuestionSelection = (qId: string) => {
    if (selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((item) => item !== qId));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, qId]);
    }
  };

  // Direct DOCX file upload handler
  const handleDirectDocxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !institution) return;

    setIsDocxParsing(true);
    try {
      const parseResult = await parseDocxQuestionPaper(file);
      if (parseResult.questions.length === 0) {
        alert('No questions detected in this Word file. Check formatting.');
        return;
      }

      // Automatically create a Question Set for this paper
      const setName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
      const newSet = await questionService.createQuestionSet(
        institution.id,
        setName,
        subjects[0]?.id
      );

      const toImport: Partial<Question>[] = parseResult.questions.map((q) => {
        const assignedSub = subjects.find(
          (s) => s.name.toLowerCase() === q.subject.toLowerCase()
        ) || subjects[0];

        return {
          text: q.text,
          questionBankId: newSet.id,
          subjectId: assignedSub?.id || subjects[0]?.id,
          subjectName: assignedSub ? assignedSub.name : q.subject,
          topic: `${q.section || 'General'}`,
          type: q.type,
          difficulty: q.difficulty,
          imageUrl: q.images.length > 0 ? q.images[0] : undefined,
          options: q.options.length > 0 ? q.options : [
            { id: 'opt-a', text: 'Option A', isCorrect: true },
            { id: 'opt-b', text: 'Option B', isCorrect: false },
          ],
          correctAnswerText: q.correctAnswerText || (q.type === 'NUMERICAL' ? '0' : undefined),
          explanation: q.explanation || 'Imported via Word Question Paper Ingestion Engine.',
          positiveMarks: formData.correctMarks || 4,
          negativeMarks: q.type === 'NUMERICAL' ? 0 : formData.negativeMarks || 1,
          authorId: user?.id,
          authorName: user?.name || 'Faculty Paper Wizard',
        };
      });

      await questionService.bulkImportQuestions(institution.id, toImport, newSet.id);

      // Refresh available questions and question sets
      const [updatedQs, updatedSets] = await Promise.all([
        questionService.getQuestions(institution.id),
        questionService.getQuestionSets(institution.id),
      ]);
      setAvailableQuestions(updatedQs);
      setQuestionSets(updatedSets);

      // Get newly imported questions and add their IDs to selected questions
      const setQs = await questionService.getQuestionsBySet(newSet.id);
      const newIds = setQs.map((item) => item.id);
      setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...newIds])));

      // Auto update total marks
      const totalQCount = selectedQuestionIds.length + newIds.length;
      setFormData((prev) => ({
        ...prev,
        title: prev.title || setName,
        totalMarks: totalQCount * (prev.correctMarks || 4),
        passMarks: Math.round(totalQCount * (prev.correctMarks || 4) * 0.4),
      }));

      alert(`Successfully parsed and loaded ${newIds.length} questions from ${file.name} into the exam draft!`);
    } catch (err: any) {
      console.error('Direct DOCX error:', err);
      alert('Failed to parse Word file: ' + (err.message || 'Unknown format error'));
    } finally {
      setIsDocxParsing(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  };

  const handleOpenSetPicker = async (qs: QuestionSet) => {
    setSelectedSetToView(qs);
    setIsLoadingSetQuestions(true);
    try {
      const questionsInSet = await questionService.getQuestionsBySet(qs.id);
      setSetModalQuestions(questionsInSet);
    } finally {
      setIsLoadingSetQuestions(false);
    }
  };

  const handleAddAllQuestionsFromSet = (qs: Question[]) => {
    const ids = qs.map((q) => q.id);
    setSelectedQuestionIds((prev) => Array.from(new Set([...prev, ...ids])));
    setIsSetPickerOpen(false);
    setSelectedSetToView(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !formData.title || !formData.code) return;

    const selectedSub = subjects.find((s) => s.id === formData.subjectId);
    const selectedBatch = batches.find((b) => b.id === formData.assignedBatchId);

    const instructionsArray = formData.instructionsText
      .split('\n')
      .map((i) => i.trim())
      .filter(Boolean);

    setLoading(true);
    if (isEditing && id) {
      await examService.updateExam(id, {
        ...formData,
        subjectName: selectedSub?.name || 'General',
        assignedBatchIds: selectedBatch ? [selectedBatch.id] : [],
        assignedBatchNames: selectedBatch ? [selectedBatch.name] : [],
        questionIds: selectedQuestionIds,
        questionCount: selectedQuestionIds.length,
        instructions: instructionsArray,
      });
    } else {
      await examService.createExam({
        institutionId: institution.id,
        title: formData.title,
        code: formData.code.toUpperCase(),
        description: formData.description,
        subjectId: formData.subjectId,
        subjectName: selectedSub?.name || 'General',
        assignedBatchIds: selectedBatch ? [selectedBatch.id] : [],
        assignedBatchNames: selectedBatch ? [selectedBatch.name] : [],
        status: formData.status,
        startTime: `${formData.startTime}:00Z`,
        endTime: `${formData.endTime}:00Z`,
        durationMinutes: Number(formData.durationMinutes),
        totalMarks: Number(formData.totalMarks),
        passMarks: Number(formData.passMarks),
        questionCount: selectedQuestionIds.length,
        questionIds: selectedQuestionIds,
        negativeMarking: formData.negativeMarking,
        shuffleQuestions: formData.shuffleQuestions,
        showResultsImmediately: formData.showResultsImmediately,
        instructions: instructionsArray,
        createdBy: user?.id || 'admin',
        authorName: user?.name || 'Exam Manager',
        totalRegisteredStudents: selectedBatch ? selectedBatch.studentCount : 40,
      });
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={isEditing ? 'Edit Examination Configuration' : 'Create Examination'}
        description={`Set up assessment parameters, schedule windows, and select questions for ${institution?.name}.`}
        breadcrumbs={[
          { label: isTeacherRoute ? 'Faculty Portal' : 'Institution Admin', href: isTeacherRoute ? '/teacher' : '/institution' },
          { label: 'Exams', href: returnUrl },
          { label: isEditing ? 'Edit' : 'Create' },
        ]}
      />

      {/* Draft Restoration Notice */}
      {hasDraftNotice && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <RotateCcw className="h-4 w-4 shrink-0 text-amber-700" />
            <span>
              An unsaved exam draft was found in your browser cache. Would you like to restore it?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleRestoreDraft}
              size="sm"
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs h-8"
            >
              Restore Draft
            </Button>
            <Button
              onClick={handleDiscardDraft}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs h-8"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {success ? (
        <Card className="border-[#E7DCD3] bg-white text-center p-8 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <CardTitle className="text-xl text-[#481D1A]">
            {isEditing ? 'Examination Updated Successfully' : 'Examination Scheduled & Saved!'}
          </CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Test <strong>{formData.title}</strong> ({formData.code.toUpperCase()}) is configured with {selectedQuestionIds.length} questions.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate(returnUrl)}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold"
            >
              Back to Examinations List
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Identification */}
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">General Test Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#481D1A] mb-1">Exam Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. JEE Advanced Mock Assessment — Physics & Chemistry"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Exam Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. JEE-ADV-P1"
                    className="font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Description / Syllabus Scope</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline topics covered and test objectives..."
                  className="w-full rounded-md border border-input p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#481D1A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Target Cohort / Batch *</label>
                  <select
                    value={formData.assignedBatchId}
                    onChange={(e) => setFormData({ ...formData, assignedBatchId: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                  >
                    <option value="">All Batches (Visible to all students)</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing & Scoring Configuration */}
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Marking Scheme & Timing Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Duration (Mins) *</label>
                  <Input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Correct Marks (+)</label>
                  <Input
                    type="number"
                    value={formData.correctMarks}
                    onChange={(e) => setFormData({ ...formData, correctMarks: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Negative Marks (-)</label>
                  <Input
                    type="number"
                    value={formData.negativeMarks}
                    onChange={(e) => setFormData({ ...formData, negativeMarks: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Passing Cutoff</label>
                  <Input
                    type="number"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Status / Availability *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ExamStatus })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs font-semibold"
                  >
                    <option value="LIVE">LIVE (Students can take test now)</option>
                    <option value="SCHEDULED">SCHEDULED (Upcoming on calendar)</option>
                    <option value="DRAFT">DRAFT (Hidden from students)</option>
                    <option value="COMPLETED">COMPLETED (Archived)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Window Start Time (Local)</label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Window End Time (Local)</label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Subject Range Plan */}
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Subject Range Plan (MIITJEE Parity)
                </label>
                <textarea
                  rows={3}
                  value={formData.subjectRangePlan}
                  onChange={(e) => setFormData({ ...formData, subjectRangePlan: e.target.value })}
                  placeholder="1-30: Physics&#10;31-60: Chemistry&#10;61-90: Mathematics"
                  className="w-full font-mono rounded-md border border-input p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#481D1A]"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Format: &quot;Start-End: Subject Name&quot; per line. Automatically partitions questions into sections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.negativeMarking}
                    onChange={(e) => setFormData({ ...formData, negativeMarking: e.target.checked })}
                    className="h-4 w-4 rounded text-[#481D1A] focus:ring-[#481D1A]"
                  />
                  <span>Enforce Negative Marking</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.shuffleQuestions}
                    onChange={(e) => setFormData({ ...formData, shuffleQuestions: e.target.checked })}
                    className="h-4 w-4 rounded text-[#481D1A] focus:ring-[#481D1A]"
                  />
                  <span>Randomize Question Order</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={formData.showResultsImmediately}
                    onChange={(e) => setFormData({ ...formData, showResultsImmediately: e.target.checked })}
                    className="h-4 w-4 rounded text-[#481D1A] focus:ring-[#481D1A]"
                  />
                  <span>Publish Instant Results</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Question Selection with Sets & Direct DOCX Ingestion */}
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base text-[#481D1A]">Question Selection & Ingestion</CardTitle>
                  <CardDescription className="text-xs">
                    Choose from question sets, drag a Word (.docx) paper, or select individual questions.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => setIsSetPickerOpen(true)}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A] hover:bg-[#481D1A]/5 font-semibold"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span>Select from Set</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => docxInputRef.current?.click()}
                    disabled={isDocxParsing}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A] hover:bg-[#481D1A]/5 font-semibold"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{isDocxParsing ? 'Parsing DOCX...' : 'Direct DOCX Ingestion'}</span>
                  </Button>
                  <input
                    ref={docxInputRef}
                    type="file"
                    accept=".docx"
                    onChange={handleDirectDocxUpload}
                    className="hidden"
                  />

                  <Badge variant="maroon" className="text-xs px-2.5 py-1">
                    {selectedQuestionIds.length} Selected
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {availableQuestions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No questions available. Ingest a Word (.docx) document or author questions in the question bank.
                  </div>
                ) : (
                  availableQuestions.map((q, idx) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'border-[#481D1A] bg-[#FFFBF5]'
                            : 'border-[#E7DCD3] hover:bg-muted/30'
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#481D1A]">#{idx + 1}</span>
                            <Badge variant="secondary" className="text-[10px]">{q.subjectName}</Badge>
                            <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>
                            <span className="font-semibold text-muted-foreground">{q.difficulty}</span>
                            <span className="text-[10px] text-muted-foreground">{q.type}</span>
                          </div>
                          <p className="text-xs font-medium text-foreground line-clamp-1">{q.text}</p>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 text-[#481D1A] rounded focus:ring-[#481D1A]"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(returnUrl)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Examination' : 'Publish / Schedule Exam'}
            </Button>
          </div>
        </form>
      )}

      {/* QUESTION SET PICKER MODAL */}
      {isSetPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-[#E7DCD3]">
            <div className="p-4 border-b border-[#E7DCD3] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-[#481D1A]" />
                <h3 className="font-bold text-sm text-[#481D1A]">Select Questions from Question Set</h3>
              </div>
              <button
                onClick={() => {
                  setIsSetPickerOpen(false);
                  setSelectedSetToView(null);
                }}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {!selectedSetToView ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Choose a Question Set from your institution&apos;s library to import questions directly into this test:
                  </p>
                  {questionSets.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No question sets found. You can create one from the Question Bank page.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {questionSets.map((qs) => (
                        <div
                          key={qs.id}
                          className="p-3 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:border-[#481D1A] cursor-pointer space-y-2 transition-all"
                          onClick={() => handleOpenSetPicker(qs)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-[#481D1A]">{qs.title}</h4>
                            <Badge variant="outline" className="text-[10px]">
                              {qs.questionCount} Questions
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Subject: {qs.subjectName || 'General'}
                          </p>
                          <Button size="sm" variant="outline" className="w-full text-xs h-7 border-[#481D1A]/30">
                            Preview & Select Questions
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E7DCD3]">
                    <div>
                      <h4 className="font-bold text-[#481D1A]">{selectedSetToView.title}</h4>
                      <p className="text-[11px] text-muted-foreground">
                        {setModalQuestions.length} questions available
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSetToView(null)}
                        className="text-xs h-8"
                      >
                        Back to Sets
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAddAllQuestionsFromSet(setModalQuestions)}
                        className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs h-8 font-semibold"
                      >
                        Select All {setModalQuestions.length} Questions
                      </Button>
                    </div>
                  </div>

                  {isLoadingSetQuestions ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Loading questions...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {setModalQuestions.map((q, idx) => {
                        const isSelected = selectedQuestionIds.includes(q.id);
                        return (
                          <div
                            key={q.id}
                            onClick={() => toggleQuestionSelection(q.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer text-xs flex items-center justify-between ${
                              isSelected ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-[#E7DCD3]'
                            }`}
                          >
                            <div className="space-y-0.5 pr-2">
                              <span className="font-bold text-[#481D1A]">Q{idx + 1}.</span> {q.text}
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="h-4 w-4 text-[#481D1A] rounded"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
