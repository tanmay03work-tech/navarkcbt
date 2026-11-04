import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Send, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required.';
    if (!formData.institution.trim()) errs.institution = 'Institution name is required.';
    if (!formData.subject.trim()) errs.subject = 'Subject is required.';
    if (!formData.message.trim() || formData.message.length < 10) errs.message = 'Message must be at least 10 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-[#481D1A]">
            Contact Platform Support
          </h1>
          <p className="text-sm text-muted-foreground">
            Have questions regarding institution onboarding, technical integration, or test scheduling? Send our team a message.
          </p>
        </div>

        <Card className="border-[#E7DCD3] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Inquiry Form</CardTitle>
            <CardDescription className="text-xs">
              Complete the fields below and our platform support team will respond promptly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">Inquiry Received</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Thank you, <span className="font-semibold">{formData.name}</span>. Your inquiry regarding{' '}
                  <span className="font-semibold">{formData.institution}</span> has been logged. Our administrative team will reach out via {formData.email}.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', institution: '', subject: '', message: '' });
                  }}
                  className="mt-2 text-xs"
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Full Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Kumar"
                    className={errors.name ? 'border-rose-500' : ''}
                  />
                  {errors.name && <p className="text-rose-600 text-[11px] mt-0.5">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#481D1A] mb-1">
                      Official Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admin@college.edu"
                      className={errors.email ? 'border-rose-500' : ''}
                    />
                    {errors.email && <p className="text-rose-600 text-[11px] mt-0.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#481D1A] mb-1">
                      Institution Name *
                    </label>
                    <Input
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="Apex Junior College"
                      className={errors.institution ? 'border-rose-500' : ''}
                    />
                    {errors.institution && <p className="text-rose-600 text-[11px] mt-0.5">{errors.institution}</p>}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Subject *
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Inquiry regarding batch concurrency limits"
                    className={errors.subject ? 'border-rose-500' : ''}
                  />
                  {errors.subject && <p className="text-rose-600 text-[11px] mt-0.5">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-[#481D1A] mb-1">
                    Message Details *
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please specify your testing requirements, approximate student strength, or question format questions..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  {errors.message && <p className="text-rose-600 text-[11px] mt-0.5">{errors.message}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#481D1A] text-white hover:bg-[#351412] font-semibold py-2"
                >
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Submit Inquiry
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

