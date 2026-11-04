import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { Lock, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple token simulation
  const isTokenValid = true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  if (!isTokenValid) {
    return (
      <Card className="border-[#E7DCD3] bg-white shadow-lg text-center p-6 space-y-4">
        <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto" />
        <CardTitle className="text-xl text-[#481D1A]">Invalid or Expired Link</CardTitle>
        <p className="text-xs text-muted-foreground">
          This password reset token has expired or is invalid. Please request a new link.
        </p>
        <Link to="/forgot-password">
          <Button className="bg-[#481D1A] text-white">Request New Token</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="border-[#E7DCD3] bg-white shadow-lg">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" showText={false} linkToHome={false} />
        </div>
        <CardTitle className="text-2xl font-bold text-[#481D1A]">
          Set New Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Choose a secure password for your Navark CBT account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-900">
              Password Updated Successfully
            </h3>
            <p className="text-xs text-emerald-700">
              Your credentials have been securely refreshed. You may now authenticate with your new password.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                  Proceed to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {error && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Security Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-0.5 pl-1">
                <li>Minimum 8 characters</li>
                <li>Include at least one number or symbol</li>
                <li>Avoid reusing common institutional passwords</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] font-semibold py-2 mt-2"
            >
              Update Password
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-0 text-center flex justify-center">
        <Link to="/login" className="text-[11px] font-semibold text-[#481D1A] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Sign In</span>
        </Link>
      </CardFooter>
    </Card>
  );
};

