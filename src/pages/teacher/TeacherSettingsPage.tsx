import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, User, Lock, Save } from 'lucide-react';

export const TeacherSettingsPage: React.FC = () => {
  const { user, institution } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Faculty Account Settings"
        description="Personal profile and security options for your educator account."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Settings' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Faculty settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Faculty Profile</CardTitle>
            <CardDescription className="text-xs">
              Tenant: {institution?.name} ({institution?.code})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Faculty User ID</label>
                <Input value={user?.userId} disabled className="font-mono bg-muted/40" />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Contact Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Official Email</label>
              <Input value={user?.email} disabled className="bg-muted/40" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

