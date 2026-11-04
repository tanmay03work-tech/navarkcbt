import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { AppLogo } from '@/components/branding/AppLogo';
import { ServerOff, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServiceUnavailablePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4">
      <Card className="border-[#E7DCD3] bg-white shadow-xl max-w-md w-full text-center p-8 space-y-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" linkToHome={false} />
        </div>

        <div className="rounded-full bg-rose-50 border border-rose-200 p-4 w-16 h-16 mx-auto flex items-center justify-center text-rose-600">
          <ServerOff className="h-8 w-8" />
        </div>

        <CardTitle className="text-2xl font-black text-[#481D1A]">
          Service Temporarily Unavailable
        </CardTitle>

        <p className="text-xs text-muted-foreground leading-relaxed">
          The test cluster is currently undergoing synchronized maintenance or experiencing momentary latency. Real-time answer state remains preserved.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Button
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </Button>

          <Link to="/">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-[#481D1A]/30 text-[#481D1A]">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

