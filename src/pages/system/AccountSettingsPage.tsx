import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, User, Lock, Save, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountSettingsPage: React.FC = () => {
  const { user, institution, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, phone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Account Preferences"
        description="Manage your profile information, password, and notification preferences."
        breadcrumbs={[
          { label: 'Portal', href: '/' },
          { label: 'Settings' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#481D1A] text-white flex items-center justify-center font-bold text-sm">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div>
                <CardTitle className="text-base text-[#481D1A]">{user?.name}</CardTitle>
                <CardDescription className="text-xs">
                  {institution ? `${institution.name} (${institution.code})` : 'Global Platform Account'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Display Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Assigned User ID</label>
                <Input value={user?.userId} disabled className="font-mono bg-muted/40 font-bold" />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Account Role</label>
                <Input value={user?.role} disabled className="bg-muted/40" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Email Address</label>
              <Input value={user?.email} disabled className="bg-muted/40" />
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Contact Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 90000 00000" />
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#481D1A]" />
              <CardTitle className="text-base text-[#481D1A]">Password & Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-foreground">Password Update</p>
              <p className="text-muted-foreground text-[11px]">Regularly rotate your password for account protection.</p>
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
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

