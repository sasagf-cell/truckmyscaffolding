
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, BookOpen, Tag, Loader2 } from 'lucide-react';

const EMPTY_FORM = {
  project_id: '',
  scaffold_number: '',
  requester_company: '',
  location: '',
  level: '',
  load_class: '3',
  harness_required: false,
  length_m: '',
  width_m: '',
  height_m: '',
  work_type: '',
  unit_price_eur: '',
  start_date: '',
  end_date: '',
};

const ScaffoldLogsPage = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [entriesRes, projectsRes] = await Promise.all([
        pb.collection('scaffold_logs').getFullList({
          sort: '-created',
          expand: 'project_id',
          $autoCancel: false,
        }),
        pb.collection('projects').getFullList({
          sort: '-created',
          $autoCancel: false,
        }),
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
        project_id: entry.project_id || '',
        scaffold_number: entry.scaffold_number || '',
        requester_company: entry.requester_company || '',
        location: entry.location || '',
        level: entry.level || '',
        load_class: entry.load_class || '3',
        harness_required: entry.harness_required || false,
        length_m: entry.length_m ?? '',
        width_m: entry.width_m ?? '',
        height_m: entry.height_m ?? '',
        work_type: entry.work_type || '',
        unit_price_eur: entry.unit_price_eur ?? '',
        start_date: entry.start_date ? entry.start_date.split('T')[0] : '',
        end_date: entry.end_date ? entry.end_date.split('T')[0] : '',
      });
      setEditingId(entry.id);
    } else {
      setFormData({
        ...EMPTY_FORM,
        project_id: projects.length > 0 ? projects[0].id : '',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        length_m: parseFloat(formData.length_m) || 0,
        width_m: parseFloat(formData.width_m) || 0,
        height_m: parseFloat(formData.height_m) || 0,
        unit_price_eur: parseFloat(formData.unit_price_eur) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        created_by: currentUser.id,
      };

      if (editingId) {
        await pb.collection('scaffold_logs').update(editingId, data, { $autoCancel: false });
        toast.success('Scaffold log updated');
      } else {
        // Create scaffold log
        const log = await pb.collection('scaffold_logs').create(data, { $autoCancel: false });

        // Auto-create scaffold_tag (Sprint 3 — Tag Module)
        try {
          // Get project inspection interval
          const project = projects.find((p) => p.id === formData.project_id);
          const intervalDays = project?.inspection_interval_days || 28;
          const nextDue = new Date();
          nextDue.setDate(nextDue.getDate() + intervalDays);

          await pb.collection('scaffold_tags').create({
            scaffold_log_id: log.id,
            project_id: formData.project_id,
            scaffold_number: formData.scaffold_number,
            location: formData.location,
            level: formData.level,
            requester_company: formData.requester_company,
            load_class: formData.load_class,
            harness_required: formData.harness_required,
            status: 'green',
            next_inspection_due: nextDue.toISOString(),
            erected_by: '',
            notes: '',
          }, { $autoCancel: false });

          toast.success('Scaffold log created — Tag generated ✓');
        } catch (tagErr) {
          // scaffold_tags collection might not exist yet in PocketBase — non-fatal
          console.warn('scaffold_tags not yet configured in PocketBase:', tagErr.message);
          toast.success('Scaffold log created (add scaffold_tags collection in PocketBase to enable tags)');
        }
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scaffold log?')) return;
    try {
      await pb.collection('scaffold_logs').delete(id, { $autoCancel: false });
      toast.success('Entry deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

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
          <p className="text-muted-foreground">Manage scaffold records, Gerüstnummern, and billing data.</p>
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
                <TableHead>Tag #</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Location / Level</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>LC</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="w-8 h-8 opacity-30" />
                      <p>No scaffold logs yet. Create the first one.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-semibold text-primary text-sm">
                      {item.scaffold_number || '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.expand?.project_id?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.location || '—'}
                      {item.level && <span className="text-muted-foreground text-xs block">{item.level}</span>}
                    </TableCell>
                    <TableCell className="text-sm">{item.requester_company || '—'}</TableCell>
                    <TableCell>
                      {item.load_class ? (
                        <Badge variant="outline" className="text-xs">LC {item.load_class}</Badge>
                      ) : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.length_m} × {item.width_m} × {item.height_m} m
                    </TableCell>
                    <TableCell className="font-semibold">
                      {item.volume_m3 != null ? `${Number(item.volume_m3).toFixed(2)} m³` : '—'}
                    </TableCell>
                    <TableCell>{item.work_type}</TableCell>
                    <TableCell className="font-semibold text-primary">
                      {item.total_price_eur != null ? `€${Number(item.total_price_eur).toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive"
                      >
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

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              {editingId ? 'Edit Scaffold Log' : 'New Scaffold Log'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Identity & Project ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(v) => setField('project_id', v)}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gerüstnummer (Tag #)</Label>
                <Input
                  placeholder="e.g. GN-001, S-042"
                  value={formData.scaffold_number}
                  onChange={(e) => setField('scaffold_number', e.target.value)}
                />
              </div>
            </div>

            {/* ── Site Details ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location (Aufstellungsort)</Label>
                <Input
                  placeholder="e.g. Turbinenhalle, Section B"
                  value={formData.location}
                  onChange={(e) => setField('location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Level / Deck</Label>
                <Input
                  placeholder="e.g. +0m (Om), Deck 3, EG"
                  value={formData.level}
                  onChange={(e) => setField('level', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Requester Company (Besteller)</Label>
                <Input
                  placeholder="e.g. Bilfinger SE, KWM GmbH"
                  value={formData.requester_company}
                  onChange={(e) => setField('requester_company', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lastklasse (Load Class)</Label>
                <Select
                  value={formData.load_class}
                  onValueChange={(v) => setField('load_class', v)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">LC 1 — 0.75 kN/m²</SelectItem>
                    <SelectItem value="2">LC 2 — 1.50 kN/m²</SelectItem>
                    <SelectItem value="3">LC 3 — 2.00 kN/m² (Industrial std.)</SelectItem>
                    <SelectItem value="4">LC 4 — 3.00 kN/m²</SelectItem>
                    <SelectItem value="5">LC 5 — 4.50 kN/m²</SelectItem>
                    <SelectItem value="6">LC 6 — 6.00 kN/m²</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Checkbox
                id="harness"
                checked={formData.harness_required}
                onCheckedChange={(v) => setField('harness_required', !!v)}
              />
              <Label htmlFor="harness" className="cursor-pointer font-normal">
                Fall protection / harness required (Absturzsicherung erforderlich)
              </Label>
            </div>

            {/* ── Dimensions & Pricing ── */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Dimensions & Pricing</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Type *</Label>
                  <Select
                    value={formData.work_type}
                    onValueChange={(v) => setField('work_type', v)}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Montage">Montage (Erection)</SelectItem>
                      <SelectItem value="Modification">Modification (Änderung)</SelectItem>
                      <SelectItem value="Dismantling">Dismantling (Abbau)</SelectItem>
                      <SelectItem value="Relocation">Relocation (Umzug)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit Price (EUR/m³)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.unit_price_eur}
                    onChange={(e) => setField('unit_price_eur', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Length (m)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.length_m}
                    onChange={(e) => setField('length_m', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Width (m)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.width_m}
                    onChange={(e) => setField('width_m', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (m)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.height_m}
                    onChange={(e) => setField('height_m', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setField('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setField('end_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {!editingId && (
              <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm">
                <Tag className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  A <strong className="text-foreground">Scaffold Tag</strong> will be automatically created with
                  status <strong className="text-green-600">Green</strong> and inspection interval from your
                  project configuration.
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingId ? 'Save Changes' : 'Create Log + Tag'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScaffoldLogsPage;
