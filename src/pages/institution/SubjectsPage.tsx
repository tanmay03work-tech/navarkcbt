import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { Subject } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const SubjectsPage: React.FC = () => {
  const { institution } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
    description: '',
  });

  const loadSubjects = async () => {
    if (!institution) return;
    const data = await institutionService.getSubjectsByInstitution(institution.id);
    setSubjects(data);
  };

  useEffect(() => {
    loadSubjects();
  }, [institution]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !newSubject.name || !newSubject.code) return;

    await institutionService.createSubject({
      institutionId: institution.id,
      name: newSubject.name,
      code: newSubject.code.toUpperCase(),
      description: newSubject.description || 'Core subject syllabus',
      status: 'ACTIVE',
    });

    setModalOpen(false);
    setNewSubject({ name: '', code: '', description: '' });
    loadSubjects();
  };

  const filtered = subjects.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects & Course Catalog"
        description={`Configure subjects and question bank taxonomy in ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Subjects' },
        ]}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subjects by name or code..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subject Title</th>
                  <th className="py-3 px-4 font-semibold">Subject Code</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Question Count</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-[#481D1A] flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#481D1A]/70" />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{s.code}</td>
                    <td className="py-3 px-4 text-muted-foreground">{s.description}</td>
                    <td className="py-3 px-4 font-semibold">{s.questionCount} questions</td>
                    <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-white border-[#E7DCD3]">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription className="text-xs">
              Define a academic subject for curriculum and question bank indexing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs py-2">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Subject Title *</label>
              <Input
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="e.g. Biology / Life Sciences"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Subject Code *</label>
              <Input
                value={newSubject.code}
                onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                placeholder="e.g. BIO-101"
                className="font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Description</label>
              <Input
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                placeholder="e.g. Cellular biology, genetics, and ecology"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                Save Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

