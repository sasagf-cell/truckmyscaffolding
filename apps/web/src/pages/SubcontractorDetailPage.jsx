
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Shield, Mail, Calendar, Clock, UserX, UserCheck, Trash2, Edit } from 'lucide-react';
import { useSubcontractors } from '@/hooks/useSubcontractors.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const SubcontractorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getSubcontractor, deactivateSubcontractor, removeSubcontractor, loading } = useSubcontractors();
  
  const [subcontractor, setSubcontractor] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  const loadData = async () => {
    setIsFetching(true);
    const data = await getSubcontractor(id);
    if (data) {
      setSubcontractor(data);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (window.confirm(`Are you sure you want to ${subcontractor.status === 'active' ? 'deactivate' : 'reactivate'} this user?`)) {
      const success = await deactivateSubcontractor(id, subcontractor.status);
      if (success) loadData();
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Are you sure you want to remove this user from the project? This action cannot be undone.')) {
      const success = await removeSubcontractor(id);
      if (success) navigate('/dashboard/team');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="badge-active">Active</Badge>;
      case 'pending_invite': return <Badge className="badge-invited">Invited</Badge>;
      case 'inactive': return <Badge className="badge-inactive">Inactive</Badge>;
      case 'removed': return <Badge className="badge-removed">Removed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!subcontractor) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground">Team member not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard/team')} className="mt-4">
          Return to list
        </Button>
      </div>
    );
  }

  const user = subcontractor.expand?.userId;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/team')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              {user?.full_name || 'Pending Registration'}
              {getStatusBadge(subcontractor.status)}
            </h1>
            <p className="text-muted-foreground">{subcontractor.role}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => alert('Edit functionality coming soon')}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Role
          </Button>
          {subcontractor.status !== 'removed' && (
            <>
              <Button 
                variant="outline" 
                className={subcontractor.status === 'active' ? 'text-warning border-warning/50 hover:bg-warning/10' : 'text-success border-success/50 hover:bg-success/10'}
                onClick={handleToggleStatus}
                disabled={subcontractor.status === 'pending_invite'}
              >
                {subcontractor.status === 'active' ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                {subcontractor.status === 'active' ? 'Deactivate' : 'Reactivate'}
              </Button>
              <Button variant="destructive" onClick={handleRemove}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{subcontractor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{subcontractor.role}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Joined: {subcontractor.joinedAt ? format(new Date(subcontractor.joinedAt), 'MMM dd, yyyy') : 'Pending'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Last Login: {subcontractor.lastLogin ? format(new Date(subcontractor.lastLogin), 'MMM dd, yyyy HH:mm') : 'Never'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Permissions & Activity */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Permissions</CardTitle>
              <CardDescription>Features this user can access within the project.</CardDescription>
            </CardHeader>
            <CardContent>
              {subcontractor.permissions && subcontractor.permissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subcontractor.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-muted/40 p-2 rounded-md border">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm capitalize">{perm.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific permissions assigned.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {/* Mock Activity Log based on timestamps */}
                {subcontractor.updated && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-background bg-primary shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border bg-card shadow-sm">
                      <div className="font-medium text-sm">Profile Updated</div>
                      <div className="text-xs text-muted-foreground mt-1">{format(new Date(subcontractor.updated), 'MMM dd, yyyy HH:mm')}</div>
                    </div>
                  </div>
                )}
                {subcontractor.joinedAt && (
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-background bg-success shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10" />
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border bg-card shadow-sm">
                      <div className="font-medium text-sm">Joined Project</div>
                      <div className="text-xs text-muted-foreground mt-1">{format(new Date(subcontractor.joinedAt), 'MMM dd, yyyy HH:mm')}</div>
                    </div>
                  </div>
                )}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-background bg-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10" />
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border bg-card shadow-sm">
                    <div className="font-medium text-sm">Invitation Sent</div>
                    <div className="text-xs text-muted-foreground mt-1">{format(new Date(subcontractor.created), 'MMM dd, yyyy HH:mm')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubcontractorDetailPage;
