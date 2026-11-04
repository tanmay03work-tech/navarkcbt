import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { examService } from '@/services/exam.service';
import { Exam } from '@/types';
import {
  ShieldAlert,
  Clock,
  Award,
  CheckCircle2,
  FileQuestion,
  Play,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export const ExamInstructionsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!examId) return;
      const data = await examService.getExamById(examId);
      setExam(data);
    };
    load();
  }, [examId]);

  if (!exam) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading exam instructions...</div>;
  }

  const handleStartExam = () => {
    if (!acknowledged) return;
    navigate(`/student/exams/${exam.id}/attempt`);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title={exam.title}
        description={`Code: ${exam.code} • Subject: ${exam.subjectName}`}
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'Exams', href: '/student/exams' },
          { label: 'Instructions' },
        ]}
      />

      {/* Metadata Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 rounded-xl bg-white border border-[#E7DCD3]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Duration</span>
          <span className="text-sm font-bold text-[#481D1A]">{exam.durationMinutes} Minutes</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E7DCD3]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Marks</span>
          <span className="text-sm font-bold text-[#481D1A]">{exam.totalMarks} Marks</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E7DCD3]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Questions</span>
          <span className="text-sm font-bold text-[#481D1A]">{exam.questionCount} Items</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E7DCD3]">
          <span className="text-[10px] text-muted-foreground uppercase font-bold block">Passing Cutoff</span>
          <span className="text-sm font-bold text-[#481D1A]">{exam.passMarks} Marks</span>
        </div>
      </div>

      {/* General Instructions Card */}
      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-[#481D1A]">Official Candidate Directives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-foreground/90 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-[#481D1A]">1. General Clock & Timer Directives</h4>
            <p className="text-muted-foreground">
              The countdown timer located at the top right corner of your terminal displays remaining time. When the clock reaches zero, the examination will end automatically and submit your responses.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#481D1A]">2. Question Palette & Navigation</h4>
            <p className="text-muted-foreground">
              The right-hand Question Palette illustrates the exact status of each question:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-lg bg-[#FFFBF5] border border-[#E7DCD3]">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-stone-300 inline-block shrink-0" />
                <span>You have not visited the question yet.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-rose-600 inline-block shrink-0" />
                <span>You have not answered the question.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-emerald-600 inline-block shrink-0" />
                <span>You have answered the question.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-purple-600 inline-block shrink-0" />
                <span>You have marked the question for review.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#481D1A]">3. Answering Questions</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              <li>To select an option, click on the desired answer choice.</li>
              <li>To deselect your chosen answer, click <strong>Clear Response</strong>.</li>
              <li>To save your answer, you MUST click <strong>Save & Next</strong>.</li>
              <li>For numerical questions, enter valid numerical characters up to 2 decimal places.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#481D1A]">4. Specific Exam Instructions</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              {exam.instructions.map((inst, i) => (
                <li key={i}>{inst}</li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#E7DCD3]">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="h-4 w-4 rounded mt-0.5 text-[#481D1A] focus:ring-[#481D1A]"
              />
              <span className="text-xs font-semibold text-amber-950">
                I have read, understood, and agree to abide by all the examination guidelines specified above. I certify that I will not use unauthorized materials or open alternative browser tabs.
              </span>
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-[#E7DCD3] pt-4">
          <Link to="/student/exams">
            <Button variant="outline" size="sm" className="text-xs gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Schedule</span>
            </Button>
          </Link>

          <Button
            size="lg"
            disabled={!acknowledged}
            onClick={handleStartExam}
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-bold gap-2 px-6 shadow-md"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>I Am Ready to Begin Examination</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

