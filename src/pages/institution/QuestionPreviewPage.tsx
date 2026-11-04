import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { questionService } from '@/services/question.service';
import { Question } from '@/types';
import { FormattedExamText } from '@/components/common/FormattedExamText';
import { normalizeExamText } from '@/utils/examText';
import { CheckCircle2, Edit, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const QuestionPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const q = await questionService.getQuestionById(id);
      setQuestion(q);
    };
    load();
  }, [id]);

  if (!question) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading question preview...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Question Preview"
        description="Candidate-mode rendering with staff answer key verification."
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Question Bank', href: '/institution/questions' },
          { label: 'Preview' },
        ]}
      >
        <Link to={`/institution/questions/${question.id}/edit`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A]">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Question</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Candidate-facing Card */}
      <Card className="border-[#E7DCD3] bg-white shadow-sm">
        <CardHeader className="border-b border-[#E7DCD3] pb-3 bg-[#FFFBF5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="maroon">{question.subjectName}</Badge>
              <Badge variant="outline">{question.topic}</Badge>
              <Badge variant="secondary">{question.difficulty}</Badge>
            </div>
            <span className="text-xs font-semibold text-[#481D1A]">
              +{question.positiveMarks} / -{question.negativeMarks} Marks
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6 text-sm">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Question Statement
            </span>
            <div className="text-base text-foreground font-medium leading-relaxed">
              <FormattedExamText text={question.text} />
            </div>

            {question.imageUrl && (
              <div className="my-3 p-2 rounded-xl bg-white border border-[#E7DCD3] inline-block max-w-full">
                <img
                  src={question.imageUrl}
                  alt="Question Diagram"
                  className="max-h-64 rounded object-contain"
                />
              </div>
            )}
          </div>

          {/* Options */}
          {question.type === 'NUMERICAL' ? (
            <div className="p-4 rounded-lg bg-stone-50 border border-[#E7DCD3] space-y-2">
              <span className="text-xs font-semibold text-[#481D1A]">Candidate Numerical Input:</span>
              <input
                disabled
                placeholder="[ Numerical keypad input field ]"
                className="w-48 rounded border border-input p-2 font-mono text-xs bg-white"
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Response Choices
              </span>
              {question.options.map((opt, idx) => {
                const isCorrect = opt.isCorrect;
                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-lg border transition-colors flex items-center justify-between text-xs ${
                      showAnswerKey && isCorrect
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
                        : 'border-[#E7DCD3] bg-[#FFFBF5]/40 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#481D1A] w-6">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{normalizeExamText(opt.text)}</span>
                    </div>

                    {showAnswerKey && isCorrect && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Correct Key</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Answer Key & Explanation Staff Box */}
          <div className="pt-4 border-t border-[#E7DCD3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#481D1A] uppercase tracking-wider">
                Staff Solution & Pedagogical Explanation
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="text-xs h-7 text-muted-foreground gap-1"
              >
                {showAnswerKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                <span>{showAnswerKey ? 'Hide Correct Key' : 'Reveal Correct Key'}</span>
              </Button>
            </div>
            {showAnswerKey && (
              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                {question.type === 'NUMERICAL' && (
                  <p className="font-bold font-mono mb-1">
                    Correct Value: {question.correctAnswerText}
                  </p>
                )}
                <p>{question.explanation || 'No explanation provided for this question.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

