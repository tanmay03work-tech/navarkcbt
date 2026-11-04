import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { Announcement } from '@/types';
import { formatDate } from '@/lib/utils';
import { Bell, Plus, Megaphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const AnnouncementsPage: React.FC = () => {
  const { institution, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    targetAudience: 'ALL' as 'ALL' | 'STUDENTS' | 'TEACHERS',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
  });

  const loadAnnouncements = async () => {
    if (!institution) return;
    const a = await contentService.getAnnouncements(institution.id);
    setAnnouncements(a);
  };

  useEffect(() => {
    loadAnnouncements();
  }, [institution]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !newAnn.title || !newAnn.content) return;

    await contentService.createAnnouncement({
      institutionId: institution.id,
      title: newAnn.title,
      content: newAnn.content,
      targetAudience: newAnn.targetAudience,
      authorName: user?.name || 'Administration',
      priority: newAnn.priority,
    });

    setModalOpen(false);
    setNewAnn({ title: '', content: '', targetAudience: 'ALL', priority: 'MEDIUM' });
    loadAnnouncements();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Bulletins & Announcements"
        description={`Broadcast official test notifications and schedules to candidates in ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Announcements' },
        ]}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active announcements for this institution.
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:bg-[#FFFBF5] transition-colors text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-[#481D1A]" />
                      <h4 className="font-bold text-[#481D1A] text-sm">{ann.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        Audience: {ann.targetAudience}
                      </Badge>
                      <Badge
                        variant={ann.priority === 'HIGH' ? 'destructive' : ann.priority === 'MEDIUM' ? 'warning' : 'secondary'}
                        className="text-[10px]"
                      >
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
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white border-[#E7DCD3]">
          <DialogHeader>
            <DialogTitle>Broadcast Announcement</DialogTitle>
            <DialogDescription className="text-xs">
              Publish a notice to student and faculty portals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs py-2">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Headline *</label>
              <Input
                value={newAnn.title}
                onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                placeholder="e.g. Test Room Allocations for Weekend Mock Assessment"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Audience</label>
                <select
                  value={newAnn.targetAudience}
                  onChange={(e) => setNewAnn({ ...newAnn, targetAudience: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                >
                  <option value="ALL">Entire Campus (All)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="TEACHERS">Faculty Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Priority</label>
                <select
                  value={newAnn.priority}
                  onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Notice Body *</label>
              <textarea
                rows={4}
                value={newAnn.content}
                onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                placeholder="Detail the examination directives, schedule changes, or terminal instructions..."
                className="w-full rounded-md border border-input p-2.5 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                Publish Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

