import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { Exam } from '@/types';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, Bell, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UpcomingExamsPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [upcoming, setUpcoming] = useState<Exam[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution || !user) return;
      const data = await examService.getStudentExams(institution.id, user.batchId);
      setUpcoming(data.upcoming);
    };
    load();
  }, [institution, user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Exam Schedule"
        description="Planned test dates and preparation timelines for your academic cohort."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'Exams', href: '/student/exams' },
          { label: 'Upcoming Schedule' },
        ]}
      />

      <div className="space-y-4">
        {upcoming.length === 0 ? (
          <Card className="border-[#E7DCD3] bg-white p-8 text-center text-xs text-muted-foreground">
            No upcoming exams currently on the calendar for your batch.
          </Card>
        ) : (
          upcoming.map((exam) => (
            <Card key={exam.id} className="border-[#E7DCD3] bg-white hover:shadow-sm transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#481D1A]/10 text-[#481D1A] px-2.5 py-0.5 rounded">
                      {exam.code}
                    </span>
                    <Badge variant="outline">{exam.subjectName}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#481D1A]">{exam.title}</h3>
                  <p className="text-xs text-muted-foreground max-w-xl">{exam.description}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Calendar className="h-4 w-4 text-[#481D1A]" />
                      <span>{formatDate(exam.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-[#481D1A]" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="rounded-xl bg-[#FFFBF5] border border-[#E7DCD3] px-4 py-2 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Status</span>
                    <span className="text-xs font-bold text-amber-700">Scheduled on Calendar</span>
                  </div>

                  <Link to={`/student/exams/${exam.id}/instructions`}>
                    <Button variant="outline" size="sm" className="text-xs border-[#481D1A] text-[#481D1A]">
                      Review Guidelines & Syllabus
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

