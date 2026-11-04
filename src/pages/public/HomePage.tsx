import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  BarChart2,
  BookOpen,
  Building,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Layers,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-[#E7DCD3]">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#481D1A]/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#481D1A] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Next-Generation Computer-Based Testing Platform</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#481D1A] sm:text-5xl md:text-6xl">
              Precision Online Testing for Modern Institutions
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Empower your institution with high-concurrency examination delivery, robust question banks, anti-cheating timers, and instant analytical breakdowns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link to="/register">
                <Button size="lg" className="bg-[#481D1A] text-[#FFFBF5] hover:bg-[#351412] px-8 text-base shadow-md w-full sm:w-auto">
                  <span>Register Your Institution</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-[#481D1A] text-[#481D1A] hover:bg-[#481D1A]/10 px-8 text-base w-full sm:w-auto">
                  Student & Staff Login
                </Button>
              </Link>
            </div>

            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Zero Server Clutter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Isolated Institution Tenancy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Tamper-Resistant CBT Player</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="py-20 bg-white/40 border-b border-[#E7DCD3]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#481D1A]">
              Engineered for Complete Assessment Lifecycles
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              From drafting questions and scheduling batches to live proctored attempts and post-exam percentiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-[#E7DCD3] bg-[#FFFBF5]/60 hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#481D1A]/10 text-[#481D1A] flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#481D1A]">
                  Distraction-Free CBT Player
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time countdown clocks, 5-state visual question palettes, formula-rendering, and seamless autosaving ensure students stay focused on solving problems.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E7DCD3] bg-[#FFFBF5]/60 hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#481D1A]/10 text-[#481D1A] flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#481D1A]">
                  Rich Multi-Format Question Bank
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Single-choice, multiple-correct, numerical value inputs, and comprehension passages. Categorize by subject, topic, and difficulty with bulk CSV import.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E7DCD3] bg-[#FFFBF5]/60 hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-xl bg-[#481D1A]/10 text-[#481D1A] flex items-center justify-center">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#481D1A]">
                  Instant Psychometric Analytics
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Automated grading with negative marking rules, rank calculation, subject and topic accuracy curves, and printable performance scorecards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#481D1A]">
              Designed for Every Stakeholder
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Clean, dedicated workflows tailored specifically to institution administrators, educators, and candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-[#E7DCD3] p-6 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-[#481D1A]" />
                <h3 className="font-bold text-[#481D1A]">For Institutions</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Custom institution code and dedicated tenant workspace</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Batch management and bulk student/teacher provisioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Centralized exam scheduling and master question library</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#E7DCD3] p-6 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-[#481D1A]" />
                <h3 className="font-bold text-[#481D1A]">For Teachers</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Author questions with math explanations and scoring rules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Publish mock tests targeted to specific assigned classes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Monitor submissions and analyze batch topic-level weaknesses</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#E7DCD3] p-6 bg-white space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-[#481D1A]" />
                <h3 className="font-bold text-[#481D1A]">For Students</h3>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Simple login with Institution Code and assigned Student ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>National-style CBT exam interface identical to real tests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>Instant scorecards, answer explanations, and study materials</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#481D1A] text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to Modernize Your Examination System?
          </h2>
          <p className="text-sm opacity-90 leading-relaxed">
            Submit an institution request today to receive your dedicated institution code and configure your first test series.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <Button size="lg" className="bg-[#FFFBF5] text-[#481D1A] hover:bg-white font-bold px-8 shadow-lg">
                Get Started
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-medium">
                Talk to Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

