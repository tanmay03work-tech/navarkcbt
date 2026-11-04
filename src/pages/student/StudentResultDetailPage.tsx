import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/StatCard';
import { resultService } from '@/services/result.service';
import { ExamResult } from '@/types';
import { formatDate } from '@/lib/utils';
import { Award, CheckCircle2, XCircle, HelpCircle, ArrowLeft, Download } from 'lucide-react';

export const StudentResultDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!resultId) return;
      const data = await resultService.getResultById(resultId);
      setResult(data);
    };
    load();
  }, [resultId]);

  if (!result) return <div className="p-8 text-center text-sm text-muted-foreground">Loading scorecard...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Scorecard: ${result.examTitle}`}
        description={`Code: ${result.examCode} • Submitted on ${formatDate(result.submittedAt)}`}
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'My Results', href: '/student/results' },
          { label: 'Scorecard' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          className="text-xs gap-1 border-[#481D1A]/30 text-[#481D1A]"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Print / Save Scorecard</span>
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Candidate Score"
          value={`${result.score} / ${result.totalMarks}`}
          change={`${result.percentage}%`}
          isPositive={result.percentage >= 70}
          icon={Award}
          description="Total marks obtained"
        />
        <StatCard
          title="Cohort Rank"
          value={`#${result.rank}`}
          change={`Out of ${result.totalParticipants}`}
          isPositive
          icon={CheckCircle2}
          description="Competitive standing"
        />
        <StatCard
          title="Overall Accuracy"
          value={`${result.accuracy}%`}
          icon={Award}
          description="Correct / Attempted ratio"
        />
        <StatCard
          title="Time Spent"
          value={`${result.timeTakenMinutes} mins`}
          icon={Award}
          description="Active answering duration"
        />
      </div>

      {/* Question Attempt Breakdown */}
      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-[#481D1A]">Attempt Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Correct Responses</span>
              <span className="text-xl font-extrabold text-emerald-900">{result.correctAnswersCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-800 uppercase font-bold block">Incorrect Responses</span>
              <span className="text-xl font-extrabold text-rose-900">{result.incorrectAnswersCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-stone-100 border border-stone-200">
              <span className="text-[10px] text-stone-700 uppercase font-bold block">Unattempted</span>
              <span className="text-xl font-extrabold text-stone-900">{result.unattemptedCount}</span>
            </div>
          </div>

          {/* Subject Breakdown */}
          {result.subjectBreakdown && result.subjectBreakdown.length > 0 && (
            <div className="pt-4 border-t border-[#E7DCD3]">
              <h4 className="font-bold text-[#481D1A] mb-2">Subject / Sectional Performance</h4>
              <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Subject / Section</th>
                      <th className="py-2.5 px-3 font-semibold">Score Obtained</th>
                      <th className="py-2.5 px-3 font-semibold">Total Marks</th>
                      <th className="py-2.5 px-3 font-semibold">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                    {result.subjectBreakdown.map((sb, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-bold text-[#481D1A]">{sb.subjectName}</td>
                        <td className="py-2.5 px-3 font-semibold">{sb.score}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{sb.totalMarks}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">{sb.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

