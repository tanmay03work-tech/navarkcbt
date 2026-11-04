import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Building2,
  GraduationCap,
  BookOpen,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, institution, role, switchDemoRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSwitch = async (targetRole: UserRole | 'VISITOR', instCode: string = 'APEX') => {
    const res = await switchDemoRole(targetRole, instCode);
    setIsOpen(false);

    if (res.success && res.user) {
      if (targetRole === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (targetRole === 'INSTITUTION_ADMIN') {
        navigate('/institution');
      } else if (targetRole === 'TEACHER') {
        navigate('/teacher');
      } else if (targetRole === 'STUDENT') {
        navigate('/student');
      } else {
        navigate('/login');
      }
    } else if (targetRole === 'VISITOR') {
      navigate('/login');
    }
  };

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isOpen ? (
        <div className="w-84 rounded-2xl border border-[#481D1A]/20 bg-[#FFFBF5] p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7DCD3]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#481D1A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#481D1A]">
                Demo Role & Tenant Switcher
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="py-2.5">
            <div className="text-[11px] text-muted-foreground mb-1 font-medium">
              ACTIVE SESSION
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-[#E7DCD3] shadow-xs">
              <div className="truncate pr-2">
                <p className="text-xs font-bold text-[#481D1A] truncate">
                  {user ? user.name : 'Unauthenticated Visitor'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user ? `ID: ${user.userId} • ${role}` : 'Sign in required to view dashboards'}
                </p>
              </div>
              <Badge variant={user ? 'maroon' : 'outline'} className="text-[10px] shrink-0">
                {role}
              </Badge>
            </div>
          </div>

          <div className="space-y-1 pt-1 text-xs max-h-72 overflow-y-auto">
            <div className="text-[11px] text-muted-foreground font-semibold px-1 pb-1">
              Switch Persona (Instant Sign In):
            </div>

            {/* Super Admin */}
            <button
              onClick={() => handleSwitch('SUPER_ADMIN')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                role === 'SUPER_ADMIN'
                  ? 'bg-[#481D1A] text-white font-medium'
                  : 'hover:bg-muted/60 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-semibold">Super Admin</span>
              </div>
              <span className="text-[10px] opacity-80 font-mono">Platform Admin</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => handleSwitch('INSTITUTION_ADMIN', 'APEX')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                role === 'INSTITUTION_ADMIN' && institution?.code === 'APEX'
                  ? 'bg-[#481D1A] text-white font-medium'
                  : 'hover:bg-muted/60 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Admin</span>
              </div>
              <span className="text-[10px] opacity-75">ADMIN</span>
            </button>

            {/* Teacher */}
            <button
              onClick={() => handleSwitch('TEACHER', 'APEX')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                role === 'TEACHER' && institution?.code === 'APEX'
                  ? 'bg-[#481D1A] text-white font-medium'
                  : 'hover:bg-muted/60 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                <span>Teacher</span>
              </div>
              <span className="text-[10px] opacity-75">TEACHER</span>
            </button>

            {/* Student */}
            <button
              onClick={() => handleSwitch('STUDENT', 'APEX')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                role === 'STUDENT' && institution?.code === 'APEX'
                  ? 'bg-[#481D1A] text-white font-medium'
                  : 'hover:bg-muted/60 text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                <span>Student</span>
              </div>
              <span className="text-[10px] opacity-75">STUDENT</span>
            </button>

            {/* Logged Out / Visitor */}
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                !user
                  ? 'bg-rose-900/10 text-rose-800 font-semibold border border-rose-200'
                  : 'hover:bg-rose-50 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out (Visitor Mode)</span>
              </div>
              <span className="text-[10px]">Portal Login</span>
            </button>
          </div>

          <div className="mt-3 pt-2 border-t border-[#E7DCD3] text-[10px] text-muted-foreground flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>Multi-tenant isolation active. Testing utility.</span>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-[#481D1A] text-[#FFFBF5] px-4 py-2 shadow-2xl hover:bg-[#351412] flex items-center gap-2 border border-[#E7DCD3]/40"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span className="text-xs font-semibold">
            {user ? `${role}` : 'Visitor (Logged Out)'}
          </span>
          <ChevronUp className="h-3.5 w-3.5 opacity-80" />
        </Button>
      )}
    </div>
  );
};
