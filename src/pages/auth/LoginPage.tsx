import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { authService } from '@/services/auth.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import {
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, role, rememberedInstitutionCode } = useAuth();
  const branding = useBranding();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected with a message (e.g. from session expired or protected route)
  const redirectState = location.state as { from?: string; message?: string; expired?: boolean } | null;

  const [institutionCode, setInstitutionCode] = useState(rememberedInstitutionCode || 'APEX');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [institutionLookupName, setInstitutionLookupName] = useState<string | null>(null);
  const [lookedUpBranding, setLookedUpBranding] = useState<{
    name?: string;
    logoUrl?: string;
    primaryColor?: string;
    loginHeading?: string;
    loginSubheading?: string;
  } | null>(null);

  // If already authenticated, redirect to the appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && role !== 'VISITOR') {
      const targetPath = redirectState?.from || authService.getDashboardPath(role);
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate, redirectState]);

  // Live lookup of institution code to give immediate feedback and load dynamic branding
  useEffect(() => {
    let isCurrent = true;
    if (institutionCode.trim().length >= 2) {
      Promise.resolve(authService.lookupInstitution(institutionCode)).then((inst) => {
        if (!isCurrent) return;
        if (inst) {
          setInstitutionLookupName(inst.name);
          const b = inst.settings?.branding;
          setLookedUpBranding({
            name: b?.institutionName || inst.name,
            logoUrl: b?.logoUrl || inst.logoUrl,
            primaryColor: b?.primaryColor,
            loginHeading: b?.loginHeading,
            loginSubheading: b?.loginSubheading,
          });
        } else {
          setInstitutionLookupName(null);
          setLookedUpBranding(null);
        }
      });
    } else {
      setInstitutionLookupName(null);
      setLookedUpBranding(null);
    }
    return () => {
      isCurrent = false;
    };
  }, [institutionCode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedCode = institutionCode.trim().toUpperCase();
    const trimmedUserId = userId.trim();

    if (!trimmedCode) {
      setErrorMessage('Please enter your Institution Code.');
      return;
    }
    if (!trimmedUserId) {
      setErrorMessage('Please enter your assigned User ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedCode, trimmedUserId, password, rememberMe);
      if (result.success && result.user) {
        // Redirection logic
        const destination =
          redirectState?.from && !redirectState.from.includes('/login')
            ? redirectState.from
            : result.redirectPath || authService.getDashboardPath(result.user.role);

        navigate(destination, { replace: true });
      } else {
        setErrorMessage(
          result.error ||
            'Invalid credentials. Please verify your Institution Code, User ID, and Password.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutofill = async (code: string, id: string, pass: string = 'password123') => {
    setInstitutionCode(code);
    setUserId(id);
    setPassword(pass);
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await login(code, id, pass, rememberMe);
      if (result.success && result.user) {
        const destination =
          redirectState?.from && !redirectState.from.includes('/login')
            ? redirectState.from
            : result.redirectPath || authService.getDashboardPath(result.user.role);
        navigate(destination, { replace: true });
      } else {
        setErrorMessage(
          result.error || 'Invalid credentials. Please verify your Institution Code, User ID, and Password.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Session Expired or Protected Route Warning Banner */}
      {redirectState?.message && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-sm">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">{redirectState.expired ? 'Session Expired' : 'Authentication Required'}</p>
            <p className="text-amber-800 mt-0.5">{redirectState.message}</p>
          </div>
        </div>
      )}

      <Card className="border-[#E7DCD3] bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Top Decorative Header with Dynamic Brand Color */}
        <div
          className="h-2 transition-colors duration-300"
          style={{
            backgroundColor: lookedUpBranding?.primaryColor || branding.primaryColor || '#481D1A',
          }}
        />

        <CardHeader className="space-y-2 text-center pt-6 pb-4 px-6 sm:px-8">
          <div className="flex justify-center mb-1">
            <AppLogo
              size="lg"
              showText={false}
              linkToHome={false}
              overrideLogoUrl={lookedUpBranding?.logoUrl}
              overridePrimaryColor={lookedUpBranding?.primaryColor}
            />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ color: lookedUpBranding?.primaryColor || branding.primaryColor || '#481D1A' }}
            >
              {lookedUpBranding?.loginHeading || branding.loginHeading || 'CBT Sign In'}
            </h1>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              {lookedUpBranding?.loginSubheading || branding.loginSubheading || 'Computer-based examination portal'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 sm:px-8 pb-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-900 flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs" noValidate>
            {/* 1. Institution Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="instCode" className="font-semibold text-[#481D1A]">
                  Institution Code <span className="text-rose-600">*</span>
                </label>
                {institutionLookupName && (
                  <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="truncate max-w-[170px]">{institutionLookupName}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Building className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                <Input
                  id="instCode"
                  value={institutionCode}
                  onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                  placeholder="Enter Institution Code"
                  autoComplete="organization"
                  className="pl-10 font-mono tracking-wider uppercase h-10 border-[#E7DCD3] focus-visible:ring-[#481D1A]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Unique identifier provided by your school, college, or platform administrator.
              </p>
            </div>

            {/* 2. User ID */}
            <div>
              <label htmlFor="userId" className="block font-semibold text-[#481D1A] mb-1">
                Assigned User ID <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. STU001, TCH101, or ADMIN"
                  autoComplete="username"
                  className="pl-10 h-10 border-[#E7DCD3] focus-visible:ring-[#481D1A]"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Your role-specific candidate, faculty, or admin ID.
              </p>
            </div>

            {/* 3. Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="font-semibold text-[#481D1A]">
                  Password <span className="text-rose-600">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#481D1A] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-10 border-[#E7DCD3] focus-visible:ring-[#481D1A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-[#481D1A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 4. Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E7DCD3] text-[#481D1A] focus:ring-[#481D1A] h-4 w-4"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* 5. Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: lookedUpBranding?.primaryColor || branding.primaryColor || '#481D1A',
              }}
              className="w-full text-[#FFFBF5] hover:opacity-90 h-11 text-sm font-semibold rounded-xl shadow-md transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In to Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-[#E7DCD3]">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#481D1A]">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Instant 1-Click Test Portals</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Click to sign in immediately</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* 1. Super Admin */}
              <button
                type="button"
                onClick={() => handleAutofill('NAWARK', 'NawarK_Admin', 'NawarK@Admin')}
                className="text-left p-2.5 rounded-xl bg-[#481D1A] hover:bg-[#351412] text-white shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-bold text-xs">Super Admin</span>
                  <span className="text-[9px] bg-amber-400 text-[#481D1A] px-1.5 py-0.5 rounded font-bold">1-Click</span>
                </div>
                <p className="text-white/80 font-mono text-[10px] mt-0.5">Admin Portal</p>
              </button>

              {/* 2. Admin */}
              <button
                type="button"
                onClick={() => handleAutofill('APEX', 'ADMIN', 'password123')}
                className="text-left p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E7DCD3] text-[#481D1A] shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Admin</span>
                  <span className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-bold">1-Click</span>
                </div>
                <p className="text-muted-foreground font-mono text-[10px] mt-0.5">ADMIN</p>
              </button>

              {/* 3. Teacher */}
              <button
                type="button"
                onClick={() => handleAutofill('APEX', 'TCH101', 'password123')}
                className="text-left p-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#E7DCD3] text-[#481D1A] shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Teacher</span>
                  <span className="text-[9px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-bold">1-Click</span>
                </div>
                <p className="text-muted-foreground font-mono text-[10px] mt-0.5">TEACHER</p>
              </button>

              {/* 4. Student */}
              <button
                type="button"
                onClick={() => handleAutofill('APEX', 'STU001', 'password123')}
                className="text-left p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-300 text-emerald-950 shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900">Student</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">1-Click</span>
                </div>
                <p className="text-emerald-800 font-mono text-[10px] mt-0.5">STUDENT</p>
              </button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-0 pb-6 px-6 sm:px-8 border-t border-[#E7DCD3] bg-muted/20 text-center flex flex-col gap-2">
          <p className="text-xs text-muted-foreground pt-4">
            New institution or organization?{' '}
            <Link
              to="/register"
              className="font-bold text-[#481D1A] hover:underline inline-flex items-center gap-1"
            >
              <span>Request Account</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Trust & Multi-Tenant Security Note */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <span>Enterprise Data Isolation • Institution Scoped Access</span>
      </div>
    </div>
  );
};
