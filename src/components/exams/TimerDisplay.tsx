import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  totalSeconds: number;
  initialSeconds?: number;
  onTimeExpired: () => void;
  onTick?: (secondsRemaining: number) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  totalSeconds,
  initialSeconds,
  onTimeExpired,
  onTick,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(
    initialSeconds !== undefined ? initialSeconds : totalSeconds
  );

  useEffect(() => {
    if (initialSeconds !== undefined) {
      setSecondsRemaining(initialSeconds);
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (onTick) onTick(Math.max(0, next));
        if (next <= 0) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onTimeExpired, onTick]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const isUrgent = secondsRemaining < 300; // less than 5 mins

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold shadow-xs transition-colors',
        isUrgent
          ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
          : 'bg-white text-[#481D1A] border-[#E7DCD3]'
      )}
    >
      {isUrgent ? (
        <AlertTriangle className="h-4 w-4 text-rose-600" />
      ) : (
        <Clock className="h-4 w-4 text-[#481D1A]" />
      )}
      <span>Time Left:</span>
      <span>
        {hours > 0 ? `${pad(hours)}:` : ''}
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
};

