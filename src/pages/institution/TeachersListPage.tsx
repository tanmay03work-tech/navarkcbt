import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, UserCheck, MoreHorizontal, Eye, Edit, ShieldAlert, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { User } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const TeachersListPage: React.FC = () => {
  const { institution } = useAuth();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  const loadTeachers = async () => {
    if (!institution) return;
    const t = await institutionService.getUsersByInstitutionAndRole(institution.id, 'TEACHER');
    setTeachers(t);
  };

  useEffect(() => {
    loadTeachers();
  }, [institution]);

  const handleToggleStatus = async (teacher: User) => {
    const newStatus = teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await institutionService.updateUser(teacher.id, { status: newStatus });
    loadTeachers();
  };

  const filtered = teachers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.userId.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.specialization && t.specialization.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Exam Managers"
        description={`Instructors and subject matter specialists authorized to author questions and manage tests for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Teachers' },
        ]}
      >
        <Link to="/institution/teachers/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Add Faculty Member</span>
          </Button>
        </Link>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty by name, ID, or subject..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Faculty Name</th>
                  <th className="py-3 px-4 font-semibold">Institution User ID</th>
                  <th className="py-3 px-4 font-semibold">Specialization</th>
                  <th className="py-3 px-4 font-semibold">Email & Contact</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-bold text-[#481D1A]">
                      <Link to={`/institution/teachers/${t.id}`} className="hover:underline flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-[#481D1A]/70" />
                        <span>{t.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{t.userId}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {t.specialization?.map((spec, sIdx) => (
                          <Badge key={sIdx} variant="secondary" className="text-[10px]">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div>{t.email}</div>
                      <div className="text-[10px]">{t.phone}</div>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(t.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs bg-[#FFFBF5] border-[#E7DCD3]">
                          <DropdownMenuItem asChild>
                            <Link to={`/institution/teachers/${t.id}`} className="flex items-center gap-2">
                              <Eye className="h-3.5 w-3.5" />
                              <span>View Profile</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/institution/teachers/${t.id}/edit`} className="flex items-center gap-2">
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(t)}
                            className={`flex items-center gap-2 ${
                              t.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {t.status === 'ACTIVE' ? (
                              <>
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>Deactivate Faculty</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Reactivate</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
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

