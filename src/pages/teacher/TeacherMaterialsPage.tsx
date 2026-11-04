import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { StudyMaterial } from '@/types';
import { FileText, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const TeacherMaterialsPage: React.FC = () => {
  const { institution } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const m = await contentService.getStudyMaterials(institution.id);
      setMaterials(m);
    };
    load();
  }, [institution]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Handouts & Materials"
        description="Reading references and formula sheets shared with your classes."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Materials' },
        ]}
      />

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-3">
          {materials.map((mat) => (
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
                    <span>Uploaded by {mat.authorName} ({formatDate(mat.uploadedAt)})</span>
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
                <span>Download</span>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

