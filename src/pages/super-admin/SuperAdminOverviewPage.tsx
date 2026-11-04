import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Building2,
  Users,
  Inbox,
  CalendarCheck,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { institutionService } from '@/services/institution.service';
import { Institution, InstitutionRequest, User } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const SuperAdminOverviewPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      const insts = await institutionService.getAllInstitutions();
      const reqs = await institutionService.getInstitutionRequests();
      const usrs = await institutionService.getAllPlatformUsers();
      setInstitutions(insts);
      setRequests(reqs);
      setUsers(usrs);
    };
    load();
  }, []);

  const activeInstitutionsCount = institutions.filter(i => i.status === 'ACTIVE').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  // Chart data
  const growthData = [
    { month: 'Jun', exams: 420, students: 1200 },
    { month: 'Jul', exams: 680, students: 1800 },
    { month: 'Aug', exams: 950, students: 2400 },
    { month: 'Sep', exams: 1400, students: 3100 },
    { month: 'Oct', exams: 1850, students: 4200 },
    { month: 'Nov', exams: 2100, students: 4850 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration Overview"
        description="Global system telemetry, active tenant institutions, and onboarding requests across Navark CBT."
      >
        <Link to="/super-admin/institutions/new">
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" />
            <span>Create Institution</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Institutions"
          value={institutions.length}
          change="+12% YoY"
          isPositive
          icon={Building2}
          description="Registered educational tenants"
        />
        <StatCard
          title="Active Tenants"
          value={activeInstitutionsCount}
          change="Operational"
          isPositive
          icon={Shield}
          description="Institutions currently conducting tests"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequestsCount}
          change={pendingRequestsCount > 0 ? 'Requires Action' : 'All Clear'}
          isPositive={pendingRequestsCount === 0}
          icon={Inbox}
          description="New institution applications"
        />
        <StatCard
          title="Total Platform Users"
          value={users.length * 40}
          change="+18.4%"
          isPositive
          icon={Users}
          description="Students, teachers & administrators"
        />
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-[#481D1A]">Examination Delivery Volume</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly cumulative completed CBT attempts across all institutions</p>
            </div>
            <TrendingUp className="h-4 w-4 text-[#481D1A]" />
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e5d8" />
                <XAxis dataKey="month" stroke="#796C65" fontSize={11} />
                <YAxis stroke="#796C65" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFBF5', borderColor: '#E7DCD3', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="exams" fill="#481D1A" radius={[4, 4, 0, 0]} name="CBT Attempts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Requests Widget */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base text-[#481D1A]">Onboarding Inquiries</CardTitle>
              <p className="text-xs text-muted-foreground">Awaiting super admin review</p>
            </div>
            <Link to="/super-admin/requests" className="text-xs font-semibold text-[#481D1A] hover:underline flex items-center">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {requests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-lg border border-[#E7DCD3] bg-[#FFFBF5]/60 hover:bg-[#FFFBF5] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#481D1A] truncate">{req.institutionName}</h4>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                  <span>Code: <span className="font-mono font-semibold">{req.proposedCode}</span></span>
                  <span>Est: {req.studentEstimate} students</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Active Institutions Table */}
      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base text-[#481D1A]">Tenant Institutions</CardTitle>
            <p className="text-xs text-muted-foreground">Active and configured educational institutions</p>
          </div>
          <Link to="/super-admin/institutions" className="text-xs font-semibold text-[#481D1A] hover:underline flex items-center">
            <span>Manage All Institutions</span>
            <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-[#E7DCD3]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Institution Name</th>
                  <th className="py-2.5 px-3 font-semibold">Tenant Code</th>
                  <th className="py-2.5 px-3 font-semibold">Students</th>
                  <th className="py-2.5 px-3 font-semibold">Teachers</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DCD3]/60">
                {institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-muted/20">
                    <td className="py-3 px-3 font-bold text-[#481D1A]">
                      <Link to={`/super-admin/institutions/${inst.id}`} className="hover:underline">
                        {inst.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold">{inst.code}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inst.totalStudents}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inst.totalTeachers}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={inst.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/super-admin/institutions/${inst.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          Inspect
                        </Button>
                      </Link>
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

