import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, GraduationCap, MoreHorizontal, Eye, Edit, ShieldAlert, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { User, Batch } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const StudentsListPage: React.FC = () => {
  const { institution } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('ALL');

  const loadData = async () => {
    if (!institution) return;
    const s = await institutionService.getUsersByInstitutionAndRole(institution.id, 'STUDENT');
    const b = await institutionService.getBatchesByInstitution(institution.id);
    setStudents(s);
    setBatches(b);
  };

  useEffect(() => {
    loadData();
  }, [institution]);

  const handleToggleStatus = async (student: User) => {
    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await institutionService.updateUser(student.id, { status: newStatus });
    loadData();
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.userId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesBatch = batchFilter === 'ALL' || s.batchId === batchFilter;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Enrollment & Roster"
        description={`Manage students enrolled in ${institution?.name} (${institution?.code}). All User IDs are strictly scoped to this institution.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Students' },
        ]}
      >
        <Link to="/institution/students/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Enroll Student</span>
          </Button>
        </Link>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or User ID..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground">Batch:</span>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs"
              >
                <option value="ALL">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Institution User ID</th>
                  <th className="py-3 px-4 font-semibold">Assigned Batch</th>
                  <th className="py-3 px-4 font-semibold">Contact Email</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Enrolled Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No students found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-bold text-[#481D1A]">
                        <Link to={`/institution/students/${s.id}`} className="hover:underline flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-[#481D1A]/70" />
                          <span>{s.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">{s.userId}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {s.batchName || 'Unassigned'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{s.email}</td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(s.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs bg-[#FFFBF5] border-[#E7DCD3]">
                            <DropdownMenuItem asChild>
                              <Link to={`/institution/students/${s.id}`} className="flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Performance</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/institution/students/${s.id}/edit`} className="flex items-center gap-2">
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(s)}
                              className={`flex items-center gap-2 ${
                                s.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {s.status === 'ACTIVE' ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  <span>Deactivate</span>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

