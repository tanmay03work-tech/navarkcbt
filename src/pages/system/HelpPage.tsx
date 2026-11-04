import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HelpCircle, Search, Mail, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: '', message: '' });

  const faqs = [
    {
      q: 'How does the test timer function during interruptions?',
      a: 'The countdown runs against official server timestamps. In the event of terminal power loss or local network restart, refreshing the browser safely restores the candidate to their active question state with accurate remaining time.',
    },
    {
      q: 'What is the consequence of selecting "Mark for Review"?',
      a: 'Questions marked for review are visually highlighted in purple on the palette so you can re-evaluate them. If an answer was also selected, it WILL be evaluated and graded according to standard test rules.',
    },
    {
      q: 'How is negative marking calculated?',
      a: 'On single choice questions with negative marking, incorrect selections deduct the assigned penalty marks (typically -1). Questions left unattempted result in 0 marks without penalty.',
    },
    {
      q: 'Who should I contact if my User ID is locked or password fails?',
      a: 'Contact your campus examination cell or college IT administrator. Because user accounts are institution-scoped, local administrators can instantly reset student credentials.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.message) return;
    setTicketSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Help Center & Candidate Support"
        description="Documentation, common technical questions, and support ticket submissions."
        breadcrumbs={[
          { label: 'Portal', href: '/' },
          { label: 'Help' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FAQs */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#481D1A]">Frequently Asked Questions</h3>
          {faqs.map((f, i) => (
            <Card key={i} className="border-[#E7DCD3] bg-white">
              <CardContent className="p-4 space-y-1.5 text-xs">
                <h4 className="font-bold text-[#481D1A]">{f.q}</h4>
                <p className="text-muted-foreground leading-relaxed">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Request Form */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#481D1A]">Submit Support Request</h3>
          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-5">
              {ticketSubmitted ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Support Ticket Created</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your request regarding "{ticketData.subject}" has been submitted to platform operations.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTicketSubmitted(false);
                      setTicketData({ subject: '', message: '' });
                    }}
                    className="text-xs"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#481D1A] mb-1">Subject *</label>
                    <Input
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                      placeholder="e.g. Question diagram rendering issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#481D1A] mb-1">Detailed Description *</label>
                    <textarea
                      rows={5}
                      value={ticketData.message}
                      onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                      placeholder="Provide specific details, question numbers, or browser behavior observed..."
                      className="w-full rounded-md border border-input p-2.5 text-xs focus:ring-1 focus:ring-[#481D1A]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#481D1A] text-white hover:bg-[#351412] text-xs font-semibold py-2"
                  >
                    Submit Support Ticket
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

