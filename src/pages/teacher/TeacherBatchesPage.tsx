import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { Batch } from '@/types';
import { Layers, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TeacherBatchesPage: React.FC = () => {
  const { institution } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const b = await institutionService.getBatchesByInstitution(institution.id);
      setBatches(b);
    };
    load();
  }, [institution]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Assigned Batches & Classes"
        description="Class cohorts assigned to your instruction and test series administration."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Batches' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((b) => (
          <Card key={b.id} className="border-[#E7DCD3] bg-white hover:shadow-md transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="maroon" className="font-mono">{b.code}</Badge>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {b.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#481D1A]">{b.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{b.courseName}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E7DCD3]/60 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-[#481D1A]" />
                  <span><strong>{b.studentCount}</strong> Students Enrolled</span>
                </div>
                <span className="text-muted-foreground">{b.academicYear}</span>
              </div>

              <div className="pt-2">
                <Link to="/teacher/students">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-[#481D1A]/30 text-[#481D1A]">
                    <span>View Student Roster</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

