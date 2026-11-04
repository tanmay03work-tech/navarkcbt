import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useBranding } from '@/contexts/BrandingContext';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  linkToHome?: boolean;
  institutionName?: string;
  overrideLogoUrl?: string;
  overridePrimaryColor?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className,
  size = 'md',
  showText = true,
  linkToHome = true,
  institutionName,
  overrideLogoUrl,
  overridePrimaryColor,
}) => {
  const branding = useBranding();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  const activeLogo = overrideLogoUrl || branding.logoUrl || '/brand/navark-logo.svg';
  const displayName = institutionName || branding.institutionName;
  const brandPrimary = overridePrimaryColor || branding.primaryColor || '#481D1A';

  const content = (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      <div className={cn('relative flex items-center justify-center shrink-0', sizeClasses[size])}>
        <img
          src={activeLogo}
          alt={`${displayName || 'CBT'} Platform Logo`}
          className="h-full w-full object-contain"
          onError={(e) => {
            // Fallback to standard platform logo if custom logo fails to load
            (e.target as HTMLImageElement).src = '/brand/navark-logo.svg';
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className="font-extrabold tracking-tight text-lg sm:text-xl truncate max-w-[200px]"
              style={{ color: brandPrimary }}
            >
              {displayName || 'CBT'}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${brandPrimary}1A`,
                color: brandPrimary,
              }}
            >
              PORTAL
            </span>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[200px]">
            {branding.tagline || 'Examination Platform'}
          </span>
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
};

