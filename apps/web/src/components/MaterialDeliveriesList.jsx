
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useMaterialDeliveries } from '@/hooks/useMaterialDeliveries.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

const MaterialDeliveriesList = ({ projectId }) => {
  const navigate = useNavigate();
  const { fetchDeliveries, fetchMaterialItems, deleteDelivery, loading } = useMaterialDeliveries();
  
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryItems, setDeliveryItems] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lkwFilter, setLkwFilter] = useState('all');

  const loadData = async () => {
    if (!projectId) return;

    // pb.filter() safely escapes all values — prevents PocketBase filter injection
    const filterParts = [pb.filter('project_id = {:pid}', { pid: projectId })];
    if (statusFilter !== 'all') {
      filterParts.push(pb.filter('status = {:s}', { s: statusFilter }));
    }
    if (lkwFilter !== 'all') {
      filterParts.push(pb.filter('lkw_id = {:lkw}', { lkw: lkwFilter }));
    }
    if (searchTerm) {
      filterParts.push(pb.filter('(lkw_id ~ {:q} || driver_name ~ {:q})', { q: searchTerm }));
    }
    const filterStr = filterParts.join(' && ');

    const result = await fetchDeliveries(currentPage, 10, filterStr);
    if (result) {
      setDeliveries(result.items);
      setTotalPages(result.totalPages);
      
      // Fetch items for each delivery to show summary
      const itemsMap = {};
      await Promise.all(result.items.map(async (delivery) => {
        const items = await fetchMaterialItems(delivery.id);
        itemsMap[delivery.id] = items;
      }));
      setDeliveryItems(itemsMap);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, currentPage, statusFilter, lkwFilter, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery and all its items?')) {
      const success = await deleteDelivery(id);
      if (success) {
        loadData();
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-warning/20 text-warning hover:bg-warning/30',
      'In Transit': 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30',
      'Delivered': 'bg-success/20 text-success hover:bg-success/30',
      'Cancelled': 'bg-destructive/20 text-destructive hover:bg-destructive/30'
    };

    return (
      <Badge variant="outline" className={`border-0 ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </Badge>
    );
  };

  const getDeliverySummary = (deliveryId) => {
    const items = deliveryItems[deliveryId];
    if (!items || items.length === 0) return { types: 'No items', quantity: 0 };
    
    const types = Array.from(new Set(items.map(i => i.material_type))).join(', ');
    const quantity = items.reduce((sum, i) => sum + i.quantity, 0);
    
    return { 
      types: types.length > 30 ? types.substring(0, 30) + '...' : types, 
      quantity 
    };
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search LKW ID or Driver..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={lkwFilter} onValueChange={setLkwFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="LKW ID" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All LKWs</SelectItem>
                <SelectItem value="LKW 01">LKW 01</SelectItem>
                <SelectItem value="LKW 02">LKW 02</SelectItem>
                <SelectItem value="LKW 03">LKW 03</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LKW ID</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Material Types</TableHead>
                <TableHead className="text-right">Total Qty</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                  </TableRow>
                ))
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No material deliveries found.
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => {
                  const summary = getDeliverySummary(delivery.id);
                  return (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.lkw_id}</TableCell>
                      <TableCell>{format(new Date(delivery.delivery_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-muted-foreground" title={summary.types}>
                        {summary.types}
                      </TableCell>
                      <TableCell className="text-right font-medium">{summary.quantity}</TableCell>
                      <TableCell>{delivery.driver_name}</TableCell>
                      <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/material-deliveries/${delivery.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/material-deliveries/${delivery.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(delivery.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
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
  );
};

export default MaterialDeliveriesList;
