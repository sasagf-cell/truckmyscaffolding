
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, MoreHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';
import { useScaffoldRequests } from '@/hooks/useScaffoldRequests.js';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const STATUS_OPTIONS = [
  { id: 'draft', label: 'Draft' },
  { id: 'pending', label: 'Pending Review' },
  { id: 'approved', label: 'Active' },
  { id: 'on_hold', label: 'Changes Requested' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'completed', label: 'Completed' }
];

const ScaffoldRequestsList = () => {
  const { selectedProject } = useOutletContext() ?? {};
  const navigate = useNavigate();
  const { fetchRequests, loading } = useScaffoldRequests();
  
  const [requests, setRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [contractors, setContractors] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    statuses: [],
    contractor: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch contractors for the filter dropdown
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const users = await pb.collection('users').getFullList({
          filter: 'role="Subcontractor"',
          $autoCancel: false
        });
        setContractors(users);
      } catch (err) {
        console.error('Failed to fetch contractors', err);
      }
    };
    fetchContractors();
  }, []);

  const loadData = async () => {
    if (!selectedProject) return;

    let filterParts = [`projectId = "${selectedProject.id}"`];
    
    if (filters.statuses.length > 0) {
      const statusQuery = filters.statuses.map(s => `status="${s}"`).join(' || ');
      filterParts.push(`(${statusQuery})`);
    }

    if (filters.contractor !== 'all') {
      filterParts.push(`createdBy="${filters.contractor}"`);
    }

    if (filters.dateFrom) {
      filterParts.push(`requestedDate >= "${filters.dateFrom} 00:00:00"`);
    }

    if (filters.dateTo) {
      filterParts.push(`requestedDate <= "${filters.dateTo} 23:59:59"`);
    }

    if (filters.search) {
      filterParts.push(`(id ~ "${filters.search}" || location ~ "${filters.search}")`);
    }

    const filterStr = filterParts.join(' && ');

    const result = await fetchRequests(currentPage, 10, filterStr);
    if (result) {
      setRequests(result.items);
      setTotalPages(result.totalPages);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject, currentPage, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleStatus = (statusId) => {
    setFilters(prev => {
      const newStatuses = prev.statuses.includes(statusId)
        ? prev.statuses.filter(s => s !== statusId)
        : [...prev.statuses, statusId];
      return { ...prev, statuses: newStatuses };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      statuses: [],
      contractor: 'all',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-muted text-muted-foreground',
      pending: 'bg-warning/20 text-warning hover:bg-warning/30',
      approved: 'bg-success/20 text-success hover:bg-success/30',
      on_hold: 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30',
      rejected: 'bg-destructive/20 text-destructive hover:bg-destructive/30',
      completed: 'bg-secondary/20 text-secondary hover:bg-secondary/30'
    };
    
    const labels = {
      draft: 'Draft',
      pending: 'Pending Review',
      approved: 'Active',
      on_hold: 'Changes Req.',
      rejected: 'Rejected',
      completed: 'Completed'
    };

    return (
      <Badge variant="outline" className={`border-0 ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  const activeFilterCount = filters.statuses.length + 
    (filters.contractor !== 'all' ? 1 : 0) + 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0);

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to view requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scaffold Requests</h1>
          <p className="text-muted-foreground">Manage and track scaffolding requests for {selectedProject.name}</p>
        </div>
        <Button onClick={() => navigate('/dashboard/scaffold-requests/new')} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ID or location..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                          Clear all
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map(status => (
                          <div key={status.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`status-${status.id}`} 
                              checked={filters.statuses.includes(status.id)}
                              onCheckedChange={() => toggleStatus(status.id)}
                            />
                            <Label htmlFor={`status-${status.id}`} className="text-sm font-normal cursor-pointer">
                              {status.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Contractor</Label>
                      <Select 
                        value={filters.contractor} 
                        onValueChange={(val) => handleFilterChange('contractor', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select contractor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Contractors</SelectItem>
                          {contractors.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.full_name || c.email}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date Range</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">From</span>
                          <Input 
                            type="date" 
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs text-muted-foreground">To</span>
                          <Input 
                            type="date" 
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Active Filter Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.statuses.map(s => (
                <Badge key={s} variant="secondary" className="flex items-center gap-1">
                  Status: {STATUS_OPTIONS.find(opt => opt.id === s)?.label}
                  <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => toggleStatus(s)} />
                </Badge>
              ))}
              {filters.contractor !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Contractor: {contractors.find(c => c.id === filters.contractor)?.full_name || 'Selected'}
                  <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleFilterChange('contractor', 'all')} />
                </Badge>
              )}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {filters.dateFrom || 'Any'} to {filters.dateTo || 'Any'}
                  <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => { handleFilterChange('dateFrom', ''); handleFilterChange('dateTo', ''); }} />
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No requests found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id.substring(0, 8)}</TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={request.location}>
                        {request.location}
                      </TableCell>
                      <TableCell>{request.expand?.createdBy?.full_name || 'Unknown'}</TableCell>
                      <TableCell>{format(new Date(request.requestedDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/scaffold-requests/${request.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/scaffold-requests/${request.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScaffoldRequestsList;
