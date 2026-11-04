import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { resultService } from '@/services/result.service';
import { ExamResult } from '@/types';
import { Search, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { exportExamResultsToCsv } from '@/utils/excelExporter';

export const TeacherResultsPage: React.FC = () => {
  const { institution } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const data = await resultService.getResultsByInstitution(institution.id);
      setResults(data);
    };
    load();
  }, [institution]);

  const filtered = results.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentUserId.toLowerCase().includes(search.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    exportExamResultsToCsv(filtered, `${institution?.code || 'Batch'}_Results`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Test Results"
        description="Candidate scorecards and accuracy ratings for your assigned cohorts."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Results' },
        ]}
      >
        <Button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          variant="outline"
          className="border-[#481D1A] text-[#481D1A] hover:bg-[#481D1A]/5 text-xs gap-1.5 shadow-sm font-semibold"
        >
          <Download className="h-4 w-4" />
          <span>Export Results (CSV)</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name or test title..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">User ID</th>
                  <th className="py-3 px-4 font-semibold">Examination</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Percentage</th>
                  <th className="py-3 px-4 font-semibold">Rank</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No results found matching your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-bold text-[#481D1A]">{r.studentName}</td>
                      <td className="py-3 px-4 font-mono font-bold">{r.studentUserId}</td>
                      <td className="py-3 px-4">{r.examTitle}</td>
                      <td className="py-3 px-4 font-semibold">{r.score} / {r.totalMarks}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{r.percentage}%</td>
                      <td className="py-3 px-4 font-semibold">#{r.rank} of {r.totalParticipants}</td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(r.submittedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
