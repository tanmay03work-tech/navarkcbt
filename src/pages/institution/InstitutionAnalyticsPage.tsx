import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  BarChart2,
  Award,
  Users,
} from 'lucide-react';
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

export const InstitutionAnalyticsPage: React.FC = () => {
  const { institution } = useAuth();

  const cohortPerformance = [
    { batch: 'Batch Alpha (Eng)', avgScore: 82, passRate: 94 },
    { batch: 'Batch Beta (Med)', avgScore: 78, passRate: 88 },
    { batch: 'Class 11 Foundation', avgScore: 68, passRate: 76 },
  ];

  const topicAccuracy = [
    { topic: 'Mechanics', accuracy: 88 },
    { topic: 'Electromagnetism', accuracy: 72 },
    { topic: 'Organic Chemistry', accuracy: 64 },
    { topic: 'Calculus', accuracy: 81 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Performance & Psychometrics"
        description={`Academic insights and accuracy curves for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Analytics' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Pass Rate"
          value="89.4%"
          change="+3.2%"
          isPositive
          icon={Award}
          description="Across completed test series"
        />
        <StatCard
          title="Average Score"
          value="76.2%"
          change="+4.1%"
          isPositive
          icon={TrendingUp}
          description="Institution aggregate mean"
        />
        <StatCard
          title="Candidate Attendance"
          value="95.8%"
          icon={Users}
          description="Exam slot turnout rate"
        />
        <StatCard
          title="Questions In Bank"
          value="480+"
          icon={BarChart2}
          description="Vetted assessment questions"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Batch Average Scores & Pass Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e5d8" />
                <XAxis dataKey="batch" stroke="#796C65" fontSize={10} />
                <YAxis stroke="#796C65" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFBF5', borderColor: '#E7DCD3', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="avgScore" fill="#481D1A" radius={[4, 4, 0, 0]} name="Average Score %" />
                <Bar dataKey="passRate" fill="#D97706" radius={[4, 4, 0, 0]} name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Subject Topic Accuracy Vectors</CardTitle>
          </CardHeader>
          <CardContent className="h-72 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topicAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e5d8" />
                <XAxis type="number" stroke="#796C65" fontSize={11} domain={[0, 100]} />
                <YAxis type="category" dataKey="topic" stroke="#796C65" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFBF5', borderColor: '#E7DCD3', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="accuracy" fill="#15803D" radius={[0, 4, 4, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

