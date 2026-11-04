import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Shield, Bell, Save, Lock, Palette } from 'lucide-react';

export const InstitutionSettingsPage: React.FC = () => {
  const { institution } = useAuth();
  const [saved, setSaved] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState('60');
  const [defaultPositiveMarks, setDefaultPositiveMarks] = useState('4');
  const [defaultNegativePenalty, setDefaultNegativePenalty] = useState('1');
  const [enableInstantResults, setEnableInstantResults] = useState(true);
  const [enableProctoringAlerts, setEnableProctoringAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Institution Policies & Defaults"
        description={`Set global examination scoring defaults, proctoring options, and notifications for ${institution?.name}.`}
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Settings' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Institution examination defaults updated successfully.</span>
        </div>
      )}

      {/* Read-Only White Label Branding View for Institution Admin */}
      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Institution Branding & Identity</CardTitle>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              <Lock className="h-3 w-3 text-amber-600" />
              <span>Super Admin Managed</span>
            </div>
          </div>
          <CardDescription className="text-xs">
            Your institution&apos;s White Label brand settings are configured by the Platform Super Admin. Contact platform support to request identity adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-xl bg-[#FFFBF5] border border-[#E7DCD3]">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Brand Name</span>
              <span className="font-bold text-foreground text-sm">
                {institution?.settings?.branding?.institutionName || institution?.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tagline</span>
              <span className="font-medium text-foreground">
                {institution?.settings?.branding?.tagline || 'Examination Platform'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Brand Colors</span>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-3.5 w-3.5 rounded-full border"
                    style={{ backgroundColor: institution?.settings?.branding?.primaryColor || '#481D1A' }}
                  />
                  <span className="font-mono text-[10px]">{institution?.settings?.branding?.primaryColor || '#481D1A'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="h-3.5 w-3.5 rounded-full border"
                    style={{ backgroundColor: institution?.settings?.branding?.secondaryColor || '#FFFBF5' }}
                  />
                  <span className="font-mono text-[10px]">{institution?.settings?.branding?.secondaryColor || '#FFFBF5'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Exam Creation Defaults</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Initial values prefilled whenever teachers build new examinations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Default Duration (Mins)</label>
                <Input
                  type="number"
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Standard Positive Marks</label>
                <Input
                  type="number"
                  value={defaultPositiveMarks}
                  onChange={(e) => setDefaultPositiveMarks(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Standard Negative Penalty</label>
                <Input
                  type="number"
                  value={defaultNegativePenalty}
                  onChange={(e) => setDefaultNegativePenalty(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableInstantResults}
                  onChange={(e) => setEnableInstantResults(e.target.checked)}
                  className="h-4 w-4 rounded text-[#481D1A] focus:ring-[#481D1A]"
                />
                <span className="font-medium text-foreground">
                  Default to publishing instant scorecard upon candidate submission
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableProctoringAlerts}
                  onChange={(e) => setEnableProctoringAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-[#481D1A] focus:ring-[#481D1A]"
                />
                <span className="font-medium text-foreground">
                  Log browser tab switches and window blur events in audit trails
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6 gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Policies</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

