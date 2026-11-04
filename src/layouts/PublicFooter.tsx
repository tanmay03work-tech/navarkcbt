import React from 'react';
import { AppLogo } from '@/components/branding/AppLogo';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Mail, ExternalLink } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#E7DCD3] bg-[#FFFBF5] text-muted-foreground text-sm">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <AppLogo size="md" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              CBT Platform is a purpose-built, secure computer-based examination platform engineered for colleges, educational institutions, and universities.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#481D1A]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Multi-Tenant Architecture</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#481D1A] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-[#481D1A]">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#481D1A]">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-[#481D1A]">Frequently Asked Questions</Link></li>
              <li><Link to="/register" className="hover:text-[#481D1A]">Institutional Onboarding</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#481D1A] uppercase tracking-wider mb-3">
              Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-[#481D1A]">Institution Login</Link></li>
              <li><Link to="/login" className="hover:text-[#481D1A]">Teacher Portal</Link></li>
              <li><Link to="/login" className="hover:text-[#481D1A]">Student Test Portal</Link></li>
              <li><Link to="/login" className="hover:text-[#481D1A]">Platform Administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#481D1A] uppercase tracking-wider mb-3">
              Support & Inquiries
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/contact" className="hover:text-[#481D1A]">Contact Platform Support</Link></li>
              <li><Link to="/about" className="hover:text-[#481D1A]">About Platform</Link></li>
              <li className="flex items-center gap-1.5 pt-2 text-[#481D1A] font-medium">
                <Mail className="h-3.5 w-3.5" />
                <span>support@cbt-platform.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[#E7DCD3] flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} CBT Platform. All rights reserved. Built with precision.</p>
          <div className="flex items-center space-x-6">
            <span className="text-[11px]">Strict Institution-Scoped Data Isolation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

