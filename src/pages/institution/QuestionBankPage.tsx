import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Upload,
  FileQuestion,
  Eye,
  Edit,
  Trash2,
  FolderOpen,
  FolderPlus,
  Layers,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { questionService } from '@/services/question.service';
import { institutionService } from '@/services/institution.service';
import { Question, QuestionSet, Subject } from '@/types';
import { formatDate } from '@/lib/utils';

export const QuestionBankPage: React.FC = () => {
  const { institution } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'SETS' | 'QUESTIONS'>('SETS');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters for questions
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [setFilter, setSetFilter] = useState('ALL');

  // New Set Modal State
  const [isNewSetModalOpen, setIsNewSetModalOpen] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetSubjectId, setNewSetSubjectId] = useState('');
  const [isCreatingSet, setIsCreatingSet] = useState(false);

  // View Set Details Modal State
  const [viewingSet, setViewingSet] = useState<QuestionSet | null>(null);
  const [activeSetQuestions, setActiveSetQuestions] = useState<Question[]>([]);
  const [isLoadingSetQuestions, setIsLoadingSetQuestions] = useState(false);

  const loadData = async () => {
    if (!institution) return;
    setLoading(true);
    try {
      const [setsData, qList, sList] = await Promise.all([
        questionService.getQuestionSets(institution.id),
        questionService.getQuestions(institution.id),
        institutionService.getSubjectsByInstitution(institution.id),
      ]);
      setQuestionSets(setsData);
      setQuestions(qList);
      setSubjects(sList);
      if (sList.length > 0 && !newSetSubjectId) {
        setNewSetSubjectId(sList[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institution]);

  const handleCreateNewSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !newSetTitle.trim()) return;

    setIsCreatingSet(true);
    try {
      await questionService.createQuestionSet(
        institution.id,
        newSetTitle.trim(),
        newSetSubjectId || undefined
      );
      setNewSetTitle('');
      setIsNewSetModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert('Failed to create question set: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCreatingSet(false);
    }
  };

  const handleDeleteSet = async (setId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete question set "${title}"?`)) {
      await questionService.deleteQuestionSet(setId);
      await loadData();
    }
  };

  const handleOpenViewSetModal = async (set: QuestionSet) => {
    setViewingSet(set);
    setIsLoadingSetQuestions(true);
    try {
      const qs = await questionService.getQuestionsBySet(set.id);
      setActiveSetQuestions(qs);
    } finally {
      setIsLoadingSetQuestions(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await questionService.deleteQuestion(id);
      if (viewingSet) {
        setActiveSetQuestions((prev) => prev.filter((q) => q.id !== id));
      }
      loadData();
    }
  };

  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' || q.subjectId === subjectFilter;
    const matchesDifficulty = difficultyFilter === 'ALL' || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'ALL' || q.type === typeFilter;
    const matchesSet = setFilter === 'ALL' || q.questionBankId === setFilter;

    return matchesSearch && matchesSubject && matchesDifficulty && matchesType && matchesSet;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Repository & Sets Management"
        description={`Manage question sets, import Word .docx papers, and organize institutional problems for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Question Bank' },
        ]}
      >
        <Link to="/institution/questions/import">
          <Button variant="outline" className="border-[#481D1A] text-[#481D1A] text-xs gap-1.5 shadow-sm font-semibold">
            <Upload className="h-4 w-4" />
            <span>Ingest DOCX / CSV</span>
          </Button>
        </Link>
        <Button
          onClick={() => setIsNewSetModalOpen(true)}
          variant="outline"
          className="border-[#481D1A] text-[#481D1A] text-xs gap-1.5 shadow-sm font-semibold"
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Question Set</span>
        </Button>
        <Link to="/institution/questions/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm font-semibold">
            <Plus className="h-4 w-4" />
            <span>Author Single Question</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E7DCD3] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('SETS')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'SETS'
              ? 'border-[#481D1A] text-[#481D1A]'
              : 'border-transparent text-muted-foreground hover:text-[#481D1A]'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Question Sets & Batches ({questionSets.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('QUESTIONS')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'QUESTIONS'
              ? 'border-[#481D1A] text-[#481D1A]'
              : 'border-transparent text-muted-foreground hover:text-[#481D1A]'
          }`}
        >
          <FileQuestion className="h-4 w-4" />
          <span>All Questions Repository ({questions.length})</span>
        </button>
      </div>

      {/* TAB 1: QUESTION SETS & BATCHES */}
      {activeTab === 'SETS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Question Sets allow batching multiple questions (e.g. from a past year paper or Word .docx upload) into reusable exam modules.
            </p>
            <Button
              onClick={() => setIsNewSetModalOpen(true)}
              size="sm"
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Question Set</span>
            </Button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading question sets...
            </div>
          ) : questionSets.length === 0 ? (
            <Card className="border-[#E7DCD3] bg-white">
              <CardContent className="py-16 text-center space-y-3">
                <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <h3 className="text-sm font-bold text-[#481D1A]">No Question Sets Created Yet</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Create a new question set or ingest a Word (.docx) question paper to organize questions by set.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    onClick={() => setIsNewSetModalOpen(true)}
                    size="sm"
                    className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create First Set</span>
                  </Button>
                  <Link to="/institution/questions/import">
                    <Button variant="outline" size="sm" className="text-xs gap-1 border-stone-300">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Ingest Word File</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questionSets.map((qs) => (
                <Card
                  key={qs.id}
                  className="border-[#E7DCD3] bg-white hover:border-[#481D1A]/50 transition-all shadow-xs flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2 rounded-lg bg-[#481D1A]/5 text-[#481D1A]">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold border-emerald-300 bg-emerald-50 text-emerald-800">
                        {qs.questionCount} Questions
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-[#481D1A] pt-2 line-clamp-1">
                      {qs.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {qs.subjectName || 'General'}
                      </Badge>
                      <span>•</span>
                      <span>Created {formatDate(qs.createdAt)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 border-t border-[#E7DCD3]/60 pb-3 mt-auto">
                    <div className="flex items-center justify-between pt-3 gap-2">
                      <Button
                        onClick={() => handleOpenViewSetModal(qs)}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1 border-[#481D1A]/30 text-[#481D1A] hover:bg-[#481D1A]/5 flex-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Set</span>
                      </Button>
                      <Button
                        onClick={() => navigate(`/institution/exams/new?fromSet=${qs.id}`)}
                        size="sm"
                        className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1 flex-1 font-semibold"
                      >
                        <span>Create Test</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSet(qs.id, qs.title)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL QUESTIONS REPOSITORY */}
      {activeTab === 'QUESTIONS' && (
        <Card className="border-[#E7DCD3] bg-white">
          <CardContent className="p-4 space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search question text or topic..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                <select
                  value={setFilter}
                  onChange={(e) => setSetFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Question Sets</option>
                  {questionSets.map((qs) => (
                    <option key={qs.id} value={qs.id}>
                      Set: {qs.title}
                    </option>
                  ))}
                </select>

                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Types</option>
                  <option value="SINGLE_CHOICE">Single Choice</option>
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="NUMERICAL">Numerical</option>
                </select>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No questions found in this filter range.
                </div>
              ) : (
                filtered.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:bg-[#FFFBF5] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#481D1A]">#{idx + 1}</span>
                        <Badge variant="outline" className="text-[10px] font-semibold bg-white">
                          {q.subjectName}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {q.topic}
                        </Badge>
                        <Badge
                          variant={q.difficulty === 'HARD' ? 'destructive' : q.difficulty === 'MEDIUM' ? 'warning' : 'success'}
                          className="text-[10px]"
                        >
                          {q.difficulty}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {q.type.replace('_', ' ')} • +{q.positiveMarks}/-{q.negativeMarks} marks
                        </span>
                      </div>

                      <p className="text-xs font-medium text-foreground line-clamp-2 pt-0.5 whitespace-pre-wrap">
                        {q.text}
                      </p>

                      <div className="text-[10px] text-muted-foreground flex items-center gap-3">
                        <span>Author: {q.authorName}</span>
                        <span>•</span>
                        <span>Used in {q.usageCount} exams</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Link to={`/institution/questions/${q.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-[#481D1A]/30">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Preview</span>
                        </Button>
                      </Link>
                      <Link to={`/institution/questions/${q.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#481D1A]">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE NEW SET MODAL */}
      {isNewSetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-[#E7DCD3] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E7DCD3]">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-[#481D1A]" />
                <h3 className="font-bold text-sm text-[#481D1A]">Create New Question Set</h3>
              </div>
              <button
                onClick={() => setIsNewSetModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSet} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#481D1A] block mb-1">
                  Question Set Title *
                </label>
                <Input
                  required
                  value={newSetTitle}
                  onChange={(e) => setNewSetTitle(e.target.value)}
                  placeholder="e.g. JEE Advanced 2026 Physics Practice Set"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#481D1A] block mb-1">
                  Primary Subject
                </label>
                <select
                  value={newSetSubjectId}
                  onChange={(e) => setNewSetSubjectId(e.target.value)}
                  className="w-full text-xs p-2 rounded-md border border-input bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-[#481D1A]"
                >
                  <option value="">General / Multi-Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E7DCD3]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewSetModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingSet || !newSetTitle.trim()}
                  size="sm"
                  className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold"
                >
                  {isCreatingSet ? 'Creating...' : 'Create Set'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW QUESTIONS IN SET MODAL */}
      {viewingSet && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-[#E7DCD3]">
            <div className="p-4 border-b border-[#E7DCD3] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#481D1A]" />
                  <h3 className="font-bold text-sm text-[#481D1A]">{viewingSet.title}</h3>
                  <Badge variant="outline" className="text-[10px]">
                    {activeSetQuestions.length} Questions
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Subject: {viewingSet.subjectName || 'General'} • Created {formatDate(viewingSet.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    navigate(`/institution/exams/new?fromSet=${viewingSet.id}`);
                  }}
                  size="sm"
                  className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1 font-semibold"
                >
                  <span>Draft Test from Set</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <button
                  onClick={() => setViewingSet(null)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {isLoadingSetQuestions ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Loading questions in this set...
                </div>
              ) : activeSetQuestions.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <p>No questions currently linked to this set.</p>
                  <Link to="/institution/questions/import">
                    <Button variant="outline" size="sm" className="text-xs gap-1 border-stone-300">
                      <Upload className="h-3 w-3" />
                      <span>Ingest Questions from Word .docx</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                activeSetQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3.5 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#481D1A]">Question {idx + 1} ({q.type})</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="h-6 w-6 text-muted-foreground hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-medium text-foreground whitespace-pre-wrap">{q.text}</p>
                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="Question diagram" className="max-h-40 rounded border border-stone-200" />
                    )}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={opt.id || oIdx}
                            className={`p-2 rounded border text-xs flex items-center gap-2 ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-white border-stone-200 text-muted-foreground'
                            }`}
                          >
                            <span className="font-bold">({String.fromCharCode(65 + oIdx)})</span>
                            <span>{opt.text}</span>
                            {opt.isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 ml-auto" />}
                          </div>
                        ))}
                      </div>
                    )}
                    {q.correctAnswerText && (
                      <p className="text-[11px] font-semibold text-emerald-800">
                        Correct Value: {q.correctAnswerText}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
