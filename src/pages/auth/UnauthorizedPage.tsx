import React from 'react';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const getFallbackRoute = () => {
    switch (role) {
      case 'SUPER_ADMIN': return '/super-admin';
      case 'INSTITUTION_ADMIN': return '/institution';
      case 'TEACHER': return '/teacher';
      case 'STUDENT': return '/student';
      default: return '/';
    }
  };

  return (
    <Card className="border-[#E7DCD3] bg-white shadow-lg text-center p-8 space-y-4">
      <div className="rounded-full bg-rose-50 border border-rose-200 p-4 w-16 h-16 mx-auto flex items-center justify-center text-rose-600">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <CardTitle className="text-2xl font-bold text-[#481D1A]">
        Unauthorized Access
      </CardTitle>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Your current session ({role}) does not have permission to view this resource. If you believe this is an error, check your active role or contact your institution administrator.
      </p>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-[#481D1A] text-[#481D1A] text-xs gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Go Back</span>
        </Button>
        <Link to={getFallbackRoute()}>
          <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5">
            <Home className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};

