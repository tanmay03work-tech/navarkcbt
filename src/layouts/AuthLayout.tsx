import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppLogo } from '@/components/branding/AppLogo';
import { DemoRoleSwitcher } from '@/components/common/DemoRoleSwitcher';
import { ShieldCheck, LogIn, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFFBF5]">
      {/* Top Header */}
      <header className="px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[#E7DCD3] bg-white/70 backdrop-blur">
        <AppLogo size="md" linkToHome={false} />

        <div className="flex items-center gap-3">
          {!isLoginPage ? (
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#481D1A] hover:underline bg-[#481D1A]/5 px-3 py-1.5 rounded-lg border border-[#481D1A]/10"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Secure Testing Portal</span>
            </div>
          )}
        </div>
      </header>

      {/* Centered Auth Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-4 border-t border-[#E7DCD3] bg-white/50 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Multi-tenant institution security guaranteed</span>
        </div>
        <div>
          © {new Date().getFullYear()} CBT Platform. All rights reserved.
        </div>
      </footer>

      {/* Demo Persona Switcher (accessible for evaluator convenience) */}
      <DemoRoleSwitcher />
    </div>
  );
};
