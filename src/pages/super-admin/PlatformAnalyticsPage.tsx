import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import {
  TrendingUp,
  BarChart3,
  CalendarCheck,
  Building,
  Users,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const PlatformAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6M');

  const monthlyGrowth = [
    { month: 'Jun', institutions: 3, exams: 520, students: 1800 },
    { month: 'Jul', institutions: 4, exams: 740, students: 2300 },
    { month: 'Aug', institutions: 5, exams: 1100, students: 2900 },
    { month: 'Sep', institutions: 7, exams: 1650, students: 3800 },
    { month: 'Oct', institutions: 9, exams: 2100, students: 4600 },
    { month: 'Nov', institutions: 12, exams: 2850, students: 5700 },
  ];

  const questionDistribution = [
    { name: 'Single Choice', value: 58, color: '#481D1A' },
    { name: 'Multiple Choice', value: 24, color: '#8C3B35' },
    { name: 'Numerical Value', value: 18, color: '#D97706' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform-Wide Analytics"
        description="Comprehensive metrics across all tenant institutions, examination throughput, and candidate growth."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Analytics' },
        ]}
      >
        <div className="flex items-center gap-1.5 bg-white p-1 border border-[#E7DCD3] rounded-lg text-xs">
          {['1M', '3M', '6M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[#481D1A] text-white font-bold'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Exams Conducted"
          value="8,960"
          change="+24.8%"
          isPositive
          icon={CalendarCheck}
          description="Cumulative tests served"
        />
        <StatCard
          title="Avg Exam Duration"
          value="78 mins"
          icon={TrendingUp}
          description="Average test window"
        />
        <StatCard
          title="System Availability"
          value="99.98%"
          isPositive
          icon={Building}
          description="Uptime across all test clusters"
        />
        <StatCard
          title="Active Test Terminals"
          value="1,420"
          change="+15.2%"
          isPositive
          icon={Users}
          description="Concurrent test sessions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-[#E7DCD3] bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Exam Throughput Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e5d8" />
                <XAxis dataKey="month" stroke="#796C65" fontSize={11} />
                <YAxis stroke="#796C65" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFBF5', borderColor: '#E7DCD3', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="exams" stroke="#481D1A" strokeWidth={3} name="Total Exams" />
                <Line type="monotone" dataKey="students" stroke="#D97706" strokeWidth={2} name="Active Candidates" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Question Format Ratio</CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={questionDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {questionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-xs mt-2">
              {questionDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

