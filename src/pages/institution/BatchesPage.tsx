import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Layers, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { Batch } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const BatchesPage: React.FC = () => {
  const { institution } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    code: '',
    courseName: '',
    academicYear: '2025-2026',
  });

  const loadBatches = async () => {
    if (!institution) return;
    const data = await institutionService.getBatchesByInstitution(institution.id);
    setBatches(data);
  };

  useEffect(() => {
    loadBatches();
  }, [institution]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !newBatch.name || !newBatch.code) return;

    await institutionService.createBatch({
      institutionId: institution.id,
      name: newBatch.name,
      code: newBatch.code.toUpperCase(),
      courseName: newBatch.courseName || 'General Science',
      academicYear: newBatch.academicYear,
      assignedTeacherIds: [],
      status: 'ACTIVE',
    });

    setModalOpen(false);
    setNewBatch({ name: '', code: '', courseName: '', academicYear: '2025-2026' });
    loadBatches();
  };

  const filtered = batches.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches & Class Cohorts"
        description={`Manage academic cohorts and class groups in ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Batches' },
        ]}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Batch</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches by name or code..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Batch Name</th>
                  <th className="py-3 px-4 font-semibold">Batch Code</th>
                  <th className="py-3 px-4 font-semibold">Associated Course / Program</th>
                  <th className="py-3 px-4 font-semibold">Academic Year</th>
                  <th className="py-3 px-4 font-semibold">Enrolled Students</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-[#481D1A] flex items-center gap-2">
                      <Layers className="h-4 w-4 text-[#481D1A]/70" />
                      <span>{b.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{b.code}</td>
                    <td className="py-3 px-4 text-muted-foreground">{b.courseName}</td>
                    <td className="py-3 px-4 font-medium">{b.academicYear}</td>
                    <td className="py-3 px-4 font-semibold">{b.studentCount} students</td>
                    <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Batch Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white border-[#E7DCD3]">
          <DialogHeader>
            <DialogTitle>Create Academic Batch</DialogTitle>
            <DialogDescription className="text-xs">
              Define a new class cohort to enroll students and schedule batch-specific examinations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-3.5 text-xs py-2">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Batch Name *</label>
              <Input
                value={newBatch.name}
                onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                placeholder="e.g. Class 12 - Batch Gamma"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Batch Code *</label>
                <Input
                  value={newBatch.code}
                  onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. GAM-12"
                  className="font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Academic Year</label>
                <Input
                  value={newBatch.academicYear}
                  onChange={(e) => setNewBatch({ ...newBatch, academicYear: e.target.value })}
                  placeholder="2025-2026"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Course / Curriculum</label>
              <Input
                value={newBatch.courseName}
                onChange={(e) => setNewBatch({ ...newBatch, courseName: e.target.value })}
                placeholder="e.g. Senior Secondary STEM Foundation"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                Save Batch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

