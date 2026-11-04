import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/common/StatCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { resultService } from '@/services/result.service';
import { User, ExamResult } from '@/types';
import {
  GraduationCap,
  Award,
  CalendarCheck,
  Mail,
  Phone,
  Layers,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { institution } = useAuth();
  const [student, setStudent] = useState<User | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!institution || !id) return;
      const allStudents = await institutionService.getUsersByInstitutionAndRole(institution.id, 'STUDENT');
      const found = allStudents.find(s => s.id === id);
      if (found) {
        setStudent(found);
        const rList = await resultService.getStudentResults(found.id);
        setResults(rList);
      }
    };
    load();
  }, [institution, id]);

  if (!student) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading student record...
      </div>
    );
  }

  const avgScore = results.length > 0
    ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <PageHeader
        title={student.name}
        description={`Tenant User ID: ${student.userId} • Scoped to ${institution?.code}`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Students', href: '/institution/students' },
          { label: student.name },
        ]}
      >
        <Link to={`/institution/students/${student.id}/edit`}>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 border-[#481D1A] text-[#481D1A]">
            <Edit className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Exams Attempted"
          value={results.length}
          icon={CalendarCheck}
          description="Submitted test attempts"
        />
        <StatCard
          title="Average Accuracy"
          value={`${avgScore}%`}
          change={Number(avgScore) > 75 ? 'Above Average' : 'Moderate'}
          isPositive={Number(avgScore) > 75}
          icon={TrendingUp}
          description="Overall test performance"
        />
        <StatCard
          title="Best Rank Achieved"
          value={results.length > 0 ? `#${Math.min(...results.map(r => r.rank))}` : 'N/A'}
          icon={Award}
          description="Across cohort tests"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[#481D1A]">Student Record</CardTitle>
              <StatusBadge status={student.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Scoped ID</span>
              <p className="font-mono text-base font-bold text-[#481D1A]">{student.userId}</p>
            </div>

            <div className="space-y-2 border-t border-[#E7DCD3] pt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers className="h-3.5 w-3.5 text-[#481D1A]" />
                <span>Batch: <strong className="text-foreground">{student.batchName || 'Unassigned'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-[#481D1A]" />
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-[#481D1A]" />
                  <span>{student.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results & Attempts Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="results" className="space-y-4">
            <TabsList className="bg-white border border-[#E7DCD3]">
              <TabsTrigger value="results" className="text-xs">Examination Results ({results.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <Card className="border-[#E7DCD3] bg-white">
                <CardContent className="p-4">
                  {results.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No examination results recorded for this student yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Exam Title</th>
                            <th className="py-2.5 px-3 font-semibold">Score</th>
                            <th className="py-2.5 px-3 font-semibold">Percentage</th>
                            <th className="py-2.5 px-3 font-semibold">Rank</th>
                            <th className="py-2.5 px-3 font-semibold">Status</th>
                            <th className="py-2.5 px-3 font-semibold">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7DCD3]/60">
                          {results.map((r) => (
                            <tr key={r.id}>
                              <td className="py-2.5 px-3 font-bold text-[#481D1A]">{r.examTitle}</td>
                              <td className="py-2.5 px-3 font-semibold">{r.score} / {r.totalMarks}</td>
                              <td className="py-2.5 px-3 font-medium text-emerald-700">{r.percentage}%</td>
                              <td className="py-2.5 px-3 font-bold">#{r.rank} of {r.totalParticipants}</td>
                              <td className="py-2.5 px-3"><StatusBadge status={r.isPassed ? 'PASSED' : 'FAILED'} /></td>
                              <td className="py-2.5 px-3 text-muted-foreground">{formatDate(r.submittedAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

