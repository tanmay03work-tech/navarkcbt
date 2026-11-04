import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Target, Cpu, RefreshCw } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#481D1A]">
            About Navark CBT
          </h1>
          <p className="text-base text-muted-foreground">
            A dedicated, standalone multi-tenant Computer-Based Testing application.
          </p>
        </div>

        <div className="prose prose-stone max-w-none text-sm text-foreground/90 space-y-4 leading-relaxed">
          <p>
            Navark CBT was designed to address the operational and pedagogical demands of modern competitive testing. Traditional paper examinations introduce massive logistical overhead, vulnerability to leakages, slow manual grading turnaround, and limited feedback for learners.
          </p>
          <p>
            Navark CBT provides an independent, scalable assessment platform that operates with tenant-isolated data structures. Each educational institution operates within its own dedicated namespace using an Institution Code, allowing identical Student IDs across different institutions while guaranteeing zero data leakage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#481D1A] font-bold">
                <Target className="h-5 w-5" />
                <span>Product Purpose</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To deliver a robust, standardized CBT arena mirroring national competitive formats (such as JEE, NEET, and Olympiads) with high reliability and zero distractions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#481D1A] font-bold">
                <Shield className="h-5 w-5" />
                <span>Multi-Tenant Architecture</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engineered with strict institution scoping. Authentication requires Institution Code + User ID + Password, guaranteeing logical isolation at all levels.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#481D1A] font-bold">
                <Cpu className="h-5 w-5" />
                <span>Modern Technology Foundation</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Constructed using React, TypeScript, Tailwind CSS, TanStack Query, and accessible UI components for performance across desktop, laptop, and tablet test centers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#481D1A] font-bold">
                <RefreshCw className="h-5 w-5" />
                <span>Real-Time State & Sync</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Continuous background state management preserves candidate answers, remaining exam minutes, and review flags against local power or network interruptions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

