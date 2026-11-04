import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { contentService } from '@/services/result.service';
import { institutionService } from '@/services/institution.service';
import { StudyMaterial, Subject, Batch } from '@/types';
import { formatDate } from '@/lib/utils';
import { FileText, Plus, Download, Trash2, Search, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const StudyMaterialsPage: React.FC = () => {
  const { institution, user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [newMat, setNewMat] = useState({
    title: '',
    subjectId: '',
    topic: '',
    batchId: '',
    fileType: 'PDF' as 'PDF' | 'DOC' | 'ZIP',
    fileSize: '3.4 MB',
  });

  const loadData = async () => {
    if (!institution) return;
    const m = await contentService.getStudyMaterials(institution.id);
    const s = await institutionService.getSubjectsByInstitution(institution.id);
    const b = await institutionService.getBatchesByInstitution(institution.id);
    setMaterials(m);
    setSubjects(s);
    setBatches(b);
    if (s.length > 0 && !newMat.subjectId) {
      setNewMat(prev => ({ ...prev, subjectId: s[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, [institution]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution || !newMat.title) return;

    const s = subjects.find(item => item.id === newMat.subjectId);
    const b = batches.find(item => item.id === newMat.batchId);

    await contentService.uploadStudyMaterial({
      institutionId: institution.id,
      title: newMat.title,
      subjectId: newMat.subjectId,
      subjectName: s?.name || 'General',
      topic: newMat.topic || 'General Topic',
      assignedBatchIds: b ? [b.id] : [],
      assignedBatchNames: b ? [b.name] : [],
      fileType: newMat.fileType,
      fileSize: newMat.fileSize,
      authorName: user?.name || 'Faculty',
    });

    setModalOpen(false);
    setNewMat({ title: '', subjectId: subjects[0]?.id || '', topic: '', batchId: '', fileType: 'PDF', fileSize: '3.4 MB' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this material?')) {
      await contentService.deleteStudyMaterial(id);
      loadData();
    }
  };

  const filtered = materials.filter(
    m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      m.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Materials & Reference Handouts"
        description={`Upload and publish syllabus handouts, formula sheets, and reading materials for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Materials' },
        ]}
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Material</span>
        </Button>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials by title or topic..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No study materials uploaded for this institution yet.
              </div>
            ) : (
              filtered.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:bg-[#FFFBF5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-[#481D1A]/10 text-[#481D1A] shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[#481D1A]">{mat.title}</h4>
                        <Badge variant="outline" className="text-[10px]">{mat.fileType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-semibold text-foreground">{mat.subjectName}</span>
                        <span>•</span>
                        <span>{mat.topic}</span>
                        <span>•</span>
                        <span>{mat.fileSize}</span>
                        <span>•</span>
                        <span>Uploaded by {mat.authorName} ({formatDate(mat.uploadedAt)})</span>
                      </div>
                      {mat.assignedBatchNames.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Visible to: {mat.assignedBatchNames.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Downloading ${mat.title}`)}
                      className="h-8 text-xs gap-1 border-[#481D1A]/30 text-[#481D1A]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(mat.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
            <DialogTitle>Upload Study Material</DialogTitle>
            <DialogDescription className="text-xs">
              Make revision guides or problem sheets available to students in your batches.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-3.5 text-xs py-2">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Document Title *</label>
              <Input
                value={newMat.title}
                onChange={(e) => setNewMat({ ...newMat, title: e.target.value })}
                placeholder="e.g. Ray Optics & Wave Optics Problem Set"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Subject *</label>
                <select
                  value={newMat.subjectId}
                  onChange={(e) => setNewMat({ ...newMat, subjectId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Target Batch</label>
                <select
                  value={newMat.batchId}
                  onChange={(e) => setNewMat({ ...newMat, batchId: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs"
                >
                  <option value="">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Topic / Unit</label>
              <Input
                value={newMat.topic}
                onChange={(e) => setNewMat({ ...newMat, topic: e.target.value })}
                placeholder="e.g. Geometrical Optics"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                Save & Publish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

