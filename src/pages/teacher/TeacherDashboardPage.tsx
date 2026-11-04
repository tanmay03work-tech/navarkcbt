import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { questionService } from '@/services/question.service';
import { institutionService } from '@/services/institution.service';
import { resultService } from '@/services/result.service';
import { Exam, Question, Batch, ExamResult } from '@/types';
import {
  CalendarCheck,
  FileQuestion,
  Layers,
  GraduationCap,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherDashboardPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution || !user) return;
      const e = await examService.getExams(institution.id);
      const q = await questionService.getQuestions(institution.id);
      const b = await institutionService.getBatchesByInstitution(institution.id);
      const r = await resultService.getResultsByInstitution(institution.id);

      setExams(e.filter(item => item.createdBy === user.id || item.institutionId === institution.id));
      setQuestions(q.filter(item => item.authorId === user.id || item.institutionId === institution.id));
      setBatches(b);
      setResults(r);
    };
    load();
  }, [institution, user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name || 'Educator'}`}
        description={`Faculty ID: ${user?.userId} • ${institution?.name} (${institution?.code}) • ${user?.specialization?.join(', ') || 'Faculty'}`}
      >
        <Link to="/teacher/exams/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Test Series</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Batches"
          value={batches.length}
          icon={Layers}
          description="Cohorts under your instruction"
        />
        <StatCard
          title="Total Students"
          value={batches.reduce((acc, b) => acc + b.studentCount, 0)}
          icon={GraduationCap}
          description="Enrolled in assigned batches"
        />
        <StatCard
          title="Questions Authored"
          value={questions.length}
          icon={FileQuestion}
          description="Items in active question bank"
        />
        <StatCard
          title="Assigned Examinations"
          value={exams.length}
          icon={CalendarCheck}
          description="Scheduled & completed tests"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exams List */}
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-[#481D1A]">Your Examinations</CardTitle>
              <p className="text-xs text-muted-foreground">Tests created and monitored for your cohorts</p>
            </div>
            <Link to="/teacher/exams" className="text-xs font-semibold text-[#481D1A] hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {exams.slice(0, 4).map((exam) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/60 hover:bg-[#FFFBF5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#481D1A]">{exam.title}</h4>
                    <StatusBadge status={exam.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">{exam.code}</span>
                    <span>•</span>
                    <span>{exam.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{exam.totalMarks} marks</span>
                    <span>•</span>
                    <span>{exam.assignedBatchNames.join(', ')}</span>
                  </div>
                </div>

                <Link to={`/teacher/exams/${exam.id}`}>
                  <Button variant="outline" size="sm" className="h-8 text-xs border-[#481D1A]/30">
                    Monitor Submissions
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Authoring */}
        <div className="space-y-6">
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#481D1A]">Faculty Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Link to="/teacher/questions/new" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A]">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Draft New Question</span>
                </Button>
              </Link>
              <Link to="/teacher/materials" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A]">
                  <FileQuestion className="h-4 w-4 mr-2" />
                  <span>Upload Study Handout</span>
                </Button>
              </Link>
              <Link to="/teacher/batches" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A]">
                  <Layers className="h-4 w-4 mr-2" />
                  <span>Inspect Assigned Batches</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#481D1A]">Recent Candidate Submissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {results.slice(0, 3).map((r) => (
                <div key={r.id} className="p-2.5 rounded bg-[#FFFBF5] border border-[#E7DCD3]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#481D1A]">{r.studentName}</span>
                    <span className="font-semibold text-emerald-700">{r.score}/{r.totalMarks} ({r.percentage}%)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.examTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

