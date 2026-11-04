import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, User, Building, Layers, Lock, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentProfilePage: React.FC = () => {
  const { user, institution } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Candidate Profile"
        description="Your official registered credentials and institutional enrollment details."
        breadcrumbs={[
          { label: 'Student Portal', href: '/student' },
          { label: 'My Profile' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Contact information updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#481D1A] text-white flex items-center justify-center font-bold text-base">
                {user?.name.charAt(0) || 'S'}
              </div>
              <div>
                <CardTitle className="text-base text-[#481D1A]">{user?.name}</CardTitle>
                <CardDescription className="text-xs">
                  {institution?.name} • Code: <strong>{institution?.code}</strong>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Assigned Student User ID</label>
                <Input value={user?.userId} disabled className="font-mono bg-muted/40 font-bold" />
                <p className="text-[10px] text-muted-foreground mt-0.5">Institution-scoped roll number</p>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Enrolled Batch</label>
                <Input value={user?.batchName || 'General Cohort'} disabled className="bg-muted/40" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Institutional Email</label>
              <Input value={user?.email} disabled className="bg-muted/40" />
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Contact Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Options Card */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Account Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-foreground">Password Management</p>
              <p className="text-muted-foreground text-[11px]">Regularly rotate your test portal password.</p>
            </div>
            <Link to="/settings/change-password">
              <Button variant="outline" size="sm" className="text-xs border-[#481D1A] text-[#481D1A]">
                Change Password
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6 gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Contact Info</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

