
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, PackageSearch } from 'lucide-react';

const MaterialMasterDataPage = () => {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    item_name: '',
    unit_weight_kg: '',
    unit: 'Stk'
  });

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const records = await pb.collection('material_master_data').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setMaterials(records);
    } catch (error) {
      toast.error('Failed to load material master data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleOpenModal = (material = null) => {
    if (material) {
      setFormData({
        item_name: material.item_name,
        unit_weight_kg: material.unit_weight_kg,
        unit: material.unit
      });
      setEditingId(material.id);
    } else {
      setFormData({ item_name: '', unit_weight_kg: '', unit: 'Stk' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        item_name: formData.item_name,
        unit_weight_kg: parseFloat(formData.unit_weight_kg),
        unit: formData.unit
      };

      if (editingId) {
        await pb.collection('material_master_data').update(editingId, data, { $autoCancel: false });
        toast.success('Material updated successfully');
      } else {
        await pb.collection('material_master_data').create(data, { $autoCancel: false });
        toast.success('Material created successfully');
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (error) {
      toast.error(error.message || 'Failed to save material');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    try {
      await pb.collection('material_master_data').delete(id, { $autoCancel: false });
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Material Master Data</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Material Master Data</h1>
          <p className="text-muted-foreground">Manage your scaffolding components and weights.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Material
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Unit Weight (kg)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <PackageSearch className="w-8 h-8 text-muted-foreground/50" />
                      <p>No materials found. Add your first material component.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.unit_weight_kg} kg</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Material' : 'Add Material'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name</Label>
              <Input id="item_name" value={formData.item_name} onChange={(e) => setFormData({...formData, item_name: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_weight_kg">Unit Weight (kg)</Label>
                <Input id="unit_weight_kg" type="number" step="0.01" value={formData.unit_weight_kg} onChange={(e) => setFormData({...formData, unit_weight_kg: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} required placeholder="e.g. Stk, m, m2" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Material</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialMasterDataPage;
