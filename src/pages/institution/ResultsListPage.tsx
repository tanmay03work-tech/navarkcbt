import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { resultService } from '@/services/result.service';
import { examService } from '@/services/exam.service';
import { ExamResult, Exam } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, Download, Award, FileSpreadsheet, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { exportExamResultsToCsv } from '@/utils/excelExporter';

export const ResultsListPage: React.FC = () => {
  const { institution } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      setLoading(true);
      try {
        const [resultsData, examsData] = await Promise.all([
          resultService.getResultsByInstitution(institution.id),
          examService.getExams(institution.id),
        ]);
        setResults(resultsData);
        setExams(examsData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [institution]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const matchesExam = selectedExamId === 'ALL' || r.examId === selectedExamId;
      const matchesSearch =
        r.studentName.toLowerCase().includes(search.toLowerCase()) ||
        r.studentUserId.toLowerCase().includes(search.toLowerCase()) ||
        r.examTitle.toLowerCase().includes(search.toLowerCase());
      return matchesExam && matchesSearch;
    });
  }, [results, selectedExamId, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    if (total === 0) return { total: 0, passed: 0, passRate: 0, avgScore: 0 };
    const passed = filtered.filter((r) => r.isPassed).length;
    const avgScore = Math.round((filtered.reduce((acc, r) => acc + r.score, 0) / total) * 10) / 10;
    const passRate = Math.round((passed / total) * 100);
    return { total, passed, passRate, avgScore };
  }, [filtered]);

  const handleExportCSV = () => {
    const examTitle =
      selectedExamId !== 'ALL'
        ? exams.find((e) => e.id === selectedExamId)?.title || 'Exam'
        : `${institution?.code || 'Navark'}_All_Exams`;
    exportExamResultsToCsv(filtered, examTitle);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Results & Gradebook"
        description={`Evaluated candidate scorecards, percentiles, and ranks for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
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
          <span>Export Gradebook (CSV)</span>
        </Button>
      </PageHeader>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-[#E7DCD3] bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Submissions</p>
              <h3 className="text-xl font-bold text-[#481D1A] mt-0.5">{stats.total}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-[#481D1A]/5 text-[#481D1A]">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7DCD3] bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Passed Count</p>
              <h3 className="text-xl font-bold text-emerald-700 mt-0.5">{stats.passed}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7DCD3] bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pass Ratio</p>
              <h3 className="text-xl font-bold text-[#481D1A] mt-0.5">{stats.passRate}%</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7DCD3] bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Average Score</p>
              <h3 className="text-xl font-bold text-[#481D1A] mt-0.5">{stats.avgScore}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, ID, or exam..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground font-medium">Filter Exam:</span>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#481D1A]"
              >
                <option value="ALL">All Examinations ({results.length} submissions)</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title} ({exam.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Rank</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">User ID</th>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Percentage</th>
                  <th className="py-3 px-4 font-semibold">Accuracy</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      Loading examination results...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-muted-foreground">
                      No results found for this selection.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-bold text-[#481D1A]">
                        #{r.rank || idx + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#481D1A]">{r.studentName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-xs text-muted-foreground">{r.studentUserId}</td>
                      <td className="py-3 px-4 font-medium">{r.examTitle}</td>
                      <td className="py-3 px-4 font-semibold">{r.score} / {r.totalMarks}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">{r.percentage}%</td>
                      <td className="py-3 px-4 font-medium">{r.accuracy ? `${r.accuracy}%` : '-'}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.isPassed ? 'PASSED' : 'FAILED'} /></td>
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
