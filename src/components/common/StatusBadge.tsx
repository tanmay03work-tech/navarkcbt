import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExamStatus, QuestionPaletteStatus } from '@/types';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'LIVE':
    case 'PUBLISHED':
    case 'SUBMITTED':
      return <Badge variant="success">{status}</Badge>;

    case 'PENDING':
    case 'SCHEDULED':
    case 'IN_PROGRESS':
      return <Badge variant="warning">{status}</Badge>;

    case 'SUSPENDED':
    case 'REJECTED':
    case 'INACTIVE':
    case 'DISQUALIFIED':
      return <Badge variant="destructive">{status}</Badge>;

    case 'DRAFT':
    case 'ARCHIVED':
    case 'COMPLETED':
      return <Badge variant="secondary">{status}</Badge>;

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

