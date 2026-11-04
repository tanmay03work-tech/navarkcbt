import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institution.service';
import { CheckCircle2, Building, Mail, Phone, MapPin, Save } from 'lucide-react';

export const InstitutionProfilePage: React.FC = () => {
  const { institution } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name,
        email: institution.email,
        phone: institution.phone,
        address: institution.address,
        city: institution.city,
        state: institution.state,
        pincode: institution.pincode,
      });
    }
  }, [institution]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution) return;
    await institutionService.updateInstitution(institution.id, formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Institution Profile"
        description="Review and update institutional registration credentials and administrative contact details."
        breadcrumbs={[
          { label: 'Institution Admin', href: '/institution' },
          { label: 'Profile' },
        ]}
      />

      {saved && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Institution profile updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <div className="flex items-center gap-4">
              <AppLogo size="lg" showText={false} linkToHome={false} />
              <div>
                <CardTitle className="text-lg text-[#481D1A]">{institution?.name}</CardTitle>
                <CardDescription className="text-xs font-mono">
                  Tenant Code: <strong>{institution?.code}</strong> (Immutable Identifier)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Official Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Primary Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Administrative Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Street Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">State / Province</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Postal Code</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6 gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Profile</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

