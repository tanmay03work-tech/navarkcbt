import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { examService } from '@/services/exam.service';
import { Exam } from '@/types';
import { formatDate } from '@/lib/utils';
import { CalendarCheck, Play, Eye, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentExamsPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [exams, setExams] = useState<{ available: Exam[]; upcoming: Exam[]; completed: Exam[] }>({
    available: [],
    upcoming: [],
    completed: [],
  });

  useEffect(() => {
    const load = async () => {
      if (!institution || !user) return;
      const data = await examService.getStudentExams(institution.id, user.batchId);
      setExams(data);
    };
    load();
  }, [institution, user]);

  const renderExamCards = (list: Exam[], isLive: boolean = false) => {
    if (list.length === 0) {
      return (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No examinations in this section.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((exam) => (
          <Card key={exam.id} className="border-[#E7DCD3] bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#481D1A] bg-[#481D1A]/10 px-2.5 py-0.5 rounded">
                  {exam.code}
                </span>
                <StatusBadge status={exam.status} />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#481D1A]">{exam.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#E7DCD3]/60 text-center text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">Duration</span>
                  <span className="font-bold text-foreground">{exam.durationMinutes} mins</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Marks</span>
                  <span className="font-bold text-foreground">{exam.totalMarks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">Questions</span>
                  <span className="font-bold text-foreground">{exam.questionCount}</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Window: {formatDate(exam.startTime)}
                </span>
                {isLive ? (
                  <Link to={`/student/exams/${exam.id}/instructions`}>
                    <Button size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold gap-1.5 shadow-sm">
                      <Play className="h-3 w-3 fill-white" />
                      <span>Take Test</span>
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/student/exams/${exam.id}/instructions`}>
                    <Button variant="outline" size="sm" className="text-xs border-[#481D1A]/30">
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Examinations"
        description="Active, scheduled, and past computer-based examinations assigned to your cohort."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'My Exams' },
        ]}
      />

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList className="bg-white border border-[#E7DCD3]">
          <TabsTrigger value="available" className="text-xs">
            Live / Available ({exams.available.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs">
            Upcoming Schedule ({exams.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs">
            Completed ({exams.completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {renderExamCards(exams.available, true)}
        </TabsContent>

        <TabsContent value="upcoming">
          {renderExamCards(exams.upcoming, false)}
        </TabsContent>

        <TabsContent value="completed">
          {renderExamCards(exams.completed, false)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

