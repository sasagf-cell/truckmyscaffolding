
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

const ScaffoldLogsPage = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    project_id: '',
    length_m: '',
    width_m: '',
    height_m: '',
    work_type: '',
    unit_price_eur: '',
    start_date: '',
    end_date: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [entriesRes, projectsRes] = await Promise.all([
        pb.collection('scaffold_logs').getFullList({
          sort: '-created',
          expand: 'project_id',
          $autoCancel: false
        }),
        pb.collection('projects').getFullList({
          sort: '-created',
          $autoCancel: false
        })
      ]);
      setEntries(entriesRes);
      setProjects(projectsRes);
    } catch (error) {
      toast.error('Failed to load Scaffold Logs data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setFormData({
        project_id: entry.project_id,
        length_m: entry.length_m,
        width_m: entry.width_m,
        height_m: entry.height_m,
        work_type: entry.work_type,
        unit_price_eur: entry.unit_price_eur,
        start_date: entry.start_date.split('T')[0],
        end_date: entry.end_date.split('T')[0]
      });
      setEditingId(entry.id);
    } else {
      setFormData({
        project_id: projects.length > 0 ? projects[0].id : '',
        length_m: '', width_m: '', height_m: '', work_type: '', unit_price_eur: '', start_date: '', end_date: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        length_m: parseFloat(formData.length_m),
        width_m: parseFloat(formData.width_m),
        height_m: parseFloat(formData.height_m),
        unit_price_eur: parseFloat(formData.unit_price_eur),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        created_by: currentUser.id
      };

      if (editingId) {
        await pb.collection('scaffold_logs').update(editingId, data, { $autoCancel: false });
        toast.success('Entry updated successfully');
      } else {
        await pb.collection('scaffold_logs').create(data, { $autoCancel: false });
        toast.success('Entry created successfully');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await pb.collection('scaffold_logs').delete(id, { $autoCancel: false });
      toast.success('Entry deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Scaffold Logs</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scaffold Logs</h1>
          <p className="text-muted-foreground">Manage scaffold measurements, pricing, and rental periods.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Dimensions (L×W×H)</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price/m³</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Rental Days</TableHead>
                <TableHead>Holding Fee</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                      <p>No Scaffold Logs entries found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.expand?.project_id?.name || 'Unknown'}</TableCell>
                    <TableCell>{item.length_m} × {item.width_m} × {item.height_m} m</TableCell>
                    <TableCell className="font-semibold">{item.volume_m3?.toFixed(2)} m³</TableCell>
                    <TableCell>{item.work_type}</TableCell>
                    <TableCell>€{item.unit_price_eur?.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold text-primary">€{item.total_price_eur?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs">
                      {new Date(item.start_date).toLocaleDateString()} - <br/>
                      {new Date(item.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{item.rental_days} days</TableCell>
                    <TableCell>€{item.holding_fee_eur?.toFixed(2)}</TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Scaffold Log Entry' : 'New Scaffold Log Entry'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={formData.project_id} onValueChange={(v) => setFormData({...formData, project_id: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Work Type</Label>
                <Select value={formData.work_type} onValueChange={(v) => setFormData({...formData, work_type: v})} required>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Montage">Montage</SelectItem>
                    <SelectItem value="Modification">Modification</SelectItem>
                    <SelectItem value="Dismantling">Dismantling</SelectItem>
                    <SelectItem value="Relocation">Relocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Length (m)</Label>
                <Input type="number" step="0.01" value={formData.length_m} onChange={(e) => setFormData({...formData, length_m: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Width (m)</Label>
                <Input type="number" step="0.01" value={formData.width_m} onChange={(e) => setFormData({...formData, width_m: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Height (m)</Label>
                <Input type="number" step="0.01" value={formData.height_m} onChange={(e) => setFormData({...formData, height_m: e.target.value})} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Unit Price (EUR/m³)</Label>
                <Input type="number" step="0.01" value={formData.unit_price_eur} onChange={(e) => setFormData({...formData, unit_price_eur: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} required />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p><strong>Note:</strong> Volume, Total Price, Rental Days, and Holding Fee will be automatically calculated upon saving.</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Entry</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScaffoldLogsPage;
