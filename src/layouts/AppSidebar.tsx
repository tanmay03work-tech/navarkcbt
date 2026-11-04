import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLogo } from '@/components/branding/AppLogo';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  CalendarCheck,
  Award,
  BarChart3,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Layers,
  Sparkles,
  Inbox,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onCloseMobile }) => {
  const { user, institution, role, logout } = useAuth();

  // Role-specific navigation menus
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Overview', href: '/super-admin', icon: LayoutDashboard },
          { label: 'Institutions', href: '/super-admin/institutions', icon: Building2 },
          { label: 'Onboarding Requests', href: '/super-admin/requests', icon: Inbox },
          { label: 'Platform Users', href: '/super-admin/users', icon: Users },
          { label: 'Global Analytics', href: '/super-admin/analytics', icon: BarChart3 },
          { label: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
        ];

      case 'INSTITUTION_ADMIN':
        return [
          { label: 'Dashboard', href: '/institution', icon: LayoutDashboard },
          { label: 'Students', href: '/institution/students', icon: GraduationCap },
          { label: 'Teachers', href: '/institution/teachers', icon: UserCheck },
          { label: 'Batches / Classes', href: '/institution/batches', icon: Layers },
          { label: 'Subjects', href: '/institution/subjects', icon: BookOpen },
          { label: 'Question Bank', href: '/institution/questions', icon: FileQuestion },
          { label: 'Exams & Tests', href: '/institution/exams', icon: CalendarCheck },
          { label: 'Results & Scores', href: '/institution/results', icon: Award },
          { label: 'Performance Analytics', href: '/institution/analytics', icon: BarChart3 },
          { label: 'Study Materials', href: '/institution/materials', icon: FileText },
          { label: 'Announcements', href: '/institution/announcements', icon: Bell },
          { label: 'Institution Settings', href: '/institution/settings', icon: Settings },
        ];

      case 'TEACHER':
        return [
          { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
          { label: 'My Batches', href: '/teacher/batches', icon: Layers },
          { label: 'My Students', href: '/teacher/students', icon: GraduationCap },
          { label: 'Question Bank', href: '/teacher/questions', icon: FileQuestion },
          { label: 'Exam Management', href: '/teacher/exams', icon: CalendarCheck },
          { label: 'Batch Results', href: '/teacher/results', icon: Award },
          { label: 'Batch Analytics', href: '/teacher/analytics', icon: BarChart3 },
          { label: 'Study Materials', href: '/teacher/materials', icon: FileText },
          { label: 'Settings', href: '/teacher/settings', icon: Settings },
        ];

      case 'STUDENT':
      default:
        return [
          { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
          { label: 'My Exams', href: '/student/exams', icon: CalendarCheck },
          { label: 'Upcoming Schedule', href: '/student/exams/upcoming', icon: CalendarCheck },
          { label: 'My Results', href: '/student/results', icon: Award },
          { label: 'Performance Analytics', href: '/student/performance', icon: BarChart3 },
          { label: 'Study Materials', href: '/student/materials', icon: FileText },
          { label: 'Announcements', href: '/student/announcements', icon: Bell },
          { label: 'My Profile', href: '/student/profile', icon: Users },
          { label: 'Help & FAQs', href: '/help', icon: HelpCircle },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 border-r border-[#E7DCD3] bg-[#FFFBF5] flex flex-col h-full shrink-0 select-none">
      {/* Top Brand Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#E7DCD3] justify-between">
        <AppLogo size="sm" showText linkToHome={false} />
      </div>

      {/* Scope Badge */}
      {institution ? (
        <div className="px-4 py-3 border-b border-[#E7DCD3] bg-white/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              PORTAL
            </span>
            <Badge variant="maroon" className="text-[10px] px-1.5 py-0 font-mono">
              {role}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 border-b border-[#E7DCD3] bg-amber-50/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Platform Super Admin</span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/super-admin' || item.href === '/institution' || item.href === '/teacher' || item.href === '/student'}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-[#481D1A] text-white shadow-sm font-semibold'
                  : 'text-foreground/80 hover:bg-[#481D1A]/10 hover:text-[#481D1A]'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Info & Logout footer */}
      <div className="p-3 border-t border-[#E7DCD3] bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-[#481D1A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user ? user.name.charAt(0) : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#481D1A] truncate">
                {user?.name || role}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user ? `${role}` : 'Guest'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

