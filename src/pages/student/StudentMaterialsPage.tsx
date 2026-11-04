import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { StudyMaterial } from '@/types';
import { FileText, Download, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const StudentMaterialsPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!institution || !user) return;
      const data = await contentService.getStudyMaterials(institution.id, user.batchId);
      setMaterials(data);
    };
    load();
  }, [institution, user]);

  const filtered = materials.filter(
    m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      m.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Handouts & Study Materials"
        description="Reference notes, formulas, and mock paper solutions published for your cohort."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'Study Materials' },
        ]}
      />

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handouts by topic or subject..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No handouts published for your cohort yet.
              </div>
            ) : (
              filtered.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:bg-[#FFFBF5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-[#481D1A]/10 text-[#481D1A]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#481D1A]">{mat.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-semibold text-foreground">{mat.subjectName}</span>
                        <span>•</span>
                        <span>{mat.topic}</span>
                        <span>•</span>
                        <span>{mat.fileSize}</span>
                        <span>•</span>
                        <span>By {mat.authorName} ({formatDate(mat.uploadedAt)})</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert(`Downloading ${mat.title}`)}
                    className="h-8 text-xs gap-1 border-[#481D1A]/30 text-[#481D1A]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download File</span>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

