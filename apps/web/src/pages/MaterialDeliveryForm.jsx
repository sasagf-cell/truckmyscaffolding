
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useMaterialDeliveries } from '@/hooks/useMaterialDeliveries.js';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';

const MATERIAL_TYPES = [
  { name: 'Scaffolding Tubes', defaultUnit: 'm', weightPerUnit: 4.5 }, // kg per meter
  { name: 'Couplers', defaultUnit: 'pcs', weightPerUnit: 1.2 }, // kg per piece
  { name: 'Platforms', defaultUnit: 'pcs', weightPerUnit: 18.5 },
  { name: 'Guardrails', defaultUnit: 'm', weightPerUnit: 3.2 },
  { name: 'Stairs', defaultUnit: 'pcs', weightPerUnit: 25.0 },
  { name: 'Brackets', defaultUnit: 'pcs', weightPerUnit: 4.0 },
  { name: 'Fasteners', defaultUnit: 'kg', weightPerUnit: 1.0 },
  { name: 'Protective Netting', defaultUnit: 'm²', weightPerUnit: 0.15 },
  { name: 'Ladders', defaultUnit: 'pcs', weightPerUnit: 12.0 },
  { name: 'Other', defaultUnit: 'pcs', weightPerUnit: 0 }
];

const MaterialDeliveryForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectedProject } = useOutletContext() ?? {};
  const { createDelivery, createMaterialItems, fetchDeliveryById, fetchMaterialItems, updateDelivery, loading } = useMaterialDeliveries();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    lkw_id: '',
    delivery_date: format(new Date(), 'yyyy-MM-dd'),
    driver_name: '',
    driver_phone: '',
    status: 'Pending',
    notes: ''
  });

  const [items, setItems] = useState([
    { id: Date.now(), material_type: '', quantity: '', unit: 'pcs', weight: 0, notes: '' }
  ]);

  // Auto-increment LKW ID logic
  useEffect(() => {
    const generateLkwId = async () => {
      if (isEditMode || !selectedProject) return;
      try {
        const existing = await pb.collection('material_deliveries').getFullList({
          filter: pb.filter('project_id = {:pid}', { pid: selectedProject.id }),
          sort: '-created',
          $autoCancel: false
        });
        
        if (existing.length === 0) {
          setFormData(prev => ({ ...prev, lkw_id: 'LKW 01' }));
          return;
        }

        // Extract numbers from "LKW XX" format
        const numbers = existing
          .map(d => {
            const match = d.lkw_id?.match(/LKW\s+(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(n => !isNaN(n));

        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        const nextId = `LKW ${(maxNum + 1).toString().padStart(2, '0')}`;
        
        setFormData(prev => ({ ...prev, lkw_id: nextId }));
      } catch (error) {
        console.error("Failed to generate LKW ID", error);
        setFormData(prev => ({ ...prev, lkw_id: 'LKW 01' }));
      }
    };

    generateLkwId();
  }, [isEditMode, selectedProject]);

  useEffect(() => {
    if (isEditMode) {
      const loadData = async () => {
        const delivery = await fetchDeliveryById(id);
        if (delivery) {
          setFormData({
            lkw_id: delivery.lkw_id,
            delivery_date: delivery.delivery_date.split('T')[0],
            driver_name: delivery.driver_name,
            driver_phone: delivery.driver_phone,
            status: delivery.status,
            notes: delivery.notes || ''
          });
          
          const existingItems = await fetchMaterialItems(id);
          if (existingItems && existingItems.length > 0) {
            setItems(existingItems.map(item => ({
              ...item,
              id: item.id || Date.now() + Math.random(),
              weight: calculateWeight(item.material_type, item.quantity, item.unit)
            })));
          }
        }
      };
      loadData();
    }
  }, [id, isEditMode, fetchDeliveryById, fetchMaterialItems]);

  const calculateWeight = (type, qty, unit) => {
    const materialDef = MATERIAL_TYPES.find(m => m.name === type);
    if (!materialDef || !qty) return 0;
    // Simple calculation based on predefined weights. In a real app, unit conversions would be more complex.
    return Number((qty * materialDef.weightPerUnit).toFixed(2));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: field === 'quantity' ? Number(value) || '' : value };
        
        // Auto-set default unit when material type changes
        if (field === 'material_type') {
          const materialDef = MATERIAL_TYPES.find(m => m.name === value);
          if (materialDef) updatedItem.unit = materialDef.defaultUnit;
        }

        // Recalculate weight
        updatedItem.weight = calculateWeight(updatedItem.material_type, updatedItem.quantity, updatedItem.unit);
        return updatedItem;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), material_type: '', quantity: '', unit: 'pcs', weight: 0, notes: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      const itemToRemove = items.find(i => i.id === id);
      if (itemToRemove.material_type || itemToRemove.quantity) {
        if (!window.confirm('Remove this row?')) return;
      }
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const totalWeight = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) {
      toast({ title: 'Error', description: 'Please select a project first.', variant: 'destructive' });
      return;
    }

    // Validate items
    const validItems = items.filter(i => i.material_type && i.quantity > 0);
    if (validItems.length === 0) {
      toast({ title: 'Validation Error', description: 'Please add at least one valid material item.', variant: 'destructive' });
      return;
    }

    const deliveryPayload = {
      project_id: selectedProject.id,
      lkw_id: formData.lkw_id,
      delivery_date: new Date(formData.delivery_date).toISOString(),
      driver_name: formData.driver_name,
      driver_phone: formData.driver_phone,
      status: formData.status,
      notes: formData.notes,
      created_by: currentUser.id
    };

    if (isEditMode) {
      const result = await updateDelivery(id, deliveryPayload);
      if (result) {
        toast({ title: 'Notice', description: 'Delivery updated. Item editing is limited in this view.' });
        navigate('/dashboard/material-deliveries');
      }
    } else {
      const delivery = await createDelivery(deliveryPayload);
      if (delivery) {
        const itemsPayload = validItems.map(item => ({
          delivery_id: delivery.id,
          material_type: item.material_type,
          quantity: Number(item.quantity),
          unit: item.unit,
          notes: item.notes
        }));
        
        const itemsSuccess = await createMaterialItems(itemsPayload);
        if (itemsSuccess) {
          toast({ title: 'Success', description: 'Delivery and items created successfully.' });
          navigate('/dashboard/material-deliveries');
        }
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Delivery' : 'New Material Delivery'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProject?.name}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
            <CardDescription>Information about the transport and driver.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="lkw_id">LKW ID (Auto-generated) *</Label>
                <Input 
                  id="lkw_id" 
                  name="lkw_id"
                  value={formData.lkw_id}
                  readOnly
                  className="bg-muted/50 font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Delivery Date *</Label>
                <Input 
                  id="delivery_date" 
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name *</Label>
                <Input 
                  id="driver_name" 
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleInputChange}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver_phone">Driver Phone *</Label>
                <Input 
                  id="driver_phone" 
                  name="driver_phone"
                  type="tel"
                  value={formData.driver_phone}
                  onChange={handleInputChange}
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => handleSelectChange('status', val)}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Transit">In Transit</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Material Items</CardTitle>
              <CardDescription>List the materials included in this delivery.</CardDescription>
            </div>
            {!isEditMode && (
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Row
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[250px]">Material Type</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="w-[120px]">Unit</TableHead>
                    <TableHead className="w-[120px] text-right">Est. Weight</TableHead>
                    <TableHead>Notes</TableHead>
                    {!isEditMode && <TableHead className="w-[60px]"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select 
                          value={item.material_type} 
                          onValueChange={(val) => handleItemChange(item.id, 'material_type', val)}
                          disabled={isEditMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIAL_TYPES.map(type => (
                              <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          disabled={isEditMode}
                          required
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={item.unit} 
                          onValueChange={(val) => handleItemChange(item.id, 'unit', val)}
                          disabled={isEditMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pcs">pcs</SelectItem>
                            <SelectItem value="m">m</SelectItem>
                            <SelectItem value="m²">m²</SelectItem>
                            <SelectItem value="m³">m³</SelectItem>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="t">t</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-medium text-muted-foreground">
                        {item.weight > 0 ? `${item.weight} kg` : '-'}
                      </TableCell>
                      <TableCell>
                        <Input 
                          value={item.notes || ''}
                          onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          disabled={isEditMode}
                        />
                      </TableCell>
                      {!isEditMode && (
                        <TableCell>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm space-y-3 bg-muted/30 p-4 rounded-lg border">
                <div className="flex justify-between text-lg font-bold items-center">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-muted-foreground" />
                    Total Est. Weight:
                  </span>
                  <span className="text-primary">{totalWeight.toFixed(2)} kg</span>
                </div>
              </div>
            </div>

            {isEditMode && (
              <p className="text-sm text-muted-foreground mt-4">
                Note: Material items cannot be edited directly after creation. Please delete and recreate the delivery if items are incorrect.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Delivery' : 'Save Delivery'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaterialDeliveryForm;
