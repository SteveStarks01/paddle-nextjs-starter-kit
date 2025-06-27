'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Eye, Search, Filter, Building, Users, DollarSign } from 'lucide-react';
import { getSchoolApprovals, approveSchool, rejectSchool, suspendSchool } from '@/utils/super-admin/get-school-approvals';
import { SchoolApproval } from '@/lib/super-admin.types';
import { LoadingScreen } from '@/components/dashboard/layout/loading-screen';
import { ErrorContent } from '@/components/dashboard/layout/error-content';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';

export function SchoolApprovalsManagement() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<SchoolApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState<SchoolApproval | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApprovals();
  }, [statusFilter]);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const response = await getSchoolApprovals(statusFilter === 'all' ? undefined : statusFilter);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setApprovals(response.data);
      }
    } catch (err) {
      setError('Failed to load school approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    setActionLoading(true);
    try {
      const result = await approveSchool(approvalId);
      if (result.error) {
        toast({
          title: 'Approval failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'School approved',
          description: 'The school has been successfully approved and activated.',
        });
        loadApprovals();
      }
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectReason.trim()) return;

    setActionLoading(true);
    try {
      const result = await rejectSchool(selectedApproval.id, rejectReason);
      if (result.error) {
        toast({
          title: 'Rejection failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'School rejected',
          description: 'The school application has been rejected.',
        });
        setShowRejectDialog(false);
        setRejectReason('');
        setSelectedApproval(null);
        loadApprovals();
      }
    } catch (error) {
      toast({
        title: 'Rejection failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApprovals = approvals.filter(approval =>
    approval.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorContent />;

  return (
    <div className="grid gap-6">
      <Card className={'bg-background/50 backdrop-blur-[24px] border-border p-6'}>
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="flex justify-between items-center pb-6 border-border border-b">
            <div className="flex items-center gap-3">
              <span className={'text-xl font-medium'}>School Approvals</span>
              <Badge variant="secondary" className="text-xs">
                {approvals.length} total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className={'p-0 pt-6'}>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search schools by name, code, or admin email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredApprovals.length === 0 ? (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No schools found' : 'No school approvals'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'No schools match your search criteria.'
                  : 'All school applications have been processed.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((approval) => (
                <Card key={approval.id} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="grid md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <h3 className="font-semibold text-lg">{approval.name}</h3>
                          <p className="text-sm text-muted-foreground">{approval.code}</p>
                          <p className="text-sm text-muted-foreground">{approval.admin_email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Admin</p>
                          <p className="text-sm text-muted-foreground">{approval.admin_name}</p>
                          <p className="text-sm text-muted-foreground">{approval.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Metrics</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users size={12} />
                            {approval.student_count} students
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign size={12} />
                            ${approval.total_revenue.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Submitted</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(approval.submitted_at)}
                          </p>
                          {approval.reviewed_at && (
                            <p className="text-sm text-muted-foreground">
                              Reviewed: {formatDate(approval.reviewed_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          approval.status === 'approved' ? 'default' :
                          approval.status === 'pending' ? 'secondary' :
                          approval.status === 'rejected' ? 'destructive' : 'outline'
                        }>
                          {approval.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {approval.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleApprove(approval.id)}
                                disabled={actionLoading}
                              >
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedApproval(approval);
                                  setShowRejectDialog(true);
                                }}
                                disabled={actionLoading}
                              >
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {approval.rejection_reason && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
                        <p className="text-sm text-red-700 dark:text-red-300">{approval.rejection_reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject School Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedApproval?.name}'s application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectDialog(false)} 
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1"
              >
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}