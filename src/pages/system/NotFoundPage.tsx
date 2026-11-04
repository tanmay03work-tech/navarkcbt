import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { AppLogo } from '@/components/branding/AppLogo';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4">
      <Card className="border-[#E7DCD3] bg-white shadow-xl max-w-md w-full text-center p-8 space-y-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" linkToHome={false} />
        </div>

        <div className="rounded-full bg-[#481D1A]/10 p-4 w-16 h-16 mx-auto flex items-center justify-center text-[#481D1A]">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <CardTitle className="text-2xl font-black text-[#481D1A]">
          404 — Page Not Found
        </CardTitle>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The requested examination URL or dashboard route does not exist or has been relocated within the Navark CBT platform.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-xs gap-1 border-[#481D1A] text-[#481D1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </Button>

          <Link to="/">
            <Button size="sm" className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1 shadow-sm">
              <Home className="h-3.5 w-3.5" />
              <span>Platform Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

