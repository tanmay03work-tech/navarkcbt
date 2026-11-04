import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { resultService } from '@/services/result.service';
import { ExamResult } from '@/types';
import { formatDate } from '@/lib/utils';
import { Award, Eye, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const data = await resultService.getStudentResults(user.id);
      setResults(data);
    };
    load();
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assessment Results & Scorecards"
        description="Official scores, performance percentiles, and answer solutions for published exams."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'My Results' },
        ]}
      />

      <div className="space-y-4">
        {results.length === 0 ? (
          <Card className="border-[#E7DCD3] bg-white p-12 text-center text-xs text-muted-foreground">
            No published examination results available for your account yet. Complete an exam to view your scorecard!
          </Card>
        ) : (
          results.map((r) => (
            <Card key={r.id} className="border-[#E7DCD3] bg-white hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#481D1A]/10 text-[#481D1A] px-2.5 py-0.5 rounded">
                      {r.examCode}
                    </span>
                    <StatusBadge status={r.isPassed ? 'PASSED' : 'FAILED'} />
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      Rank #{r.rank} of {r.totalParticipants} Candidates
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#481D1A]">{r.examTitle}</h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span>Submitted on: {formatDate(r.submittedAt)}</span>
                    <span>•</span>
                    <span>Time Taken: {r.timeTakenMinutes} Mins</span>
                    <span>•</span>
                    <span>Accuracy: {r.accuracy}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-start md:self-center">
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#481D1A]">
                      {r.score} <span className="text-sm font-normal text-muted-foreground">/ {r.totalMarks}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {r.percentage}% Score
                    </span>
                  </div>

                  <Link to={`/student/results/${r.id}`}>
                    <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold gap-1.5 shadow-sm">
                      <Eye className="h-4 w-4" />
                      <span>View Scorecard</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

