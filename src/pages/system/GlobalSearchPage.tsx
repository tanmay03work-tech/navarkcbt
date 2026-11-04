import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { questionService } from '@/services/question.service';
import { institutionService } from '@/services/institution.service';
import { contentService } from '@/services/result.service';
import { Exam, Question, Batch, StudyMaterial } from '@/types';
import { Search, CalendarCheck, FileQuestion, Layers, FileText } from 'lucide-react';

export const GlobalSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { institution } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const e = await examService.getExams(institution.id);
      const q = await questionService.getQuestions(institution.id);
      const b = await institutionService.getBatchesByInstitution(institution.id);
      const m = await contentService.getStudyMaterials(institution.id);
      setExams(e);
      setQuestions(q);
      setBatches(b);
      setMaterials(m);
    };
    load();
  }, [institution]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const qLower = query.toLowerCase().trim();

  const matchedExams = qLower
    ? exams.filter(e => e.title.toLowerCase().includes(qLower) || e.code.toLowerCase().includes(qLower))
    : [];

  const matchedQuestions = qLower
    ? questions.filter(q => q.text.toLowerCase().includes(qLower) || q.topic.toLowerCase().includes(qLower))
    : [];

  const matchedBatches = qLower
    ? batches.filter(b => b.name.toLowerCase().includes(qLower) || b.code.toLowerCase().includes(qLower))
    : [];

  const matchedMaterials = qLower
    ? materials.filter(m => m.title.toLowerCase().includes(qLower) || m.topic.toLowerCase().includes(qLower))
    : [];

  const totalMatches =
    matchedExams.length + matchedQuestions.length + matchedBatches.length + matchedMaterials.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Search Portal Records"
        description="Search across examinations, question repositories, cohorts, and study handouts."
      />

      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="h-5 w-5 absolute left-3 top-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type keywords (e.g. 'physics', 'optics', 'batch', 'mock')..."
          className="pl-10 h-11 text-sm bg-white"
        />
      </form>

      {query.trim() && (
        <p className="text-xs text-muted-foreground">
          Found <strong>{totalMatches}</strong> matching records for "{query}" in {institution?.name || 'Platform'}:
        </p>
      )}

      {totalMatches === 0 && query.trim() ? (
        <Card className="border-[#E7DCD3] bg-white p-12 text-center text-xs text-muted-foreground">
          No matches found for "{query}". Try a broader keyword like "mock", "physics", or "alpha".
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Matched Exams */}
          {matchedExams.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#481D1A] flex items-center gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                <span>Examinations ({matchedExams.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedExams.map((e) => (
                  <div key={e.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-white text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#481D1A]">{e.title}</span>
                      <Badge variant="outline" className="text-[10px]">{e.code}</Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px]">{e.durationMinutes} mins • {e.totalMarks} marks</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Questions */}
          {matchedQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#481D1A] flex items-center gap-1.5">
                <FileQuestion className="h-4 w-4" />
                <span>Questions ({matchedQuestions.length})</span>
              </h3>
              <div className="space-y-2">
                {matchedQuestions.map((q) => (
                  <div key={q.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-white text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{q.subjectName}</Badge>
                      <Badge variant="outline" className="text-[10px]">{q.topic}</Badge>
                    </div>
                    <p className="font-medium text-foreground line-clamp-2">{q.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Batches */}
          {matchedBatches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#481D1A] flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>Batches ({matchedBatches.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedBatches.map((b) => (
                  <div key={b.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-white text-xs space-y-1">
                    <span className="font-bold text-[#481D1A]">{b.name}</span>
                    <p className="text-muted-foreground text-[11px]">{b.courseName} • {b.studentCount} students</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Materials */}
          {matchedMaterials.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#481D1A] flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Study Handouts ({matchedMaterials.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchedMaterials.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-white text-xs space-y-1">
                    <span className="font-bold text-[#481D1A]">{m.title}</span>
                    <p className="text-muted-foreground text-[11px]">{m.subjectName} • {m.fileSize}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

