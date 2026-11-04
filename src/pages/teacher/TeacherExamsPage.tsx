import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Plus, CalendarCheck, Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { Exam } from '@/types';
import { formatDate } from '@/lib/utils';

export const TeacherExamsPage: React.FC = () => {
  const { institution, user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const data = await examService.getExams(institution.id);
      setExams(data);
    };
    load();
  }, [institution]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Exam Management"
        description="Schedule and monitor examinations for your assigned cohorts."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Exams' },
        ]}
      >
        <Link to="/teacher/exams/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Examination</span>
          </Button>
        </Link>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Exam Title</th>
                  <th className="py-3 px-4 font-semibold">Subject / Code</th>
                  <th className="py-3 px-4 font-semibold">Assigned Cohorts</th>
                  <th className="py-3 px-4 font-semibold">Duration / Marks</th>
                  <th className="py-3 px-4 font-semibold">Submissions</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {exams.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-[#481D1A] flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4 text-[#481D1A]/70" />
                      <span>{e.title}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{e.subjectName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{e.code}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{e.assignedBatchNames.join(', ')}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{e.durationMinutes} mins</span>
                      <span className="text-[10px] text-muted-foreground block">{e.totalMarks} marks</span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {e.totalSubmissions} / {e.totalRegisteredStudents}
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={e.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/teacher/exams/${e.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-[#481D1A]/30">
                            <Eye className="h-3.5 w-3.5" />
                            <span>Monitor</span>
                          </Button>
                        </Link>
                        <Link to={`/teacher/exams/${e.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-[#481D1A]">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

