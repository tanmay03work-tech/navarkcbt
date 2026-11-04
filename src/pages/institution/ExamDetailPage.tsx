import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/common/StatCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveProctorCockpit } from '@/components/exams/LiveProctorCockpit';
import { examService } from '@/services/exam.service';
import { questionService } from '@/services/question.service';
import { Exam, Question, ExamAttempt } from '@/types';
import {
  CalendarCheck,
  Users,
  Award,
  Clock,
  Edit,
  Eye,
  FileQuestion,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const ExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      const e = await examService.getExamById(examId);
      if (e) {
        setExam(e);
        const qList = await questionService.getQuestions(e.institutionId);
        const filteredQ = qList.filter(q => e.questionIds.includes(q.id));
        setQuestions(filteredQ);
        const attList = await examService.getAttemptsForExam(e.id);
        setAttempts(attList);
      }
    };
    load();
  }, [examId]);

  if (!exam) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading exam details...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam.title}
        description={`Code: ${exam.code} • ${exam.subjectName} • ${exam.assignedBatchNames.join(', ')}`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Exams', href: '/institution/exams' },
          { label: exam.title },
        ]}
      >
        <Link to={`/institution/exams/${exam.id}/edit`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A]">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Configuration</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Registered Candidates"
          value={exam.totalRegisteredStudents}
          icon={Users}
          description="Eligible batch students"
        />
        <StatCard
          title="Submitted Attempts"
          value={exam.totalSubmissions || attempts.length}
          icon={CalendarCheck}
          description="Turned in scorecards"
        />
        <StatCard
          title="Test Duration"
          value={`${exam.durationMinutes} min`}
          icon={Clock}
          description="Allocated timer window"
        />
        <StatCard
          title="Passing Mark"
          value={`${exam.passMarks} / ${exam.totalMarks}`}
          icon={Award}
          description="Required cutoff"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules & Summary */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#481D1A]">Test Specifications</CardTitle>
              <StatusBadge status={exam.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#E7DCD3]/60">
              <span className="text-muted-foreground">Negative Marking</span>
              <span className="font-semibold">{exam.negativeMarking ? 'Active' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E7DCD3]/60">
              <span className="text-muted-foreground">Randomize Order</span>
              <span className="font-semibold">{exam.shuffleQuestions ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E7DCD3]/60">
              <span className="text-muted-foreground">Immediate Results</span>
              <span className="font-semibold">{exam.showResultsImmediately ? 'Yes' : 'Hidden'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#E7DCD3]/60">
              <span className="text-muted-foreground">Start Window</span>
              <span className="font-mono text-[11px]">{formatDate(exam.startTime)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">End Window</span>
              <span className="font-mono text-[11px]">{formatDate(exam.endTime)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="live" className="space-y-4">
            <TabsList className="bg-white border border-[#E7DCD3]">
              <TabsTrigger value="live" className="text-xs">Live Proctor Cockpit</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs">Selected Questions ({questions.length})</TabsTrigger>
              <TabsTrigger value="attempts" className="text-xs">Submitted Attempts ({attempts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="live">
              <LiveProctorCockpit
                institutionId={exam.institutionId}
                examId={exam.id}
                examTitle={exam.title}
              />
            </TabsContent>

            <TabsContent value="questions">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4 space-y-3">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/40 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#481D1A]">Question #{idx + 1} ({q.type})</span>
                        <span className="text-muted-foreground font-semibold">+{q.positiveMarks} / -{q.negativeMarks}</span>
                      </div>
                      <p className="font-medium text-foreground line-clamp-2">{q.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attempts">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4">
                  {attempts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No candidate submissions received yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Student Name</th>
                            <th className="py-2.5 px-3 font-semibold">User ID</th>
                            <th className="py-2.5 px-3 font-semibold">Score</th>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7DCD3]/60">
                          {attempts.map((att) => (
                            <tr key={att.id}>
                              <td className="py-2.5 px-3 font-bold text-[#481D1A]">{att.studentName}</td>
                              <td className="py-2.5 px-3 font-mono">{att.studentUserId}</td>
                              <td className="py-2.5 px-3 font-semibold">{att.score} / {att.totalMarks}</td>
                              <td className="py-2.5 px-3"><StatusBadge status={att.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

