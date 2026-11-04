import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { examService } from '@/services/exam.service';
import { questionService } from '@/services/question.service';
import { User, Exam, Question } from '@/types';
import {
  UserCheck,
  CalendarCheck,
  FileQuestion,
  Mail,
  Phone,
  Edit,
  Layers,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { institution } = useAuth();
  const [teacher, setTeacher] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution || !id) return;
      const allTeachers = await institutionService.getUsersByInstitutionAndRole(institution.id, 'TEACHER');
      const found = allTeachers.find(t => t.id === id);
      if (found) {
        setTeacher(found);
        const eList = await examService.getExams(institution.id);
        const createdByMe = eList.filter(e => e.createdBy === found.id);
        setExams(createdByMe);
        const qList = await questionService.getQuestions(institution.id);
        const authored = qList.filter(q => q.authorId === found.id);
        setQuestions(authored);
      }
    };
    load();
  }, [institution, id]);

  if (!teacher) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading faculty record...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={teacher.name}
        description={`Faculty ID: ${teacher.userId} • Scoped to ${institution?.code}`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Teachers', href: '/institution/teachers' },
          { label: teacher.name },
        ]}
      >
        <Link to={`/institution/teachers/${teacher.id}/edit`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A]">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Exams Created"
          value={exams.length}
          icon={CalendarCheck}
          description="Authoring history"
        />
        <StatCard
          title="Questions Authored"
          value={questions.length}
          icon={FileQuestion}
          description="Contributed to question bank"
        />
        <StatCard
          title="Specializations"
          value={teacher.specialization?.length || 1}
          icon={Layers}
          description="Subject domains"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#481D1A]">Faculty Profile</CardTitle>
              <StatusBadge status={teacher.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Scoped ID</span>
              <p className="font-mono text-base font-bold text-[#481D1A]">{teacher.userId}</p>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Specializations</span>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {teacher.specialization?.map((spec, sIdx) => (
                  <Badge key={sIdx} variant="maroon" className="text-[10px]">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-[#E7DCD3] pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-[#481D1A]" />
                <span>{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-[#481D1A]" />
                  <span>{teacher.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exams Table */}
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Authored Examinations</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {exams.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No examinations authored yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Title</th>
                      <th className="py-2.5 px-3 font-semibold">Duration</th>
                      <th className="py-2.5 px-3 font-semibold">Marks</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DCD3]/60">
                    {exams.map((e) => (
                      <tr key={e.id}>
                        <td className="py-2.5 px-3 font-bold text-[#481D1A]">{e.title}</td>
                        <td className="py-2.5 px-3">{e.durationMinutes} mins</td>
                        <td className="py-2.5 px-3">{e.totalMarks}</td>
                        <td className="py-2.5 px-3"><StatusBadge status={e.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

