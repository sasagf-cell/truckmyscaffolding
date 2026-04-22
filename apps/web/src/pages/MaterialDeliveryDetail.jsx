
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Trash2, Truck, Calendar, User, Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useMaterialDeliveries } from '@/hooks/useMaterialDeliveries.js';
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

const MaterialDeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchDeliveryById, fetchMaterialItems, deleteDelivery } = useMaterialDeliveries();
  
  const [delivery, setDelivery] = useState(null);
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      const data = await fetchDeliveryById(id);
      if (data) {
        setDelivery(data);
        const relatedItems = await fetchMaterialItems(id);
        setItems(relatedItems);
      }
      setIsFetching(false);
    };
    loadData();
  }, [id, fetchDeliveryById, fetchMaterialItems]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this delivery and all its items? This action cannot be undone.')) {
      const success = await deleteDelivery(id);
      if (success) {
        navigate('/dashboard/material-deliveries');
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-warning/20 text-warning',
      'In Transit': 'bg-blue-500/20 text-blue-600',
      'Delivered': 'bg-success/20 text-success',
      'Cancelled': 'bg-destructive/20 text-destructive'
    };

    return (
      <Badge variant="outline" className={`border-0 px-3 py-1 text-sm ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {status}
      </Badge>
    );
  };

  if (isFetching) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground">Delivery not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard/material-deliveries')} className="mt-4">
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/material-deliveries')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              Delivery: {delivery.lkw_id}
              {getStatusBadge(delivery.status)}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={() => navigate(`/dashboard/material-deliveries/${delivery.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Material Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Material Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No items recorded for this delivery.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.material_type}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                          <TableCell className="text-muted-foreground">{item.notes || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {delivery.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground bg-muted/30 p-4 rounded-md border">
                  {delivery.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LKW ID</p>
                  <p className="font-medium">{delivery.lkw_id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Date</p>
                  <p className="font-medium">{format(new Date(delivery.delivery_date), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver Name</p>
                  <p className="font-medium">{delivery.driver_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Driver Phone</p>
                  <p className="font-medium">{delivery.driver_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="print:hidden">
            <CardContent className="p-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Created: {format(new Date(delivery.created), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Updated: {format(new Date(delivery.updated), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialDeliveryDetail;
