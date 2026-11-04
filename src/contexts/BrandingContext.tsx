import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InstitutionBranding } from '@/types';

interface BrandingContextType {
  branding: InstitutionBranding;
  isCustomBranded: boolean;
  institutionName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  loginHeading: string;
  loginSubheading: string;
}

const DEFAULT_BRANDING: InstitutionBranding = {
  institutionName: '',
  tagline: 'Examination Platform',
  logoUrl: '/brand/navark-logo.svg',
  primaryColor: '#481D1A',
  secondaryColor: '#FFFBF5',
  loginHeading: 'CBT Sign In',
  loginSubheading: 'Computer-based examination portal',
};

// Helper to convert hex (#481D1A) to HSL string ("4 47% 19%") for CSS variables
function hexToHsl(hex: string): string {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  if (c.length !== 6) return '4 47% 19%';

  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { institution, role } = useAuth();

  const isSuperAdmin = role === 'SUPER_ADMIN';

  const branding = useMemo<InstitutionBranding>(() => {
    // Platform super admin interface always retains standard default platform branding
    if (isSuperAdmin || !institution) {
      return DEFAULT_BRANDING;
    }

    const custom = institution.settings?.branding || {};
    return {
      institutionName: custom.institutionName || institution.name,
      tagline: custom.tagline || 'Examination Platform',
      logoUrl: custom.logoUrl || institution.logoUrl || DEFAULT_BRANDING.logoUrl,
      faviconUrl: custom.faviconUrl,
      primaryColor: custom.primaryColor || DEFAULT_BRANDING.primaryColor,
      secondaryColor: custom.secondaryColor || DEFAULT_BRANDING.secondaryColor,
      loginHeading: custom.loginHeading || `${institution.name} Portal`,
      loginSubheading: custom.loginSubheading || 'Authorized candidate and faculty examination access',
    };
  }, [institution, isSuperAdmin]);

  // Dynamically update CSS variables and favicon
  useEffect(() => {
    const root = document.documentElement;

    if (isSuperAdmin || !institution) {
      // Revert to platform standard
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-hover');
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');

      const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (favicon) {
        favicon.href = '/favicon.ico';
      }
      return;
    }

    if (branding.primaryColor) {
      const hsl = hexToHsl(branding.primaryColor);
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--brand-primary', branding.primaryColor);
    }

    if (branding.secondaryColor) {
      root.style.setProperty('--brand-secondary', branding.secondaryColor);
    }

    if (branding.faviconUrl) {
      let favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'shortcut icon';
        document.head.appendChild(favicon);
      }
      favicon.href = branding.faviconUrl;
    }
  }, [branding, isSuperAdmin, institution]);

  const value: BrandingContextType = {
    branding,
    isCustomBranded: !isSuperAdmin && !!institution && !!institution.settings?.branding,
    institutionName: branding.institutionName || institution?.name || 'CBT Platform',
    tagline: branding.tagline || 'Examination Platform',
    logoUrl: branding.logoUrl || '/brand/navark-logo.svg',
    primaryColor: branding.primaryColor || '#481D1A',
    secondaryColor: branding.secondaryColor || '#FFFBF5',
    loginHeading: branding.loginHeading || 'CBT Sign In',
    loginSubheading: branding.loginSubheading || 'Computer-based examination portal',
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

