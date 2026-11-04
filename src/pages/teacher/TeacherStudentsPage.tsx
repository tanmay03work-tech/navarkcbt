import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { User, Batch } from '@/types';
import { Search, GraduationCap } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const TeacherStudentsPage: React.FC = () => {
  const { institution } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const s = await institutionService.getUsersByInstitutionAndRole(institution.id, 'STUDENT');
      const b = await institutionService.getBatchesByInstitution(institution.id);
      setStudents(s);
      setBatches(b);
    };
    load();
  }, [institution]);

  const filtered = students.filter(
    s =>
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
       s.userId.toLowerCase().includes(search.toLowerCase())) &&
      (batchFilter === 'ALL' || s.batchId === batchFilter)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Students Roster"
        description="Candidates enrolled across your assigned cohorts and test series."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Students' },
        ]}
      />

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or roll ID..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground">Filter Batch:</span>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs"
              >
                <option value="ALL">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">User ID</th>
                  <th className="py-3 px-4 font-semibold">Assigned Cohort</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-[#481D1A] flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#481D1A]/70" />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{s.userId}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[11px]">{s.batchName || 'Unassigned'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                    <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

