import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { institutionService } from '@/services/institution.service';
import { WhiteLabelBrandingForm } from '@/components/branding/WhiteLabelBrandingForm';
import { Institution, InstitutionBranding } from '@/types';
import { Building2, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

export const EditInstitutionBrandingPage: React.FC = () => {
  const { institutionId } = useParams<{ institutionId: string }>();
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      if (!institutionId) return;
      setLoading(true);
      const data = await institutionService.getInstitutionById(institutionId);
      if (data) {
        setInstitution(data);
        setFormData({
          name: data.name,
          code: data.code,
          slug: data.slug,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
        });

        const custom = data.settings?.branding || {};
        setBranding({
          institutionName: custom.institutionName || data.name,
          tagline: custom.tagline || 'Examination Platform',
          logoUrl: custom.logoUrl || data.logoUrl || '/brand/navark-logo.svg',
          faviconUrl: custom.faviconUrl || '',
          primaryColor: custom.primaryColor || '#481D1A',
          secondaryColor: custom.secondaryColor || '#FFFBF5',
          loginHeading: custom.loginHeading || `${data.name} Portal`,
          loginSubheading: custom.loginSubheading || 'Authorized candidate and faculty examination access',
        });
      }
      setLoading(false);
    };
    load();
  }, [institutionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId || !formData.name) return;

    setSaving(true);
    try {
      const updatedSettings = {
        ...(institution?.settings || {}),
        branding: {
          ...branding,
          institutionName: branding.institutionName || formData.name,
        },
      };

      await institutionService.updateInstitution(institutionId, {
        name: formData.name,
        code: formData.code.toUpperCase(),
        slug: formData.slug || formData.code.toLowerCase(),
        logoUrl: branding.logoUrl || institution?.logoUrl || '/brand/navark-logo.svg',
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        settings: updatedSettings,
      });

      setSuccess(true);
    } catch (err) {
      console.error('Failed to update institution branding:', err);
      alert('Failed to save branding changes. Please check console.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Loading institution branding settings...
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Institution not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit Branding & Details: ${institution.name}`}
        description={`Update logo, brand colors, login portal styling, and institutional identifiers for tenant ${institution.code}.`}
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Institutions', href: '/super-admin/institutions' },
          { label: institution.name, href: `/super-admin/institutions/${institution.id}` },
          { label: 'Edit Branding' },
        ]}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/super-admin/institutions/${institution.id}`)}
          className="text-xs gap-1.5 border-[#481D1A]/30 text-[#481D1A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Details</span>
        </Button>
      </PageHeader>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-bold">Branding & White Label Configuration Saved!</p>
              <p className="text-[11px] text-emerald-800">
                Changes have been persisted and will dynamically reflect across {formData.name}&apos;s login page and portal.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/super-admin/institutions/${institution.id}`)}
            className="bg-emerald-700 text-white hover:bg-emerald-800 text-xs"
          >
            Done
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Institution Details */}
        <Card className="border-[#E7DCD3] bg-white">
          <CardHeader>
            <CardTitle className="text-base text-[#481D1A]">Institutional Identifiers</CardTitle>
            <CardDescription className="text-xs">
              Primary organization name, tenant code, and official communication details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#481D1A] mb-1">Institution Legal Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Tenant Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono uppercase"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Official Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">Contact Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
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
                <label className="block font-semibold text-[#481D1A] mb-1">State</label>
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

        {/* White Label Branding Form Component */}
        <WhiteLabelBrandingForm
          branding={branding}
          onChange={setBranding}
          defaultInstitutionName={formData.name}
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/super-admin/institutions/${institution.id}`)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold px-6 gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Branding Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

