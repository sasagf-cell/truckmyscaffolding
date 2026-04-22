import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Clock, Users, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

const ROLES = ['Scaffolder', 'Foreman', 'Safety Officer', 'Rigger', 'Labourer'];

const WorkerHoursPage = () => {
  const { currentUser } = useAuth();
  const { selectedProject } = useOutletContext();

  const [workers, setWorkers] = useState([]);
  const [hoursLog, setHoursLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  const [workerForm, setWorkerForm] = useState({ role: '', company: '' });
  const [hoursForm, setHoursForm] = useState({
    worker_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    regular_hours: '',
    overtime_hours: '',
    notes: ''
  });

  const fetchData = async () => {
    if (!selectedProject?.id) return;
    try {
      setIsLoading(true);
      const [workersRes, hoursRes] = await Promise.all([
        pb.collection('project_workers').getFullList({
          filter: `project_id = "${selectedProject.id}"`,
          sort: 'anonymous_id',
          $autoCancel: false
        }),
        pb.collection('worker_hours').getFullList({
          filter: `project_id = "${selectedProject.id}"`,
          sort: '-date',
          expand: 'worker_id',
          $autoCancel: false
        })
      ]);
      setWorkers(workersRes);
      setHoursLog(hoursRes);
    } catch {
      toast.error('Failed to load worker hours data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedProject?.id]);

  const generateAnonymousId = (existingWorkers) => {
    const count = existingWorkers.length + 1;
    return `W-${String(count).padStart(3, '0')}`;
  };

  const handleAddWorker = async () => {
    if (!workerForm.role || !workerForm.company) {
      toast.error('Role and company are required');
      return;
    }
    try {
      const anonymous_id = generateAnonymousId(workers);
      await pb.collection('project_workers').create({
        project_id: selectedProject.id,
        anonymous_id,
        role: workerForm.role,
        company: workerForm.company
      });
      toast.success(`Worker ${anonymous_id} added`);
      setWorkerForm({ role: '', company: '' });
      setIsWorkerModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to add worker');
    }
  };

  const handleLogHours = async () => {
    if (!hoursForm.worker_id || !hoursForm.date || !hoursForm.regular_hours) {
      toast.error('Worker, date and regular hours are required');
      return;
    }
    try {
      await pb.collection('worker_hours').create({
        project_id: selectedProject.id,
        worker_id: hoursForm.worker_id,
        date: hoursForm.date,
        regular_hours: parseFloat(hoursForm.regular_hours),
        overtime_hours: parseFloat(hoursForm.overtime_hours || 0),
        notes: hoursForm.notes || ''
      });
      toast.success('Hours logged');
      setHoursForm({ worker_id: '', date: format(new Date(), 'yyyy-MM-dd'), regular_hours: '', overtime_hours: '', notes: '' });
      setIsHoursModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to log hours');
    }
  };

  const handleDeleteWorker = async (id, anonymousId) => {
    if (!confirm(`Remove worker ${anonymousId}? Their hours log will be kept.`)) return;
    try {
      await pb.collection('project_workers').delete(id);
      toast.success(`Worker ${anonymousId} removed`);
      fetchData();
    } catch {
      toast.error('Failed to remove worker');
    }
  };

  const totalRegular = hoursLog.reduce((sum, h) => sum + (h.regular_hours || 0), 0);
  const totalOvertime = hoursLog.reduce((sum, h) => sum + (h.overtime_hours || 0), 0);

  if (!selectedProject) {
    return (
      <div className="p-6">
        <Card><CardContent className="pt-6 text-center text-muted-foreground">Select a project to view worker hours.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Worker Hours</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Worker Hours</h1>
          <p className="text-sm text-muted-foreground">GDPR-compliant anonymous tracking — {selectedProject.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsWorkerModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Worker
          </Button>
          <Button onClick={() => setIsHoursModalOpen(true)} disabled={workers.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> Log Hours
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{workers.length}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Active Workers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalRegular}h</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Regular Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalOvertime}h</div>
            <div className="text-xs text-muted-foreground">Overtime Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalRegular + totalOvertime}h</div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Workers on Project</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : workers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No workers added yet. Click "Add Worker" to start.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map(w => (
                  <TableRow key={w.id}>
                    <TableCell><Badge variant="outline">{w.anonymous_id}</Badge></TableCell>
                    <TableCell>{w.role}</TableCell>
                    <TableCell>{w.company}</TableCell>
                    <TableCell>{format(new Date(w.created), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteWorker(w.id, w.anonymous_id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Hours Log Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Hours Log</CardTitle></CardHeader>
        <CardContent>
          {hoursLog.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hours logged yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Regular</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hoursLog.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>{format(new Date(h.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell><Badge variant="outline">{h.expand?.worker_id?.anonymous_id || '—'}</Badge></TableCell>
                    <TableCell>{h.regular_hours}h</TableCell>
                    <TableCell>{h.overtime_hours > 0 ? `${h.overtime_hours}h` : '—'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{h.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Worker Modal */}
      <Dialog open={isWorkerModalOpen} onOpenChange={setIsWorkerModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Worker</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">No personal data is stored. The system assigns an anonymous ID (e.g. W-001).</p>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Role</Label>
              <Select value={workerForm.role} onValueChange={v => setWorkerForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Company</Label>
              <Input placeholder="Subcontractor company name" value={workerForm.company} onChange={e => setWorkerForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsWorkerModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddWorker}>Add Worker</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Hours Modal */}
      <Dialog open={isHoursModalOpen} onOpenChange={setIsHoursModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Hours</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Worker</Label>
              <Select value={hoursForm.worker_id} onValueChange={v => setHoursForm(f => ({ ...f, worker_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                <SelectContent>{workers.map(w => <SelectItem key={w.id} value={w.id}>{w.anonymous_id} — {w.role} ({w.company})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={hoursForm.date} onChange={e => setHoursForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Regular Hours</Label>
                <Input type="number" min="0" max="12" step="0.5" placeholder="8" value={hoursForm.regular_hours} onChange={e => setHoursForm(f => ({ ...f, regular_hours: e.target.value }))} />
              </div>
              <div>
                <Label>Overtime Hours</Label>
                <Input type="number" min="0" max="8" step="0.5" placeholder="0" value={hoursForm.overtime_hours} onChange={e => setHoursForm(f => ({ ...f, overtime_hours: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input placeholder="Any notes..." value={hoursForm.notes} onChange={e => setHoursForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsHoursModalOpen(false)}>Cancel</Button>
              <Button onClick={handleLogHours}>Log Hours</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerHoursPage;
