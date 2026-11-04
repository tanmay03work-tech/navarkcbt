import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { Building, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [institutionCode, setInstitutionCode] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionCode.trim() || !userId.trim()) return;
    setSubmitted(true);
  };

  return (
    <Card className="border-[#E7DCD3] bg-white shadow-lg">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" showText={false} linkToHome={false} />
        </div>
        <CardTitle className="text-2xl font-bold text-[#481D1A]">
          Recover Access
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your Institution Code and User ID to submit a password reset ticket.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="rounded-xl bg-stone-50 border border-[#E7DCD3] p-5 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-[#481D1A]">
              Request Logged
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an account matching the institution and user identifier exists in our directory, a recovery procedure has been queued in accordance with institutional policy. Contact your campus computer center or test coordinator for expedited resets.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Institution Code *
              </label>
              <div className="relative">
                <Building className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={institutionCode}
                  onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                  placeholder="e.g. APEX or ZENITH"
                  className="pl-9 font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Assigned User ID *
              </label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. STU001 or TCH101"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] font-semibold py-2 mt-2"
            >
              Request Password Reset
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-0 text-center flex justify-center">
        <Link to="/login" className="text-[11px] font-semibold text-[#481D1A] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          <span>Remember your password? Sign in</span>
        </Link>
      </CardFooter>
    </Card>
  );
};

