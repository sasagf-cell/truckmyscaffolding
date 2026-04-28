
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';
import { useSubcontractors } from '@/hooks/useSubcontractors.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InviteSubcontractorModal from '@/components/InviteSubcontractorModal.jsx';

const SubcontractorListPage = () => {
  const navigate = useNavigate();
  const { selectedProject } = useOutletContext() ?? {};
  const { listSubcontractors, loading } = useSubcontractors();
  
  const [subcontractors, setSubcontractors] = useState([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: 'all', role: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = async () => {
    if (!selectedProject) return;
    const data = await listSubcontractors(selectedProject.id, page, 10, filters);
    if (data) {
      setSubcontractors(data.items);
      setTotalPages(data.totalPages);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject, page, filters.status, filters.role]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="badge-active">Active</Badge>;
      case 'pending_invite': return <Badge className="badge-invited">Invited</Badge>;
      case 'inactive': return <Badge className="badge-inactive">Inactive</Badge>;
      case 'removed': return <Badge className="badge-removed">Removed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to view the team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Manage Site Team access and permissions for {selectedProject.name}</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={filters.role} onValueChange={(val) => setFilters(prev => ({ ...prev, role: val }))}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Worker">Worker</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Coordinator">Coordinator</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_invite">Invited</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && subcontractors.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                </TableRow>
              ))
            ) : subcontractors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No team members found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              subcontractors.map((sub) => (
                <TableRow 
                  key={sub.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigate(`/dashboard/team/${sub.id}`)}
                >
                  <TableCell className="font-medium">
                    {sub.expand?.userId?.full_name || <span className="text-muted-foreground italic">Pending Registration</span>}
                  </TableCell>
                  <TableCell>{sub.email}</TableCell>
                  <TableCell>{sub.role}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {sub.joinedAt ? format(new Date(sub.joinedAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/team/${sub.id}`); }}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-muted/10">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <InviteSubcontractorModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        projectId={selectedProject.id}
        onSuccess={loadData}
      />
    </div>
  );
};

export default SubcontractorListPage;
