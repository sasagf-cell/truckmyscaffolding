
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Printer, PackageSearch } from 'lucide-react';
import { useMaterialDeliveries } from '@/hooks/useMaterialDeliveries.js';
import { exportInventoryToCSV } from '@/lib/exportInventoryToCSV.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

const InventoryView = ({ projectId }) => {
  const { fetchInventorySummary, loading } = useMaterialDeliveries();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (projectId) {
        const data = await fetchInventorySummary(projectId);
        setInventory(data);
      }
    };
    loadData();
  }, [projectId, fetchInventorySummary]);

  const handleExport = () => {
    exportInventoryToCSV(inventory);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-primary" />
            Current Inventory
          </CardTitle>
          <CardDescription>Cumulative summary of all delivered materials.</CardDescription>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handleExport} disabled={loading || inventory.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => window.print()} disabled={loading || inventory.length === 0}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Type</TableHead>
                <TableHead className="text-right">Total Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Last Delivery Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No delivered materials found in inventory.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.materialType}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{item.totalQuantity}</TableCell>
                    <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                    <TableCell>
                      {item.lastDeliveryDate ? format(new Date(item.lastDeliveryDate), 'MMM dd, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        In Stock
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryView;
