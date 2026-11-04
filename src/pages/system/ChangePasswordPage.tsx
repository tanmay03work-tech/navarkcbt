import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setError(null);
    setSaved(true);
    setTimeout(() => {
      navigate('/settings');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PageHeader
        title="Update Account Password"
        description="Choose a strong, unique password to safeguard your test portal credentials."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Change Password' },
        ]}
      />

      {saved ? (
        <Card className="border-[#E7DCD3] bg-white text-center p-8 space-y-3">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <CardTitle className="text-lg text-[#481D1A]">Password Successfully Updated!</CardTitle>
          <p className="text-xs text-muted-foreground">
            Your login password has been changed. Returning to account preferences...
          </p>
        </Card>
      ) : (
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Set New Password</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Current Password *</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter existing password"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">New Password *</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Confirm New Password *</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/settings')}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

