import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';
import { Megaphone, Bell } from 'lucide-react';

export const StudentAnnouncementsPage: React.FC = () => {
  const { institution } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const data = await contentService.getAnnouncements(institution.id);
      setAnnouncements(data);
    };
    load();
  }, [institution]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Bulletins & Announcements"
        description="Official campus notices and exam directives issued by administrators."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'Announcements' },
        ]}
      />

      <div className="space-y-4">
        {announcements.map((ann) => (
          <Card key={ann.id} className="border-[#E7DCD3] bg-white hover:shadow-xs transition-all">
            <CardContent className="p-5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[#481D1A]" />
                  <h3 className="font-bold text-[#481D1A] text-sm">{ann.title}</h3>
                  <Badge variant={ann.priority === 'HIGH' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {ann.priority} Priority
                  </Badge>
                </div>
                <span className="text-muted-foreground text-[10px]">
                  {formatDate(ann.publishedAt)}
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {ann.content}
              </p>

              <div className="text-[10px] text-muted-foreground pt-1 border-t border-[#E7DCD3]/60">
                Posted by: <span className="font-semibold text-foreground">{ann.authorName}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

