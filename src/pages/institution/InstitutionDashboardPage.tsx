import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { examService } from '@/services/exam.service';
import { resultService } from '@/services/result.service';
import { Batch, Exam, ExamResult, User } from '@/types';
import {
  GraduationCap,
  Users,
  Layers,
  CalendarCheck,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileQuestion,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '@/lib/utils';

export const InstitutionDashboardPage: React.FC = () => {
  const { institution } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const b = await institutionService.getBatchesByInstitution(institution.id);
      const e = await examService.getExams(institution.id);
      const r = await resultService.getResultsByInstitution(institution.id);
      const s = await institutionService.getUsersByInstitutionAndRole(institution.id, 'STUDENT');
      const t = await institutionService.getUsersByInstitutionAndRole(institution.id, 'TEACHER');
      setBatches(b);
      setExams(e);
      setResults(r);
      setStudents(s);
      setTeachers(t);
    };
    load();
  }, [institution]);

  const liveExams = exams.filter(e => e.status === 'LIVE');
  const upcomingExams = exams.filter(e => e.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${institution?.name || 'Institution'} Dashboard`}
        description={`Tenant Code: ${institution?.code} • Academic Year 2025-2026`}
      >
        <Link to="/institution/exams/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Examination</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={institution?.totalStudents || students.length * 30}
          change="+14.2%"
          isPositive
          icon={GraduationCap}
          description="Active across all batches"
        />
        <StatCard
          title="Assigned Teachers"
          value={institution?.totalTeachers || teachers.length * 12}
          icon={Users}
          description="Faculty & exam managers"
        />
        <StatCard
          title="Academic Batches"
          value={batches.length}
          icon={Layers}
          description="Active cohorts"
        />
        <StatCard
          title="Total Exams"
          value={exams.length}
          change={`${liveExams.length} Live Now`}
          isPositive={liveExams.length > 0}
          icon={CalendarCheck}
          description="Published & scheduled tests"
        />
      </div>

      {/* Live & Upcoming Exams Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-[#481D1A]">Active & Upcoming Examinations</CardTitle>
              <p className="text-xs text-muted-foreground">Tests scheduled or currently live for your batches</p>
            </div>
            <Link to="/institution/exams" className="text-xs font-semibold text-[#481D1A] hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {exams.slice(0, 4).map((exam) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/60 hover:bg-[#FFFBF5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#481D1A]">{exam.title}</h4>
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

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/institution/exams/${exam.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Monitor / Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions & Recent Results */}
        <div className="space-y-6">
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#481D1A]">Quick Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Link to="/institution/students/new" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A] hover:bg-[#481D1A]/5">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>Enroll New Student</span>
                </Button>
              </Link>
              <Link to="/institution/questions/new" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A] hover:bg-[#481D1A]/5">
                  <FileQuestion className="h-4 w-4 mr-2" />
                  <span>Add Question to Bank</span>
                </Button>
              </Link>
              <Link to="/institution/questions/import" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A] hover:bg-[#481D1A]/5">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Bulk Import Questions (CSV)</span>
                </Button>
              </Link>
              <Link to="/institution/batches" className="block">
                <Button variant="outline" className="w-full justify-start text-xs h-9 text-[#481D1A] hover:bg-[#481D1A]/5">
                  <Layers className="h-4 w-4 mr-2" />
                  <span>Manage Batches / Classes</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-[#481D1A]">Recent Scorecards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {results.slice(0, 3).map((res) => (
                <div key={res.id} className="p-2.5 rounded bg-[#FFFBF5] border border-[#E7DCD3]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#481D1A]">{res.studentName}</span>
                    <span className="font-semibold text-emerald-700">{res.score}/{res.totalMarks} ({res.percentage}%)</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex justify-between mt-1">
                    <span>{res.examTitle}</span>
                    <span>Rank #{res.rank}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

