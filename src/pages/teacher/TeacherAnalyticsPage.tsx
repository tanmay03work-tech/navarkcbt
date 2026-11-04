import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/common/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { Award, TrendingUp, Users, Target } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TeacherAnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  const topicAccuracyData = [
    { topic: 'Optics', accuracy: 82 },
    { topic: 'Electrodynamics', accuracy: 74 },
    { topic: 'Thermodynamics', accuracy: 68 },
    { topic: 'Rotational Motion', accuracy: 56 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Subject Analytics"
        description="Diagnose topic difficulty curves, student response distribution, and score progress."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Analytics' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Average Batch Accuracy"
          value="75.4%"
          change="+5.1%"
          isPositive
          icon={TrendingUp}
          description="Across your authored tests"
        />
        <StatCard
          title="Pass Percentage"
          value="91.2%"
          icon={Award}
          description="Students meeting cutoff"
        />
        <StatCard
          title="Questions Authored"
          value="18"
          icon={Target}
          description="High-discrimination items"
        />
      </div>

      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader>
          <CardTitle className="text-base text-[#481D1A]">Topic-Wise Candidate Accuracy</CardTitle>
        </CardHeader>
        <CardContent className="h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e5d8" />
              <XAxis dataKey="topic" stroke="#796C65" fontSize={11} />
              <YAxis stroke="#796C65" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFBF5', borderColor: '#E7DCD3', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="accuracy" fill="#481D1A" radius={[4, 4, 0, 0]} name="Accuracy %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

