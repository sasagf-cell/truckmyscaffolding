
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send, Box } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useScaffoldRequests } from '@/hooks/useScaffoldRequests.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// Lazy-load Three.js 3D preview — keeps this chunk small so the form loads instantly
const Scaffold3DPreview = lazy(() => import('@/components/Scaffold3DPreview.jsx'));

const ScaffoldRequestForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectedProject } = useOutletContext() ?? {};
  const { createRequest, updateRequest, fetchRequestById, loading } = useScaffoldRequests();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    requestedDate: '',
    estimatedDuration: '',
  });

  const [workers, setWorkers] = useState([
    { id: Date.now(), name: '', hours: '', rate: '' }
  ]);

  useEffect(() => {
    if (isEditMode) {
      const loadData = async () => {
        const data = await fetchRequestById(id);
        if (data) {
          setFormData({
            type: data.type || '',
            location: data.location || '',
            description: data.description || '',
            requestedDate: data.requestedDate ? data.requestedDate.split('T')[0] : '',
            estimatedDuration: data.estimatedDuration || '',
          });
          if (data.workerHours && data.workerHours.length > 0) {
            setWorkers(data.workerHours.map(w => ({ 
              ...w, 
              id: Date.now() + Math.random(),
              hours: w.hours || '',
              rate: w.rate || ''
            })));
          }
        }
      };
      loadData();
    }
  }, [id, isEditMode, fetchRequestById]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkerChange = (id, field, value) => {
    setWorkers(prev => prev.map(worker => {
      if (worker.id === id) {
        return { 
          ...worker, 
          [field]: field === 'name' ? value : (value === '' ? '' : Number(value)) 
        };
      }
      return worker;
    }));
  };

  const addWorker = () => {
    setWorkers(prev => [...prev, { id: Date.now(), name: '', hours: '', rate: '' }]);
  };

  const removeWorker = (id) => {
    if (workers.length > 1) {
      setWorkers(prev => prev.filter(w => w.id !== id));
    }
  };

  // Auto-calculation logic
  const totalHours = workers.reduce((sum, w) => sum + (Number(w.hours) || 0), 0);
  const totalCost = workers.reduce((sum, w) => sum + ((Number(w.hours) || 0) * (Number(w.rate) || 0)), 0);

  const handleSave = async (targetStatus) => {
    if (!selectedProject) {
      toast({ title: 'Error', description: 'Please select a project first.', variant: 'destructive' });
      return;
    }

    // Validation
    if (!formData.type || !formData.location || !formData.requestedDate || !formData.estimatedDuration) {
      toast({ title: 'Validation Error', description: 'Please fill in all required general information fields.', variant: 'destructive' });
      return;
    }

    const invalidWorkers = workers.some(w => !w.name.trim() || Number(w.hours) <= 0 || Number(w.rate) <= 0);
    if (invalidWorkers) {
      toast({ 
        title: 'Validation Error', 
        description: 'All worker rows must have a name, hours (>0), and rate (>0).', 
        variant: 'destructive' 
      });
      return;
    }

    const cleanWorkers = workers.map(({ name, hours, rate }) => ({
      name: name.trim(),
      hours: Number(hours),
      rate: Number(rate),
      subtotal: Number(hours) * Number(rate)
    }));

    const payload = {
      projectId: selectedProject.id,
      type: formData.type,
      location: formData.location,
      description: formData.description,
      requestedDate: new Date(formData.requestedDate).toISOString(),
      estimatedDuration: Number(formData.estimatedDuration),
      workerHours: cleanWorkers,
      totalCost: totalCost,
      status: targetStatus,
      createdBy: currentUser.id
    };

    let result;
    if (isEditMode) {
      result = await updateRequest(id, payload);
    } else {
      result = await createRequest(payload);
    }

    if (result) {
      navigate('/dashboard/scaffold-requests');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? 'Edit Request' : 'New Scaffold Request'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProject?.name}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>Basic details about the scaffolding needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scaffoldNumber" className="text-primary font-bold text-glow">Scaffold Number / Tag ID *</Label>
                    <Input 
                      id="scaffoldNumber" 
                      name="scaffoldNumber"
                      value={formData.scaffoldNumber || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., SN-2026-001"
                      className="bg-white/5 border-primary/20 focus:border-primary shadow-[0_0_10px_rgba(249,115,22,0.1)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Request Type *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(val) => handleSelectChange('type', val)}
                    >
                      <SelectTrigger id="type" className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Heavy Load">Heavy Load</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="Special Design">Special Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plant">Plant / Unit *</Label>
                    <Input 
                      id="plant" 
                      name="plant"
                      value={formData.plant || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Boiler 1"
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">Section / Level *</Label>
                    <Input 
                      id="section" 
                      name="section"
                      value={formData.section || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Level +12m"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (m)</Label>
                    <Input 
                      id="width" 
                      name="width"
                      type="number"
                      step="0.1"
                      value={formData.width || 2}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length">Length (m)</Label>
                    <Input 
                      id="length" 
                      name="length"
                      type="number"
                      step="0.1"
                      value={formData.length || 3}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (m)</Label>
                    <Input 
                      id="height" 
                      name="height"
                      type="number"
                      step="0.1"
                      value={formData.height || 4}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractor">Responsible Contractor *</Label>
                  <Input 
                    id="contractor" 
                    name="contractor"
                    value={formData.contractor || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Alpha Scaffolding Ltd"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              {/* Right Column: 3D Preview */}
              <div className="flex flex-col gap-4">
                <Label className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                  Live Industrial Dimension Preview
                  <span className="text-[10px] text-primary">Interactive 3D View</span>
                </Label>
                <div className="flex-1 min-h-[400px]">
                  <Suspense fallback={
                    <div className="w-full h-full min-h-[400px] bg-muted/20 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Box className="w-8 h-8 opacity-30 animate-pulse" />
                      <span className="text-xs">Loading 3D preview…</span>
                    </div>
                  }>
                    <Scaffold3DPreview
                      width={formData.width || 2}
                      length={formData.length || 3}
                      height={formData.height || 4}
                    />
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="requestedDate">Requested Start Date *</Label>
                <Input 
                  id="requestedDate" 
                  name="requestedDate"
                  type="date"
                  value={formData.requestedDate}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (Days) *</Label>
                <Input 
                  id="estimatedDuration" 
                  name="estimatedDuration"
                  type="number"
                  min="1"
                  value={formData.estimatedDuration}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Activity Scope / Work Description *</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe exactly what work will be performed from this scaffold..."
                className="min-h-[100px] bg-white/5 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Worker Hours & Costs</CardTitle>
              <CardDescription>Estimate the labor required for this request.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addWorker}>
              <Plus className="w-4 h-4 mr-2" />
              Add Worker
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Worker Code / Role</TableHead>
                    <TableHead className="w-[120px]">Hours</TableHead>
                    <TableHead className="w-[120px]">Rate (€/hr)</TableHead>
                    <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker, index) => (
                    <TableRow key={worker.id}>
                      <TableCell>
                        <Input 
                          value={worker.name}
                          onChange={(e) => handleWorkerChange(worker.id, 'name', e.target.value)}
                          placeholder="e.g., W-001 · Scaffolder"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          step="0.5"
                          value={worker.hours}
                          onChange={(e) => handleWorkerChange(worker.id, 'hours', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          value={worker.rate}
                          onChange={(e) => handleWorkerChange(worker.id, 'rate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{((Number(worker.hours) || 0) * (Number(worker.rate) || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeWorker(worker.id)}
                          disabled={workers.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <div className="w-full max-w-sm space-y-3 bg-muted/30 p-4 rounded-lg border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Estimated Hours:</span>
                  <span className="font-medium">{totalHours} hrs</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Estimated Cost:</span>
                  <span className="text-primary">€{totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => handleSave('draft')} 
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            type="button" 
            onClick={() => handleSave('pending')} 
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScaffoldRequestForm;
