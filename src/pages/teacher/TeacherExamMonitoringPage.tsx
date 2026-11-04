import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/common/StatCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveProctorCockpit } from '@/components/exams/LiveProctorCockpit';
import { examService } from '@/services/exam.service';
import { cbtProctorService } from '@/services/cbt/cbtProctorService';
import { Exam, ExamAttempt } from '@/types';
import {
  Users,
  Clock,
  CalendarCheck,
  Award,
  ArrowLeft,
  Shield,
  Activity,
  Calculator,
  RefreshCw,
} from 'lucide-react';

export const TeacherExamMonitoringPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isCalculatingPercentiles, setIsCalculatingPercentiles] = useState(false);

  const load = async () => {
    if (!examId) return;
    const e = await examService.getExamById(examId);
    if (e) {
      setExam(e);
      const attList = await examService.getAttemptsForExam(e.id);
      setAttempts(attList);
    }
  };

  useEffect(() => {
    load();
  }, [examId]);

  const handleComputePercentiles = async () => {
    if (!exam) return;
    setIsCalculatingPercentiles(true);
    try {
      await cbtProctorService.calculateNtaPercentiles(exam.id);
      await load();
      alert('NTA Percentiles calculated and updated for all candidates.');
    } catch (e) {
      console.error('Error calculating percentiles:', e);
    } finally {
      setIsCalculatingPercentiles(false);
    }
  };

  if (!exam) return <div className="p-8 text-center text-sm text-muted-foreground">Loading test monitor...</div>;

  const totalRegistered = exam.totalRegisteredStudents || 40;
  const submittedCount = exam.totalSubmissions || attempts.length;
  const inProgressCount = exam.status === 'LIVE' ? Math.max(0, totalRegistered - submittedCount) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Exam Monitoring: ${exam.title}`}
        description={`Code: ${exam.code} • Status: ${exam.status} • Batch: ${exam.assignedBatchNames.join(', ')}`}
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Exams', href: '/teacher/exams' },
          { label: 'Live Cockpit' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={isCalculatingPercentiles}
          onClick={handleComputePercentiles}
          className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A]"
        >
          <Calculator className={`h-3.5 w-3.5 ${isCalculatingPercentiles ? 'animate-spin' : ''}`} />
          <span>{isCalculatingPercentiles ? 'Calculating...' : 'Recalculate NTA Percentiles'}</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered"
          value={totalRegistered}
          icon={Users}
          description="Enrolled candidates"
        />
        <StatCard
          title="Submissions Completed"
          value={submittedCount}
          isPositive
          icon={CalendarCheck}
          description="Submitted test attempts"
        />
        <StatCard
          title="Active Sessions"
          value={inProgressCount}
          icon={Clock}
          description="Live online terminals"
        />
        <StatCard
          title="Average Score"
          value={exam.averageScore ? `${exam.averageScore} / ${exam.totalMarks}` : 'N/A'}
          icon={Award}
          description="Current batch mean"
        />
      </div>

      {/* Tabs: Live Cockpit vs Attempts Log */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-white border border-[#E7DCD3]">
          <TabsTrigger value="live" className="text-xs flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Live Terminal Cockpit</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5 text-[#481D1A]" />
            <span>Completed Submissions ({attempts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <LiveProctorCockpit
            institutionId={exam.institutionId}
            examId={exam.id}
            examTitle={exam.title}
          />
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Candidate Submissions & Attempts Log</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold">Roll / User ID</th>
                      <th className="py-2.5 px-3 font-semibold">Score</th>
                      <th className="py-2.5 px-3 font-semibold">Percentage</th>
                      <th className="py-2.5 px-3 font-semibold">Time Spent</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                    {attempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-muted-foreground">
                          No submissions recorded yet for this exam.
                        </td>
                      </tr>
                    ) : (
                      attempts.map((att) => (
                        <tr key={att.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-bold text-[#481D1A]">{att.studentName}</td>
                          <td className="py-2.5 px-3 font-mono">{att.studentUserId}</td>
                          <td className="py-2.5 px-3 font-semibold">{att.score} / {att.totalMarks}</td>
                          <td className="py-2.5 px-3 font-medium text-emerald-700">{att.percentage}%</td>
                          <td className="py-2.5 px-3 text-muted-foreground">{att.timeSpentMinutes} mins</td>
                          <td className="py-2.5 px-3"><StatusBadge status={att.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
