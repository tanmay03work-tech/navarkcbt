import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { Batch } from '@/types';
import { UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AddEditTeacherPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { institution } = useAuth();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    phone: '',
    specialization: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!institution) return;
      const bList = await institutionService.getBatchesByInstitution(institution.id);
      setBatches(bList);

      if (isEditing) {
        const faculty = await institutionService.getUsersByInstitutionAndRole(institution.id, 'TEACHER');
        const t = faculty.find(item => item.id === id);
        if (t) {
          setFormData({
            name: t.name,
            userId: t.userId,
            email: t.email,
            phone: t.phone || '',
            specialization: t.specialization?.join(', ') || '',
            status: t.status,
          });
        }
      }
    };
    load();
  }, [institution, id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.userId.trim() || !formData.email.trim()) {
      setError('Please provide Name, User ID, and Email.');
      return;
    }

    if (!institution) {
      setError('Active institution context not found.');
      return;
    }

    const specArray = formData.specialization
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      setLoading(true);
      if (isEditing && id) {
        await institutionService.updateUser(id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: specArray,
          status: formData.status,
        });
      } else {
        await institutionService.createUser({
          name: formData.name,
          userId: formData.userId.toUpperCase(),
          email: formData.email,
          phone: formData.phone,
          role: 'TEACHER',
          institutionId: institution.id,
          institutionCode: institution.code,
          institutionName: institution.name,
          specialization: specArray,
          status: formData.status,
        });
      }
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Operation failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title={isEditing ? 'Edit Faculty Member' : 'Add Faculty Member'}
        description={`Configure educator permissions and credentials in ${institution?.code}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Teachers', href: '/institution/teachers' },
          { label: isEditing ? 'Edit Faculty' : 'New Faculty' },
        ]}
      />

      {success ? (
        <Card className="border-[#E7DCD3] bg-white text-center p-8 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <CardTitle className="text-xl text-[#481D1A]">
            {isEditing ? 'Faculty Record Updated' : 'Faculty Member Added!'}
          </CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Educator <strong>{formData.name}</strong> ({institution?.code} • <span className="font-mono">{formData.userId}</span>) has been saved.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate('/institution/teachers')}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs"
            >
              Back to Faculty Roster
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Faculty Details</CardTitle>
            <CardDescription className="text-xs">
              Institution User IDs must be unique within {institution?.name}.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Full Faculty Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Prof. Rajesh Kulkarni"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Institution Scoped User ID *
                  </label>
                  <Input
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value.toUpperCase() })}
                    placeholder="e.g. TCH101 or FAC-01"
                    disabled={isEditing}
                    className="font-mono uppercase"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Scoped to {institution?.code}. Identical ID may exist in another institution.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Specialization / Subjects (Comma separated)
                  </label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="Physics, Electromagnetism, Optics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Official Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@apex-science.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Contact Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                >
                  <option value="ACTIVE">Active (Can author questions and create exams)</option>
                  <option value="INACTIVE">Inactive (Access suspended)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/institution/teachers')}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
                >
                  {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Faculty Member'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

