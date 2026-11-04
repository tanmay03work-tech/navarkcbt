import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/common/StatCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { institutionService } from '@/services/institution.service';
import { examService } from '@/services/exam.service';
import { Institution, Batch, Subject, Exam, User } from '@/types';
import {
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  ShieldAlert,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Palette, Edit } from 'lucide-react';

export const InstitutionDetailPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institutionId) return;
      const inst = await institutionService.getInstitutionById(institutionId);
      if (inst) {
        setInstitution(inst);
        const b = await institutionService.getBatchesByInstitution(inst.id);
        const s = await institutionService.getSubjectsByInstitution(inst.id);
        const e = await examService.getExams(inst.id);
        const u = await institutionService.getUsersByInstitutionAndRole(inst.id, 'STUDENT');
        setBatches(b);
        setSubjects(s);
        setExams(e);
        setUsers(u);
      }
    };
    load();
  }, [institutionId]);

  if (!institution) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading institution records...
      </div>
    );
  }

  const handleToggleSuspend = async () => {
    if (!institution) return;
    const updated = await institutionService.toggleSuspendInstitution(institution.id);
    setInstitution(updated);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={institution.name}
        description={`Tenant Code: ${institution.code} • Created on ${formatDate(institution.createdAt)}`}
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Institutions', href: '/super-admin/institutions' },
          { label: institution.name },
        ]}
      >
        <Link to={`/super-admin/institutions/${institution.id}/branding`}>
          <Button
            size="sm"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
          >
            <Palette className="h-4 w-4" />
            <span>Edit Branding & White Label</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleSuspend}
          className={`text-xs gap-1.5 ${
            institution.status === 'ACTIVE'
              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          {institution.status === 'ACTIVE' ? (
            <>
              <ShieldAlert className="h-4 w-4" />
              <span>Suspend Tenant</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Reactivate Tenant</span>
            </>
          )}
        </Button>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Students"
          value={institution.totalStudents || users.length}
          icon={GraduationCap}
          description="Enrolled in batches"
        />
        <StatCard
          title="Faculty Members"
          value={institution.totalTeachers || 12}
          icon={Users}
          description="Assigned teachers"
        />
        <StatCard
          title="Batches / Classes"
          value={batches.length}
          icon={Layers}
          description="Active cohorts"
        />
        <StatCard
          title="Exams Conducted"
          value={exams.length}
          icon={CalendarCheck}
          description="All test series"
        />
      </div>

      {/* Details & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Info Panel */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#481D1A]">Tenant Identity</CardTitle>
              <StatusBadge status={institution.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Institution Code</span>
              <p className="font-mono text-sm font-bold text-[#481D1A]">{institution.code}</p>
            </div>

            {/* Branding Summary */}
            <div className="space-y-2 border-t border-[#E7DCD3] pt-3">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                White Label Branding
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={institution.settings?.branding?.logoUrl || institution.logoUrl || '/brand/navark-logo.svg'}
                  alt="Logo"
                  className="h-7 w-auto object-contain border rounded p-1 bg-white"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/brand/navark-logo.svg';
                  }}
                />
                <div>
                  <p className="font-bold text-foreground">
                    {institution.settings?.branding?.institutionName || institution.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {institution.settings?.branding?.tagline || 'Default Platform Tagline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-3.5 w-3.5 rounded-full border shadow-xs"
                    style={{ backgroundColor: institution.settings?.branding?.primaryColor || '#481D1A' }}
                  />
                  <span className="font-mono text-[10px]">{institution.settings?.branding?.primaryColor || '#481D1A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-3.5 w-3.5 rounded-full border shadow-xs"
                    style={{ backgroundColor: institution.settings?.branding?.secondaryColor || '#FFFBF5' }}
                  />
                  <span className="font-mono text-[10px]">{institution.settings?.branding?.secondaryColor || '#FFFBF5'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#E7DCD3] pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-[#481D1A]" />
                <span>{institution.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-[#481D1A]" />
                <span>{institution.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-[#481D1A] mt-0.5" />
                <span>{institution.address}, {institution.city}, {institution.state} - {institution.pincode}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="batches" className="space-y-4">
            <TabsList className="bg-white border border-[#E7DCD3]">
              <TabsTrigger value="batches" className="text-xs">Batches ({batches.length})</TabsTrigger>
              <TabsTrigger value="subjects" className="text-xs">Subjects ({subjects.length})</TabsTrigger>
              <TabsTrigger value="exams" className="text-xs">Exams ({exams.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="batches">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Batch Name</th>
                          <th className="py-2 px-3 font-semibold">Code</th>
                          <th className="py-2 px-3 font-semibold">Academic Year</th>
                          <th className="py-2 px-3 font-semibold">Students</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DCD3]/60">
                        {batches.map((b) => (
                          <tr key={b.id}>
                            <td className="py-2.5 px-3 font-bold text-[#481D1A]">{b.name}</td>
                            <td className="py-2.5 px-3 font-mono">{b.code}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{b.academicYear}</td>
                            <td className="py-2.5 px-3 font-semibold">{b.studentCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Subject</th>
                          <th className="py-2 px-3 font-semibold">Code</th>
                          <th className="py-2 px-3 font-semibold">Question Count</th>
                          <th className="py-2 px-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DCD3]/60">
                        {subjects.map((s) => (
                          <tr key={s.id}>
                            <td className="py-2.5 px-3 font-bold text-[#481D1A]">{s.name}</td>
                            <td className="py-2.5 px-3 font-mono">{s.code}</td>
                            <td className="py-2.5 px-3">{s.questionCount} questions</td>
                            <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Title</th>
                          <th className="py-2 px-3 font-semibold">Duration</th>
                          <th className="py-2 px-3 font-semibold">Marks</th>
                          <th className="py-2 px-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DCD3]/60">
                        {exams.map((e) => (
                          <tr key={e.id}>
                            <td className="py-2.5 px-3 font-bold text-[#481D1A]">{e.title}</td>
                            <td className="py-2.5 px-3">{e.durationMinutes} mins</td>
                            <td className="py-2.5 px-3">{e.totalMarks} marks</td>
                            <td className="py-2.5 px-3"><StatusBadge status={e.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

