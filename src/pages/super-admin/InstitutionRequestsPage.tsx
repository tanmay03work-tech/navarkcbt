import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { institutionService } from '@/services/institution.service';
import { InstitutionRequest } from '@/types';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Building, Mail, Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const InstitutionRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<InstitutionRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<InstitutionRequest | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

  const loadRequests = async () => {
    const data = await institutionService.getInstitutionRequests();
    setRequests(data);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleConfirmAction = async () => {
    if (!selectedReq || !actionType) return;
    await institutionService.reviewRequest(
      selectedReq.id,
      actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
      internalNote
    );
    setSelectedReq(null);
    setActionType(null);
    setInternalNote('');
    loadRequests();
  };

  const renderTable = (list: InstitutionRequest[]) => {
    if (list.length === 0) {
      return (
        <div className="py-12 text-center text-xs text-muted-foreground">
          No requests in this category.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-[#E7DCD3]">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#FFFBF5] text-muted-foreground border-b border-[#E7DCD3]">
            <tr>
              <th className="py-3 px-4 font-semibold">Institution Name</th>
              <th className="py-3 px-4 font-semibold">Proposed Code</th>
              <th className="py-3 px-4 font-semibold">Contact Person</th>
              <th className="py-3 px-4 font-semibold">Est. Students</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Requested At</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7DCD3]/60 bg-white">
            {list.map((req) => (
              <tr key={req.id} className="hover:bg-muted/20">
                <td className="py-3 px-4">
                  <div className="font-bold text-[#481D1A]">{req.institutionName}</div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-xs">{req.notes}</div>
                </td>
                <td className="py-3 px-4 font-mono font-bold">{req.proposedCode}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-foreground">{req.contactPerson}</div>
                  <div className="text-[11px] text-muted-foreground">{req.email} • {req.phone}</div>
                </td>
                <td className="py-3 px-4 font-semibold">{req.studentEstimate}</td>
                <td className="py-3 px-4"><StatusBadge status={req.status} /></td>
                <td className="py-3 px-4 text-muted-foreground">{formatDate(req.requestedAt)}</td>
                <td className="py-3 px-4 text-right">
                  {req.status === 'PENDING' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('REJECT');
                        }}
                        className="h-7 text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReq(req);
                          setActionType('APPROVE');
                        }}
                        className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white"
                      >
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Onboarding Requests"
        description="Review inbound registration applications from educational institutions and provision tenant workspaces."
        breadcrumbs={[
          { label: 'Platform Admin', href: '/super-admin' },
          { label: 'Onboarding Requests' },
        ]}
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-white border border-[#E7DCD3]">
          <TabsTrigger value="pending" className="text-xs">
            Pending ({requests.filter(r => r.status === 'PENDING').length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs">
            Approved ({requests.filter(r => r.status === 'APPROVED').length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs">
            Rejected ({requests.filter(r => r.status === 'REJECTED').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-4">
              {renderTable(requests.filter(r => r.status === 'PENDING'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-4">
              {renderTable(requests.filter(r => r.status === 'APPROVED'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="border-[#E7DCD3] bg-white">
            <CardContent className="p-4">
              {renderTable(requests.filter(r => r.status === 'REJECTED'))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="bg-white border-[#E7DCD3]">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'APPROVE' ? 'Approve Institution Application' : 'Reject Institution Application'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === 'APPROVE'
                ? `Approving this request will provision tenant "${selectedReq?.institutionName}" with Code "${selectedReq?.proposedCode}" and initialize primary admin access.`
                : `Are you sure you wish to reject the onboarding application from "${selectedReq?.institutionName}"?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <label className="block font-semibold text-[#481D1A] mb-1">Internal Review Notes</label>
              <textarea
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add audit justification or onboarding instructions..."
                className="w-full rounded-md border border-input p-2 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedReq(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmAction}
              className={`text-xs text-white ${
                actionType === 'APPROVE' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              Confirm {actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

