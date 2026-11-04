import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { AppNotification } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = async () => {
    if (!user) return;
    const data = await contentService.getUserNotifications(user.id);
    setNotifications(data);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await contentService.markAllNotificationsRead(user.id);
    loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await contentService.markNotificationRead(id);
    loadNotifications();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Notifications & Alerts"
        description="Examination alerts, result releases, and administrative reminders."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="text-xs gap-1.5 border-[#481D1A]/30 text-[#481D1A]"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Mark All as Read</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              You are all caught up! No active notifications.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all text-xs flex items-start justify-between gap-3 ${
                  n.isRead
                    ? 'border-[#E7DCD3]/60 bg-[#FFFBF5]/30 text-muted-foreground'
                    : 'border-[#481D1A]/20 bg-white font-medium text-foreground shadow-xs'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#481D1A] text-sm">{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-rose-600" />
                    )}
                    <Badge variant="outline" className="text-[10px]">{n.type}</Badge>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground block pt-1">
                    {formatDate(n.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.link && (
                    <Link to={n.link}>
                      <Button variant="outline" size="sm" className="h-7 text-xs border-[#481D1A]/30">
                        View
                      </Button>
                    </Link>
                  )}
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkRead(n.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

