import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HowItWorksPage: React.FC = () => {
  const institutionSteps = [
    { step: '01', title: 'Submit Onboarding Request', desc: 'Provide institution name, contact details, and student volume estimate to obtain your unique Institution Code.' },
    { step: '02', title: 'Set Up Academic Structure', desc: 'Create batches/classes, add academic subjects, and invite or import teachers and students.' },
    { step: '03', title: 'Define Examination Policies', desc: 'Establish default marking schemes, negative marking penalties, and result publication rules.' },
  ];

  const teacherSteps = [
    { step: '01', title: 'Curate Question Library', desc: 'Draft or import questions categorized by difficulty, topic, and question format with full explanations.' },
    { step: '02', title: 'Build and Schedule Exams', desc: 'Pick questions, configure duration, select target batches, and set live start/end timestamps.' },
    { step: '03', title: 'Monitor and Analyze', desc: 'Review student attempt rates, view instant gradebooks, and inspect question difficulty curves.' },
  ];

  const studentSteps = [
    { step: '01', title: 'Secure Login', desc: 'Authenticate with Institution Code + Assigned User ID + Password from any modern web browser.' },
    { step: '02', title: 'Read Instructions & Verify', desc: 'Review exam guidelines, question count, marking rules, and acknowledge test readiness.' },
    { step: '03', title: 'Take CBT & Review Results', desc: 'Navigate questions with the interactive palette, submit responses, and inspect scorecard percentiles.' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#481D1A]">
          How Navark CBT Operates
        </h1>
        <p className="text-base text-muted-foreground">
          Step-by-step examination workflows designed for seamless multi-tenant operations.
        </p>
      </div>

      <div className="space-y-16 max-w-5xl mx-auto">
        {/* Institution Admin Workflow */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E7DCD3] pb-3">
            <div className="p-2 rounded-lg bg-[#481D1A]/10 text-[#481D1A]">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#481D1A]">Institution Administration Journey</h2>
              <p className="text-xs text-muted-foreground">From onboarding to overall campus test management</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {institutionSteps.map((s, idx) => (
              <Card key={idx} className="border-[#E7DCD3] bg-white/70">
                <CardContent className="p-5 space-y-2">
                  <span className="text-2xl font-black text-[#481D1A]/30">{s.step}</span>
                  <h3 className="text-sm font-bold text-[#481D1A]">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Teacher Workflow */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E7DCD3] pb-3">
            <div className="p-2 rounded-lg bg-[#481D1A]/10 text-[#481D1A]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#481D1A]">Teacher / Exam Manager Journey</h2>
              <p className="text-xs text-muted-foreground">Curating questions, configuring tests, and diagnosing results</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teacherSteps.map((s, idx) => (
              <Card key={idx} className="border-[#E7DCD3] bg-white/70">
                <CardContent className="p-5 space-y-2">
                  <span className="text-2xl font-black text-[#481D1A]/30">{s.step}</span>
                  <h3 className="text-sm font-bold text-[#481D1A]">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Workflow */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E7DCD3] pb-3">
            <div className="p-2 rounded-lg bg-[#481D1A]/10 text-[#481D1A]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#481D1A]">Student Candidate Journey</h2>
              <p className="text-xs text-muted-foreground">Timed attempts, autosaved answers, and immediate feedback</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentSteps.map((s, idx) => (
              <Card key={idx} className="border-[#E7DCD3] bg-white/70">
                <CardContent className="p-5 space-y-2">
                  <span className="text-2xl font-black text-[#481D1A]/30">{s.step}</span>
                  <h3 className="text-sm font-bold text-[#481D1A]">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center pt-8">
          <Link to="/register">
            <Button size="lg" className="bg-[#481D1A] text-white hover:bg-[#351412] px-8">
              <span>Request Institution Onboarding</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

