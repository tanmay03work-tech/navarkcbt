import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Search, Plus, Building2, MoreHorizontal, Eye, ShieldAlert, CheckCircle, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { institutionService } from '@/services/institution.service';
import { Institution } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const InstitutionsListPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadInstitutions = async () => {
    const data = await institutionService.getAllInstitutions();
    setInstitutions(data);
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleToggleSuspend = async (id: string) => {
    await institutionService.toggleSuspendInstitution(id);
    loadInstitutions();
  };

  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenant Institutions"
        description="View and administer all registered educational tenants in the Navark CBT platform."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Institutions' },
        ]}
      >
        <Link to="/super-admin/institutions/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create New Institution</span>
          </Button>
        </Link>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, or city..."
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Institution Name</th>
                  <th className="py-3 px-4 font-semibold">Tenant Code</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold">Admin Contact</th>
                  <th className="py-3 px-4 font-semibold">Students</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                      No institutions match the specified filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((inst) => (
                    <tr key={inst.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-bold text-[#481D1A]">
                        <Link to={`/super-admin/institutions/${inst.id}`} className="hover:underline flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#481D1A]/70" />
                          <span>{inst.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-xs">{inst.code}</td>
                      <td className="py-3 px-4 text-muted-foreground">{inst.city}, {inst.state}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <div>{inst.email}</div>
                        <div className="text-[10px]">{inst.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{inst.totalStudents}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inst.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(inst.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs bg-[#FFFBF5] border-[#E7DCD3]">
                            <DropdownMenuItem asChild>
                              <Link to={`/super-admin/institutions/${inst.id}`} className="flex items-center gap-2">
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect Details</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/super-admin/institutions/${inst.id}/branding`} className="flex items-center gap-2">
                                <Palette className="h-3.5 w-3.5" />
                                <span>Edit Branding</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleSuspend(inst.id)}
                              className={`flex items-center gap-2 ${
                                inst.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {inst.status === 'ACTIVE' ? (
                                <>
                                  <ShieldAlert className="h-3.5 w-3.5" />
                                  <span>Suspend Tenant</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span>Reactivate Tenant</span>
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

