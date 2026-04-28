
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, XCircle, AlertCircle, Clock, User, Plus, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useScaffoldRequests } from '@/hooks/useScaffoldRequests.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ApprovalModal from '@/components/ApprovalModal.jsx';
import RejectionModal from '@/components/RejectionModal.jsx';
import ChangesRequestedModal from '@/components/ChangesRequestedModal.jsx';

const ScaffoldRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchRequestById, updateRequestStatus, loading } = useScaffoldRequests();
  
  const [request, setRequest] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  
  // Modal states
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  const loadData = async () => {
    setIsFetching(true);
    const data = await fetchRequestById(id);
    if (data) {
      setRequest(data);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async () => {
    const success = await updateRequestStatus(id, 'approved');
    if (success) {
      setShowApprove(false);
      loadData();
    }
  };

  const handleReject = async (reason) => {
    const success = await updateRequestStatus(id, 'rejected', { rejectionReason: reason });
    if (success) {
      setShowReject(false);
      loadData();
    }
  };

  const handleRequestChanges = async (comments) => {
    const success = await updateRequestStatus(id, 'on_hold', { approverComments: comments });
    if (success) {
      setShowChanges(false);
      loadData();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      pending: 'bg-warning/20 text-warning',
      approved: 'bg-success/20 text-success',
      on_hold: 'bg-orange-500/20 text-orange-600',
      rejected: 'bg-destructive/20 text-destructive',
      completed: 'bg-secondary/20 text-secondary'
    };
    
    const labels = {
      draft: 'Draft',
      pending: 'Pending Review',
      approved: 'Active',
      on_hold: 'Changes Requested',
      rejected: 'Rejected',
      completed: 'Completed'
    };

    return (
      <Badge variant="outline" className={`border-0 px-3 py-1 text-sm ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground">Request not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard/scaffold-requests')} className="mt-4">
          Return to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/scaffold-requests')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              Request #{request.id.substring(0, 8)}
              {getStatusBadge(request.status)}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          
          {(request.status === 'draft' || request.status === 'on_hold') && (
            <Button variant="outline" onClick={() => navigate(`/dashboard/scaffold-requests/${request.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Request
            </Button>
          )}
          
          {request.status === 'pending' && (
            <>
              <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setShowChanges(true)}>
                Request Changes
              </Button>
              <Button variant="destructive" onClick={() => setShowReject(true)}>
                Reject
              </Button>
              <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setShowApprove(true)}>
                Approve
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                  <p className="font-medium">{request.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">{request.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Requested Date</p>
                  <p className="font-medium">{format(new Date(request.requestedDate), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Duration</p>
                  <p className="font-medium">{request.estimatedDuration} Days</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">
                  {request.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worker Hours & Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Worker Code / Role</TableHead>
                      <TableHead className="text-right">Hours</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {request.workerHours && request.workerHours.map((worker, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{worker.name}</TableCell>
                        <TableCell className="text-right">{worker.hours}</TableCell>
                        <TableCell className="text-right">€{worker.rate}</TableCell>
                        <TableCell className="text-right">€{worker.subtotal?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span className="text-primary">€{request.totalCost?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                
                {/* Created Step */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm">Request Created</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(request.created), 'MMM dd, yyyy HH:mm')}
                    </div>
                    <div className="text-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {request.expand?.createdBy?.full_name || 'Unknown User'}
                    </div>
                  </div>
                </div>

                {/* Rejection / Changes Step */}
                {(request.rejectionReason || request.approverComments) && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10 ${request.status === 'rejected' ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}`}>
                      {request.status === 'rejected' ? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-sm">
                          {request.status === 'rejected' ? 'Rejected' : 'Changes Requested'}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(request.updated), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-sm bg-muted/50 p-2 rounded border mt-2">
                        {request.rejectionReason || request.approverComments}
                      </div>
                    </div>
                  </div>
                )}

                {/* Approved Step */}
                {request.status === 'approved' && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-success text-success-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border bg-card shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-sm">Approved</div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(request.updated), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ApprovalModal 
        isOpen={showApprove} 
        onClose={() => setShowApprove(false)} 
        onConfirm={handleApprove}
        loading={loading}
      />
      <RejectionModal 
        isOpen={showReject} 
        onClose={() => setShowReject(false)} 
        onConfirm={handleReject}
        loading={loading}
      />
      <ChangesRequestedModal 
        isOpen={showChanges} 
        onClose={() => setShowChanges(false)} 
        onConfirm={handleRequestChanges}
        loading={loading}
      />
    </div>
  );
};

export default ScaffoldRequestDetail;
