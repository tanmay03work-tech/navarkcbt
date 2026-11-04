import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Building,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { contentService } from '@/services/result.service';
import { AppNotification } from '@/types';

interface AppHeaderProps {
  onToggleMobileMenu: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, institution, role, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (user?.id) {
      contentService.getUserNotifications(user.id).then(setNotifications).catch(() => {});
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getProfileLink = () => {
    switch (role) {
      case 'STUDENT': return '/student/profile';
      case 'TEACHER': return '/teacher/profile';
      case 'INSTITUTION_ADMIN': return '/institution/profile';
      default: return '/settings';
    }
  };

  return (
    <header className="h-16 border-b border-[#E7DCD3] bg-[#FFFBF5]/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-md"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search form */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-64 md:w-80">
          <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exams, questions, batches..."
            className="pl-9 h-9 text-xs bg-white/70 border-[#E7DCD3] focus-visible:ring-[#481D1A]"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Scope Pill */}
        {institution && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/80 border border-[#E7DCD3] rounded-full text-xs">
            <Building className="h-3.5 w-3.5 text-[#481D1A]" />
            <span className="font-semibold text-[#481D1A]">{role}</span>
          </div>
        )}

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-[#481D1A]">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#FFFBF5] border-[#E7DCD3] p-2">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#E7DCD3]">
              <span className="text-xs font-bold text-[#481D1A] uppercase tracking-wider">
                Notifications
              </span>
              <Badge variant="maroon" className="text-[10px]">
                {unreadCount} New
              </Badge>
            </div>
            <div className="max-h-64 overflow-y-auto py-1 space-y-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      notif.isRead ? 'bg-transparent text-muted-foreground' : 'bg-white font-medium text-foreground shadow-xs'
                    }`}
                  >
                    <p className="font-semibold text-[#481D1A] text-[11px]">{notif.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <Link to="/notifications" className="block text-center text-xs font-semibold text-[#481D1A] py-1 hover:underline">
              View all notifications
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-full hover:bg-white/80">
              <div className="h-8 w-8 rounded-full bg-[#481D1A] text-white flex items-center justify-center font-bold text-xs">
                {user ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#481D1A] leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {user ? `${role}` : 'Guest'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#FFFBF5] border-[#E7DCD3]">
            <div className="px-3 py-2 border-b border-[#E7DCD3]">
              <p className="text-xs font-bold text-[#481D1A]">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link to={getProfileLink()} className="flex items-center gap-2 text-xs py-2">
                <User className="h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 text-xs py-2">
                <Settings className="h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/help" className="flex items-center gap-2 text-xs py-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Documentation</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-xs py-2 text-rose-600 focus:text-rose-700">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

