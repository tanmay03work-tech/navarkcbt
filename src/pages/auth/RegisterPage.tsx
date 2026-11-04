import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/branding/AppLogo';
import { Building, Mail, Phone, User, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { institutionService } from '@/services/institution.service';

export const RegisterPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    proposedCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    studentEstimate: 500,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.institutionName.trim()) errs.institutionName = 'Institution name is required.';
    if (!formData.proposedCode.trim() || formData.proposedCode.length < 3) errs.proposedCode = 'Code must be at least 3 uppercase characters.';
    if (!formData.contactPerson.trim()) errs.contactPerson = 'Contact administrator name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid official email is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await institutionService.submitInstitutionRequest({
      institutionName: formData.institutionName,
      proposedCode: formData.proposedCode.toUpperCase(),
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address || 'Address provided on file',
      studentEstimate: Number(formData.studentEstimate) || 500,
      notes: formData.notes,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <Card className="border-[#E7DCD3] bg-white shadow-lg">
      <CardHeader className="space-y-1 text-center pb-4">
        <div className="flex justify-center mb-2">
          <AppLogo size="lg" showText={false} linkToHome={false} />
        </div>
        <CardTitle className="text-2xl font-bold text-[#481D1A]">
          Institution Registration
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Request a dedicated tenant workspace and institution code for your school, college, or testing academy.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-900">
              Registration Request Pending Review
            </h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your request for <span className="font-bold">{formData.institutionName}</span> (Code:{' '}
              <span className="font-mono font-bold">{formData.proposedCode.toUpperCase()}</span>) has been submitted for platform verification.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Once verified by Platform Super Admins, your initial Institution Administrator credentials will be dispatched to {formData.email}.
            </p>
            <div className="pt-2">
              <Link to="/login">
                <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                All institution requests undergo administrative compliance review. Public self-assignment of Super Admin privileges is strictly prohibited.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Institution Legal / Operating Name *
              </label>
              <div className="relative">
                <Building className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  placeholder="e.g. Apex Institute of Science"
                  className={`pl-9 ${errors.institutionName ? 'border-rose-500' : ''}`}
                />
              </div>
              {errors.institutionName && <p className="text-rose-600 text-[10px] mt-0.5">{errors.institutionName}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Proposed Institution Code *
                </label>
                <Input
                  value={formData.proposedCode}
                  onChange={(e) => setFormData({ ...formData, proposedCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. APEX"
                  className={`font-mono uppercase ${errors.proposedCode ? 'border-rose-500' : ''}`}
                />
                {errors.proposedCode && <p className="text-rose-600 text-[10px] mt-0.5">{errors.proposedCode}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Estimated Candidates
                </label>
                <Input
                  type="number"
                  value={formData.studentEstimate}
                  onChange={(e) => setFormData({ ...formData, studentEstimate: Number(e.target.value) })}
                  placeholder="500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Contact Person *
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Dr. Rajesh Kumar"
                    className={`pl-9 ${errors.contactPerson ? 'border-rose-500' : ''}`}
                  />
                </div>
                {errors.contactPerson && <p className="text-rose-600 text-[10px] mt-0.5">{errors.contactPerson}</p>}
              </div>

              <div>
                <label className="block font-semibold text-[#481D1A] mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className={`pl-9 ${errors.phone ? 'border-rose-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-rose-600 text-[10px] mt-0.5">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Official Institutional Email *
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="dean.examinations@apex.edu"
                  className={`pl-9 ${errors.email ? 'border-rose-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-rose-600 text-[10px] mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">
                Brief Requirements / Notes
              </label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Need CBT mock test software for 12th standard science batches"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#481D1A] text-white hover:bg-[#351412] font-semibold py-2 mt-2"
            >
              {loading ? 'Submitting Application...' : 'Submit Request for Approval'}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="pt-0 text-center flex justify-center">
        <Link to="/login" className="text-[11px] font-semibold text-[#481D1A] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          <span>Already registered? Sign in with Institution Code</span>
        </Link>
      </CardFooter>
    </Card>
  );
};

