import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { examService } from '@/services/exam.service';
import { Exam } from '@/types';
import { CheckCircle2, Award, CalendarCheck, Home, ArrowRight } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export const ExamSubmissionSuccessPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      const data = await examService.getExamById(examId);
      setExam(data);
    };
    load();
  }, [examId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4">
      <Card className="border-[#E7DCD3] bg-white shadow-xl max-w-lg w-full text-center p-8 space-y-6">
        <div className="flex justify-center">
          <AppLogo size="md" linkToHome={false} />
        </div>

        <div className="space-y-2">
          <div className="h-16 w-16 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-[#481D1A]">
            Examination Submitted!
          </CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Your responses for <span className="font-bold text-foreground">{exam?.title || 'Examination'}</span> have been securely committed to the institutional test server.
          </p>
        </div>

        <div className="rounded-xl bg-[#FFFBF5] border border-[#E7DCD3] p-4 text-xs text-left space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Submission Time:</span>
            <span className="font-semibold text-foreground">{formatDateTime(new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exam Code:</span>
            <span className="font-semibold text-foreground">{exam?.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-bold text-emerald-700">SUBMITTED & EVALUATED</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/student/results">
            <Button className="w-full sm:w-auto bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold gap-1.5 shadow-sm">
              <Award className="h-4 w-4" />
              <span>View Scorecard & Analysis</span>
            </Button>
          </Link>
          <Link to="/student">
            <Button variant="outline" className="w-full sm:w-auto text-xs border-[#481D1A]/30 text-[#481D1A]">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

