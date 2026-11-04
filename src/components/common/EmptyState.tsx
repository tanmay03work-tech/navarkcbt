import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E7DCD3] p-10 text-center bg-white/50">
      <div className="rounded-full bg-[#481D1A]/10 p-3.5 text-[#481D1A]">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#481D1A]">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-4 bg-[#481D1A] text-white hover:bg-[#351412]"
          size="sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

