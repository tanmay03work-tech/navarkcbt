import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AcceptInvitationPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [completed, setCompleted] = useState(false);

  // Demo invitation preview parameters
  const invitationInfo = {
    institutionName: 'Apex Institute of Science',
    institutionCode: 'APEX',
    role: 'TEACHER',
    name: 'Prof. Rajesh Kulkarni',
    email: 'rajesh.kulkarni@apex-science.edu',
    assignedUserId: 'TCH101',
  };

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length >= 8 && password === confirmPassword) {
      setCompleted(true);
    }
  };

  return (
    <Card className="border-[#E7DCD3] bg-white shadow-lg">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" showText={false} linkToHome={false} />
        </div>
        <CardTitle className="text-2xl font-bold text-[#481D1A]">
          Accept Invitation
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          You have been invited to join an educational workspace on Navark CBT.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {completed ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">
              Account Activated!
            </h3>
            <p className="text-xs text-emerald-700">
              Your password has been configured. You can now log into {invitationInfo.institutionName} using your credentials:
            </p>
            <div className="rounded bg-white p-3 border border-emerald-200 text-xs font-mono text-left space-y-1">
              <div>Institution Code: <strong>{invitationInfo.institutionCode}</strong></div>
              <div>User ID: <strong>{invitationInfo.assignedUserId}</strong></div>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAccept} className="space-y-4 text-xs">
            <div className="rounded-lg bg-stone-50 border border-[#E7DCD3] p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Institution</span>
                <Badge variant="maroon">{invitationInfo.institutionCode}</Badge>
              </div>
              <p className="font-bold text-[#481D1A]">{invitationInfo.institutionName}</p>
              <div className="text-[11px] text-muted-foreground pt-1 border-t border-[#E7DCD3]">
                Invited as: <span className="font-semibold text-foreground">{invitationInfo.name}</span> ({invitationInfo.role})
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">
                Assigned ID: {invitationInfo.assignedUserId}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Create Account Password *
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
                Confirm Password *
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

            <Button
              type="submit"
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] font-semibold py-2"
            >
              Activate Account & Accept
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-0 text-center flex justify-center">
        <Link to="/login" className="text-[11px] font-semibold text-[#481D1A] hover:underline">
          Already have an account? Sign In
        </Link>
      </CardFooter>
    </Card>
  );
};

