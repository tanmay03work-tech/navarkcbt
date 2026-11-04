import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, CalendarCheck, MoreHorizontal, Eye, Copy, Trash2, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { Exam, ExamStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ExamsListPage: React.FC = () => {
  const { institution } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExamStatus | 'ALL'>('ALL');

  const loadExams = async () => {
    if (!institution) return;
    const data = await examService.getExams(institution.id, statusFilter);
    setExams(data);
  };

  useEffect(() => {
    loadExams();
  }, [institution, statusFilter]);

  const handleDuplicate = async (id: string) => {
    await examService.duplicateExam(id);
    loadExams();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this examination?')) {
      await examService.deleteExam(id);
      loadExams();
    }
  };

  const filtered = exams.filter(
    e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      e.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations & Assessments"
        description={`Scheduled, active, and completed test series configured for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Exams' },
        ]}
      >
        <Link to="/institution/exams/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Examination</span>
          </Button>
        </Link>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams by title or code..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {(['ALL', 'LIVE', 'SCHEDULED', 'COMPLETED', 'DRAFT'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-[#481D1A] text-white font-semibold'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {st === 'ALL' ? 'All Exams' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Exam Code</th>
                  <th className="py-3 px-4 font-semibold">Assigned Cohort</th>
                  <th className="py-3 px-4 font-semibold">Duration / Marks</th>
                  <th className="py-3 px-4 font-semibold">Questions</th>
                  <th className="py-3 px-4 font-semibold">Submissions</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No examinations found matching the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-bold text-[#481D1A]">
                        <Link to={`/institution/exams/${e.id}`} className="hover:underline flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-[#481D1A]/70" />
                          <span>{e.title}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-xs">{e.code}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {e.assignedBatchNames.join(', ') || 'All Batches'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{e.durationMinutes} mins</span>
                        <span className="text-muted-foreground text-[10px] block">{e.totalMarks} marks</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{e.questionCount} Qs</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{e.totalSubmissions}</span>
                        <span className="text-muted-foreground text-[10px]"> / {e.totalRegisteredStudents}</span>
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs bg-[#FFFBF5] border-[#E7DCD3]">
                            <DropdownMenuItem asChild>
                              <Link to={`/institution/exams/${e.id}`} className="flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5" />
                                <span>Monitor & Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/institution/exams/${e.id}/edit`} className="flex items-center gap-2">
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit Config</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(e.id)} className="flex items-center gap-2">
                              <Copy className="h-3.5 w-3.5" />
                              <span>Duplicate Exam</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(e.id)} className="flex items-center gap-2 text-rose-600">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
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

