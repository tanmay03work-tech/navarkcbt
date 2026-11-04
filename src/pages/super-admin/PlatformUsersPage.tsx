import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Search, UserCheck, ShieldAlert, CheckCircle, MoreHorizontal } from 'lucide-react';
import { institutionService } from '@/services/institution.service';
import { User, Institution } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const PlatformUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [institutionFilter, setInstitutionFilter] = useState('ALL');

  const loadData = async () => {
    const u = await institutionService.getAllPlatformUsers();
    const insts = await institutionService.getAllInstitutions();
    setUsers(u);
    setInstitutions(insts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await institutionService.updateUser(user.id, { status: newStatus });
    loadData();
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.userId.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesInst =
      institutionFilter === 'ALL' ||
      u.institutionId === institutionFilter ||
      (institutionFilter === 'GLOBAL' && !u.institutionId);

    return matchesSearch && matchesRole && matchesInst;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform User Directory"
        description="Search, filter, and oversee user accounts across all tenant institutions and administrative roles."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Platform Users' },
        ]}
      />

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or user ID..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Roles</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="INSTITUTION_ADMIN">Institution Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Tenant:</span>
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs"
                >
                  <option value="ALL">All Tenants</option>
                  <option value="GLOBAL">Global (Super Admin)</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} - {i.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Tenant Scoped ID</th>
                  <th className="py-3 px-4 font-semibold">Tenant / Institution</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#481D1A]">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-xs">{u.userId}</td>
                    <td className="py-3 px-4">
                      {u.institutionCode ? (
                        <Badge variant="maroon" className="text-[10px] font-mono">
                          {u.institutionCode}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">Global Scope</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{u.role}</td>
                    <td className="py-3 px-4"><StatusBadge status={u.status} /></td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'SUPER_ADMIN' ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs bg-[#FFFBF5] border-[#E7DCD3]">
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(u)}
                              className={`flex items-center gap-2 ${
                                u.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {u.status === 'ACTIVE' ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  <span>Deactivate Account</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Reactivate Account</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Protected</span>
                      )}
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

