import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InstitutionBranding } from '@/types';
import { AppLogo } from '@/components/branding/AppLogo';
import {
  Palette,
  Sparkles,
  Upload,
  Eye,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface WhiteLabelBrandingFormProps {
  branding: InstitutionBranding;
  onChange: (updated: InstitutionBranding) => void;
  defaultInstitutionName?: string;
}

export const WhiteLabelBrandingForm: React.FC<WhiteLabelBrandingFormProps> = ({
  branding,
  onChange,
  defaultInstitutionName = '',
}) => {
  const handleColorChange = (key: 'primaryColor' | 'secondaryColor', value: string) => {
    onChange({ ...branding, [key]: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'logoUrl' | 'faviconUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange({ ...branding, [key]: base64 });
      }
    };
    reader.readAsDataURL(file);
  };

  const activePrimary = branding.primaryColor || '#481D1A';
  const activeSecondary = branding.secondaryColor || '#FFFBF5';
  const activeName = branding.institutionName || defaultInstitutionName || 'Institution Name';
  const activeTagline = branding.tagline || 'Examination Platform';
  const activeHeading = branding.loginHeading || `${activeName} Portal`;
  const activeSubheading = branding.loginSubheading || 'Authorized candidate and faculty examination access';

  return (
    <div className="space-y-6">
      <Card className="border-[#E7DCD3] bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#481D1A]" />
            <CardTitle className="text-base text-[#481D1A]">
              Institution Branding / White Label Configuration
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure custom identity, colors, logo, and login screen customization for this tenant. Controlled exclusively by Super Admin.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 text-xs">
          {/* Institution Display Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Display Brand Name
              </label>
              <Input
                value={branding.institutionName || ''}
                onChange={(e) => onChange({ ...branding, institutionName: e.target.value })}
                placeholder={defaultInstitutionName || 'e.g. Apex Global Academy'}
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Overrides the legal name on branded headers & scorecards.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Institution Tagline / Subtitle (Optional)
              </label>
              <Input
                value={branding.tagline || ''}
                onChange={(e) => onChange({ ...branding, tagline: e.target.value })}
                placeholder="e.g. Center for Academic Excellence & CBT"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Displays below the brand logo in sidebar and header.
              </p>
            </div>
          </div>

          {/* Logo Upload & Favicon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Institution Logo
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={branding.logoUrl || ''}
                  onChange={(e) => onChange({ ...branding, logoUrl: e.target.value })}
                  placeholder="/brand/... or https://... or Base64"
                  className="text-xs font-mono"
                />
                <label className="shrink-0 cursor-pointer">
                  <span className="inline-flex items-center gap-1 px-3 py-2 border border-[#481D1A] text-[#481D1A] rounded-md text-xs font-semibold hover:bg-[#481D1A]/5">
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Recommended: PNG/SVG with transparent background (height ~40-60px).
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Favicon (Optional)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={branding.faviconUrl || ''}
                  onChange={(e) => onChange({ ...branding, faviconUrl: e.target.value })}
                  placeholder="https://... or Base64"
                  className="text-xs font-mono"
                />
                <label className="shrink-0 cursor-pointer">
                  <span className="inline-flex items-center gap-1 px-3 py-2 border border-[#481D1A] text-[#481D1A] rounded-md text-xs font-semibold hover:bg-[#481D1A]/5">
                    <Upload className="h-3 w-3" />
                    <span>Upload</span>
                  </span>
                  <input
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'faviconUrl')}
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Browser tab icon (32x32px .ico or .png).
              </p>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-xl border border-[#E7DCD3] bg-stone-50/50 space-y-2">
              <label className="block font-semibold text-[#481D1A]">
                Primary Brand Color *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={activePrimary}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border border-[#E7DCD3]"
                />
                <Input
                  value={branding.primaryColor || ''}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  placeholder="#481D1A"
                  className="font-mono uppercase text-xs"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Applies to top banners, action buttons, active sidebar tabs & highlights.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E7DCD3] bg-stone-50/50 space-y-2">
              <label className="block font-semibold text-[#481D1A]">
                Secondary Surface Accent (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={activeSecondary}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="h-10 w-14 rounded cursor-pointer border border-[#E7DCD3]"
                />
                <Input
                  value={branding.secondaryColor || ''}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  placeholder="#FFFBF5"
                  className="font-mono uppercase text-xs"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Warm surface and subtle card background accent.
              </p>
            </div>
          </div>

          {/* Login Page Custom Branding */}
          <div className="border-t border-[#E7DCD3] pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#481D1A]">
              Custom Login Page Branding
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Custom Login Title
                </label>
                <Input
                  value={branding.loginHeading || ''}
                  onChange={(e) => onChange({ ...branding, loginHeading: e.target.value })}
                  placeholder={`e.g. Welcome to ${activeName}`}
                />
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Login Subheading / Instructions
                </label>
                <Input
                  value={branding.loginSubheading || ''}
                  onChange={(e) => onChange({ ...branding, loginSubheading: e.target.value })}
                  placeholder="e.g. Sign in with your roll number and password"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Branding Preview */}
      <Card className="border-[#E7DCD3] bg-white shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base text-[#481D1A]">
                Live Real-Time Branding Preview
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-900 border-amber-300">
              Instant Preview Before Saving
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Preview how this institution&apos;s candidate login portal and dashboard banner will appear to students and faculty.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview 1: Branded Login Card */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                1. Candidate Login Screen Preview
              </span>
              <div
                className="p-5 rounded-2xl border shadow-sm space-y-4"
                style={{ backgroundColor: activeSecondary, borderColor: '#E7DCD3' }}
              >
                {/* Header stripe with brand primary */}
                <div className="h-1.5 rounded-full" style={{ backgroundColor: activePrimary }} />

                <div className="text-center space-y-2 pt-2">
                  <div className="flex justify-center">
                    <img
                      src={branding.logoUrl || '/brand/navark-logo.svg'}
                      alt="Brand Logo"
                      className="h-10 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/brand/navark-logo.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-base" style={{ color: activePrimary }}>
                      {activeHeading}
                    </h5>
                    <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
                      {activeSubheading}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 max-w-xs mx-auto">
                  <div className="h-8 rounded-md bg-white border border-[#E7DCD3] px-3 flex items-center text-[10px] text-muted-foreground">
                    Institution Code: <span className="font-mono font-bold text-foreground ml-1">CODE</span>
                  </div>
                  <div className="h-8 rounded-md bg-white border border-[#E7DCD3] px-3 flex items-center text-[10px] text-muted-foreground">
                    Assigned User ID: <span className="font-mono text-foreground ml-1">STU001</span>
                  </div>
                  <div
                    className="h-9 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    style={{ backgroundColor: activePrimary }}
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="text-center text-[9px] text-muted-foreground pt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>White Label Secured Environment</span>
                </div>
              </div>
            </div>

            {/* Preview 2: Dashboard Header & Navigation Banner */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                2. Authenticated Dashboard & Arena Banner Preview
              </span>
              <div className="rounded-2xl border border-[#E7DCD3] overflow-hidden bg-white shadow-xs">
                {/* Header bar */}
                <div
                  className="px-4 py-3 border-b flex items-center justify-between"
                  style={{ backgroundColor: activeSecondary, borderColor: '#E7DCD3' }}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={branding.logoUrl || '/brand/navark-logo.svg'}
                      alt="Logo"
                      className="h-7 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/brand/navark-logo.svg';
                      }}
                    />
                    <div>
                      <p className="text-xs font-extrabold leading-none" style={{ color: activePrimary }}>
                        {activeName}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                        {activeTagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                      style={{ backgroundColor: `${activePrimary}1A`, color: activePrimary }}
                    >
                      LIVE CBT
                    </span>
                    <div
                      className="h-6 px-2.5 rounded-full text-white text-[10px] font-bold flex items-center gap-1"
                      style={{ backgroundColor: activePrimary }}
                    >
                      <span>Take Test</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Content Card */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="text-xs font-bold" style={{ color: activePrimary }}>
                        JEE Advanced Intensive Assessment
                      </h6>
                      <p className="text-[10px] text-muted-foreground">Physics, Chemistry & Mathematics</p>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${activePrimary}15`, color: activePrimary }}
                    >
                      60 Mins • 100 Marks
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-50 border border-[#E7DCD3] text-[10px] flex items-center justify-between">
                    <span className="text-muted-foreground">Palette & Action Highlights</span>
                    <span className="font-bold font-mono" style={{ color: activePrimary }}>
                      {activePrimary}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

