import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppLogo } from '@/components/branding/AppLogo';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const PublicNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, role } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const getDashboardPath = () => {
    switch (role) {
      case 'SUPER_ADMIN': return '/super-admin';
      case 'INSTITUTION_ADMIN': return '/institution';
      case 'TEACHER': return '/teacher';
      case 'STUDENT': return '/student';
      default: return '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E7DCD3] bg-[#FFFBF5]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFBF5]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <AppLogo size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-colors hover:text-[#481D1A] ${
                  isActive
                    ? 'text-[#481D1A] font-bold border-b-2 border-[#481D1A] pb-1'
                    : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {isAuthenticated && user ? (
            <Link to={getDashboardPath()}>
              <Button className="bg-[#481D1A] text-[#FFFBF5] hover:bg-[#351412] gap-2">
                <User className="h-4 w-4" />
                <span>Go to Dashboard ({user.role})</span>
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-[#481D1A] hover:bg-[#481D1A]/10 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#481D1A] text-[#FFFBF5] hover:bg-[#351412] font-semibold gap-1.5 shadow-sm">
                  <span>Register Institution</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground p-2 rounded-md hover:bg-muted"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7DCD3] bg-[#FFFBF5] px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.href
                    ? 'bg-[#481D1A]/10 text-[#481D1A] font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E7DCD3] space-y-2">
            {isAuthenticated && user ? (
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#481D1A] text-white">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-[#481D1A] text-[#481D1A]">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#481D1A] text-white">
                    Register Institution
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

