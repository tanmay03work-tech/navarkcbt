import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { CheckCircle2, Shield, Bell, Palette, Globe, Save } from 'lucide-react';

export const PlatformSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [platformName, setPlatformName] = useState('Navark CBT');
  const [supportEmail, setSupportEmail] = useState('support@navark.cbt');
  const [defaultSessionTimeout, setDefaultSessionTimeout] = useState('180');
  const [allowPublicRegistrations, setAllowPublicRegistrations] = useState(true);
  const [enforcePasswordPolicy, setEnforcePasswordPolicy] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Global Platform Settings"
        description="Configure platform-wide security policies, default timers, branding assets, and notification channels."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Platform Settings' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Platform settings updated successfully. Cached across active nodes.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Logo Preview Card */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Branding & Visual Identity</CardTitle>
            </div>
            <CardDescription className="text-xs">
              System logo and primary color configuration rendered on all portals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]">
              <div className="shrink-0">
                <AppLogo size="xl" showText={false} linkToHome={false} />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-[#481D1A] text-sm">Official Platform Asset</h4>
                <p className="text-muted-foreground text-[11px]">
                  Loaded from: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E7DCD3] font-mono">/brand/navark-logo.svg</code>
                </p>
                <div className="flex items-center gap-2 pt-2 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5">
                    <span className="h-4 w-4 rounded-full bg-[#481D1A] border border-black/20" />
                    <span className="font-mono text-[10px]">#481D1A (Maroon)</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-3">
                    <span className="h-4 w-4 rounded-full bg-[#FFFBF5] border border-black/20" />
                    <span className="font-mono text-[10px]">#FFFBF5 (Warm White)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Platform Brand Title</label>
                <Input
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Central Support Email</label>
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Policies */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Security & Tenant Controls</CardTitle>
            </div>
            <CardDescription className="text-xs">
              System access restrictions and session timeouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Maximum Exam Inactivity Timeout (Minutes)</label>
                <Input
                  type="number"
                  value={defaultSessionTimeout}
                  onChange={(e) => setDefaultSessionTimeout(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-0.5">Auto-submits inactive exam attempts.</p>
              </div>

              <div className="flex flex-col justify-center space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPublicRegistrations}
                    onChange={(e) => setAllowPublicRegistrations(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#481D1A] focus:ring-[#481D1A]"
                  />
                  <span className="font-medium text-foreground">Allow Inbound Institution Onboarding Requests</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enforcePasswordPolicy}
                    onChange={(e) => setEnforcePasswordPolicy(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#481D1A] focus:ring-[#481D1A]"
                  />
                  <span className="font-medium text-foreground">Enforce Complex Passwords (8+ Characters, Symbols)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6 gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Global Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

