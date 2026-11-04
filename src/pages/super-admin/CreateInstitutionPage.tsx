import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { institutionService } from '@/services/institution.service';
import { WhiteLabelBrandingForm } from '@/components/branding/WhiteLabelBrandingForm';
import { InstitutionBranding } from '@/types';
import { Building2, CheckCircle2 } from 'lucide-react';

export const CreateInstitutionPage: React.FC = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    adminName: '',
    adminUserId: 'ADMIN',
    adminEmail: '',
  });

  const [branding, setBranding] = useState<InstitutionBranding>({
    institutionName: '',
    tagline: 'Examination Platform',
    logoUrl: '/brand/navark-logo.svg',
    primaryColor: '#481D1A',
    secondaryColor: '#FFFBF5',
    loginHeading: '',
    loginSubheading: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.email) return;

    setLoading(true);
    await institutionService.createInstitution({
      name: formData.name,
      code: formData.code.toUpperCase(),
      slug: formData.slug || formData.code.toLowerCase(),
      logoUrl: branding.logoUrl || '/brand/navark-logo.svg',
      email: formData.email,
      phone: formData.phone || '+91 90000 00000',
      address: formData.address || 'Campus Road',
      city: formData.city || 'Tech City',
      state: formData.state || 'State',
      pincode: formData.pincode || '110001',
      status: 'ACTIVE',
      settings: {
        branding: {
          ...branding,
          institutionName: branding.institutionName || formData.name,
        },
      },
    });
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Provision New Tenant Institution"
        description="Configure a new dedicated institution namespace with custom code and initial admin account."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Institutions', href: '/super-admin/institutions' },
          { label: 'New Institution' },
        ]}
      />

      {success ? (
        <Card className="border-[#E7DCD3] bg-white text-center p-8 space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <CardTitle className="text-xl text-[#481D1A]">Institution Successfully Created!</CardTitle>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Tenant <strong>{formData.name}</strong> (Code: <span className="font-mono">{formData.code.toUpperCase()}</span>) is now active. Initial admin credentials have been generated for {formData.adminName || 'Admin'}.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              onClick={() => navigate('/super-admin/institutions')}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs"
            >
              Back to Institutions List
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Institution Information</CardTitle>
              <CardDescription className="text-xs">Primary institutional identifiers and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Institution Legal Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Skyline Academy of Sciences"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Tenant Code (Uppercase) *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SKYLINE"
                    className="font-mono uppercase"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Students and staff will use this code at login.</p>
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">URL Identifier (Slug)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    placeholder="e.g. skyline-academy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Official Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@skyline.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Phone Number</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Physical Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Campus Address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Postal Code</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E7DCD3] bg-white">
            <CardHeader>
              <CardTitle className="text-base text-[#481D1A]">Initial Administrator Account</CardTitle>
              <CardDescription className="text-xs">Primary institution administrator assigned to manage batches and staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Administrator Full Name</label>
                  <Input
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    placeholder="Dr. Anand Deshmukh"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">Assigned Admin User ID</label>
                  <Input
                    value={formData.adminUserId}
                    disabled
                    className="font-mono bg-muted/40"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Standardized root institution administrator ID</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dedicated White Label Branding Configuration Section with Live Preview */}
          <WhiteLabelBrandingForm
            branding={branding}
            onChange={setBranding}
            defaultInstitutionName={formData.name}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/super-admin/institutions')}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6"
            >
              {loading ? 'Creating...' : 'Provision Institution'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

