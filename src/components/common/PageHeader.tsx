import React from 'react';
import { Breadcrumb } from '@/components/common/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  breadcrumbs,
}) => {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#481D1A]">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
      </div>
    </div>
  );
};

