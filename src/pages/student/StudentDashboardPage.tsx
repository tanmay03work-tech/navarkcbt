import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { resultService } from '@/services/result.service';
import { contentService } from '@/services/result.service';
import { Exam, ExamResult, Announcement } from '@/types';
import {
  CalendarCheck,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Play,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboardPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [exams, setExams] = useState<{ available: Exam[]; upcoming: Exam[]; completed: Exam[] }>({
    available: [],
    upcoming: [],
    completed: [],
  });
  const [results, setResults] = useState<ExamResult[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution || !user) return;
      const ex = await examService.getStudentExams(institution.id, user.batchId);
      const res = await resultService.getStudentResults(user.id);
      const ann = await contentService.getAnnouncements(institution.id);
      setExams(ex);
      setResults(res);
      setAnnouncements(ann);
    };
    load();
  }, [institution, user]);

  const latestResult = results[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#E7DCD3] bg-gradient-to-r from-white via-[#FFFBF5] to-[#F7ECE9] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#481D1A]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#481D1A]">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Candidate Portal • {institution?.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#481D1A]">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs text-muted-foreground">
            Roll / User ID: <span className="font-mono font-semibold text-foreground">{user?.userId}</span> • Cohort:{' '}
            <span className="font-semibold text-foreground">{user?.batchName || 'Assigned Cohort'}</span>
          </p>
        </div>

        {exams.available.length > 0 && (
          <div className="shrink-0">
            <Link to={`/student/exams/${exams.available[0].id}/instructions`}>
              <Button size="lg" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold gap-2 shadow-md">
                <Play className="h-4 w-4 fill-white" />
                <span>Start Live Exam ({exams.available[0].code})</span>
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Live Exams"
          value={exams.available.length}
          change={exams.available.length > 0 ? 'Ready To Attempt' : 'None Active'}
          isPositive={exams.available.length > 0}
          icon={CalendarCheck}
          description="Open test windows"
        />
        <StatCard
          title="Upcoming Schedule"
          value={exams.upcoming.length}
          icon={Clock}
          description="Tests on academic calendar"
        />
        <StatCard
          title="Completed Assessments"
          value={results.length}
          icon={Award}
          description="Evaluated test attempts"
        />
        <StatCard
          title="Latest Assessment Score"
          value={latestResult ? `${latestResult.score} / ${latestResult.totalMarks}` : 'N/A'}
          change={latestResult ? `${latestResult.percentage}%` : undefined}
          isPositive={latestResult ? latestResult.percentage >= 70 : undefined}
          icon={TrendingUp}
          description={latestResult ? `Rank #${latestResult.rank} of ${latestResult.totalParticipants}` : 'No submissions yet'}
        />
      </div>

      {/* Available Exams & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-[#481D1A]">Examinations Ready To Take</CardTitle>
              <p className="text-xs text-muted-foreground">Timed computer-based assessments available for your cohort</p>
            </div>
            <Link to="/student/exams" className="text-xs font-semibold text-[#481D1A] hover:underline flex items-center">
              <span>All Exams</span>
              <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {exams.available.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active examinations currently open. Check your upcoming schedule.
              </div>
            ) : (
              exams.available.map((exam) => (
                <div
                  key={exam.id}
                  className="p-4 rounded-xl border border-[#481D1A]/20 bg-[#FFFBF5] hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#481D1A]">{exam.title}</h4>
                      <StatusBadge status="LIVE" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono font-semibold">{exam.code}</span>
                      <span>•</span>
                      <span>{exam.durationMinutes} Minutes</span>
                      <span>•</span>
                      <span>{exam.totalMarks} Marks</span>
                      <span>•</span>
                      <span>{exam.questionCount} Questions</span>
                    </div>
                  </div>

                  <Link to={`/student/exams/${exam.id}/instructions`}>
                    <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold gap-1.5 shadow-sm">
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Take Test</span>
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Announcements feed */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-[#481D1A]">Institutional Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 text-xs">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/60 space-y-1">
                <h4 className="font-bold text-[#481D1A]">{ann.title}</h4>
                <p className="text-muted-foreground line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
            <Link to="/student/announcements" className="block text-center text-xs font-semibold text-[#481D1A] pt-1 hover:underline">
              View all notices
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

