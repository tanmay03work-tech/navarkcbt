import React from 'react';
import { QuestionPaletteStatus } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionPaletteProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionStatuses: Record<number, QuestionPaletteStatus>;
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentQuestionIndex,
  questionStatuses,
  onSelectQuestion,
}) => {
  // Counts
  const counts = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    markedForReview: 0,
    answeredAndMarked: 0,
  };

  for (let i = 0; i < totalQuestions; i++) {
    const status = questionStatuses[i] || 'NOT_VISITED';
    if (status === 'ANSWERED') counts.answered++;
    else if (status === 'VISITED') counts.notAnswered++;
    else if (status === 'MARKED_FOR_REVIEW') counts.markedForReview++;
    else if (status === 'ANSWERED_AND_MARKED') counts.answeredAndMarked++;
    else counts.notVisited++;
  }

  const getStatusClasses = (status: QuestionPaletteStatus, isCurrent: boolean) => {
    let base = 'relative flex items-center justify-center font-bold text-xs rounded-lg transition-all h-9 w-9 border ';

    if (isCurrent) {
      base += 'ring-2 ring-offset-2 ring-[#481D1A] ';
    }

    switch (status) {
      case 'ANSWERED':
        return base + 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
      case 'VISITED':
        return base + 'bg-rose-600 text-white border-rose-700 shadow-sm';
      case 'MARKED_FOR_REVIEW':
        return base + 'bg-purple-600 text-white border-purple-700 shadow-sm';
      case 'ANSWERED_AND_MARKED':
        return base + 'bg-purple-600 text-white border-purple-700 shadow-sm';
      case 'NOT_VISITED':
      default:
        return base + 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300';
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-stone-100 border border-[#E7DCD3]">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white">
            {counts.answered}
          </span>
          <span className="text-muted-foreground">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-rose-600 flex items-center justify-center text-[9px] font-bold text-white">
            {counts.notAnswered}
          </span>
          <span className="text-muted-foreground">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-stone-200 flex items-center justify-center text-[9px] font-bold text-stone-700">
            {counts.notVisited}
          </span>
          <span className="text-muted-foreground">Not Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
            {counts.markedForReview}
          </span>
          <span className="text-muted-foreground">Marked for Review</span>
        </div>
        <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-[#E7DCD3]">
          <span className="relative h-4 w-4 rounded bg-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
            {counts.answeredAndMarked}
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-white" />
          </span>
          <span className="text-[10px] text-muted-foreground">Answered & Marked for Review</span>
        </div>
      </div>

      {/* Grid Palette */}
      <div>
        <h4 className="text-xs font-bold text-[#481D1A] uppercase tracking-wider mb-2">
          Question Palette ({totalQuestions} Total)
        </h4>
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const status = questionStatuses[idx] || 'NOT_VISITED';
            const isCurrent = idx === currentQuestionIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectQuestion(idx)}
                className={getStatusClasses(status, isCurrent)}
              >
                <span>{idx + 1}</span>
                {status === 'ANSWERED_AND_MARKED' && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

