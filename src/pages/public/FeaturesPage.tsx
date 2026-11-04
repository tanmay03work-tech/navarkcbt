import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Shuffle,
  Lock,
  FileText,
  BarChart2,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureGroups = [
    {
      category: 'CBT Examination Experience',
      icon: Clock,
      features: [
        {
          title: 'Distraction-Free Test Arena',
          desc: 'Fullscreen responsive layout with question text, high-res diagrams, and clear answer inputs.',
        },
        {
          title: 'Interactive 5-State Question Palette',
          desc: 'Clearly indicates Not Visited, Visited, Answered, Marked for Review, and Answered & Marked for Review.',
        },
        {
          title: 'Resilient Timers & Autosave',
          desc: 'Continuous heartbeat saves responses locally and synchronizes state seamlessly.',
        },
        {
          title: 'Dynamic Question & Option Shuffling',
          desc: 'Prevents peer copying by generating randomized sequences for every student terminal.',
        },
      ],
    },
    {
      category: 'Question Bank & Authoring',
      icon: Layers,
      features: [
        {
          title: 'Multi-Format Question Support',
          desc: 'Single Choice, Multiple Choice, Numerical Values, and True/False questions.',
        },
        {
          title: 'Fine-Grained Taxonomy',
          desc: 'Organize items by Subject, Topic, Difficulty (Easy, Medium, Hard), and custom tags.',
        },
        {
          title: 'Bulk CSV / Excel Ingestion',
          desc: 'Import hundreds of questions simultaneously with mapping validation and error reporting.',
        },
        {
          title: 'Comprehensive Answer Explanations',
          desc: 'Provide step-by-step mathematical reasoning shown after exam publication.',
        },
      ],
    },
    {
      category: 'Multi-Tenant Institution Management',
      icon: Users,
      features: [
        {
          title: 'Institution-Scoped Identity',
          desc: 'Allows identical User IDs across different institutions while guaranteeing strict tenant data boundaries.',
        },
        {
          title: 'Class & Batch Provisioning',
          desc: 'Assign teachers to batches, enroll students, and filter exam access cleanly.',
        },
        {
          title: 'Negative Marking & Cutoff Rules',
          desc: 'Define custom positive marks, penalty fractions, and pass thresholds per exam.',
        },
        {
          title: 'Role-Based Permissions',
          desc: 'Super Admin, Institution Admin, Teacher/Exam Manager, and Candidate access tiers.',
        },
      ],
    },
    {
      category: 'Analytics & Reporting',
      icon: BarChart2,
      features: [
        {
          title: 'Instant Automated Evaluation',
          desc: 'Generates instant scores and ranks immediately upon submission window closure.',
        },
        {
          title: 'Subject & Topic Breakdown',
          desc: 'Detailed percentile curves showing candidate strength and weakness vectors.',
        },
        {
          title: 'Institutional Grade Reports',
          desc: 'Exportable spreadsheets and performance summaries for accreditation and parent meetings.',
        },
        {
          title: 'Audit Trails & Attempt Logs',
          desc: 'Track login timestamps, answer changes, and submission statuses.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#481D1A]">
          Comprehensive Capabilities for Rigorous Testing
        </h1>
        <p className="text-base text-muted-foreground">
          Navark CBT is purpose-engineered to replicate the standards of competitive entrance and academic examinations with enterprise-grade reliability.
        </p>
      </div>

      <div className="space-y-16">
        {featureGroups.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7DCD3] pb-3">
              <div className="p-2 rounded-lg bg-[#481D1A]/10 text-[#481D1A]">
                <group.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[#481D1A]">{group.category}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {group.features.map((feat, fIdx) => (
                <Card key={fIdx} className="border-[#E7DCD3] bg-white/70 hover:shadow-sm">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-[#481D1A]">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{feat.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

