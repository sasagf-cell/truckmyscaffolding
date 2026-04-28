import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Tag, ShieldCheck, ShieldAlert, ShieldOff,
  Search, Plus, RefreshCw, CalendarClock, Loader2,
  XCircle, Printer, QrCode, ExternalLink, User, History,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  green: {
    label: 'Active / Safe',
    labelDE: 'Aktiv / Sicher',
    icon: ShieldCheck,
    badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    dotClass: 'bg-green-500',
    printBg: '#16a34a',
    printText: '#ffffff',
  },
  red: {
    label: 'DO NOT USE',
    labelDE: 'NICHT BENUTZEN',
    icon: ShieldAlert,
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    dotClass: 'bg-red-500',
    printBg: '#dc2626',
    printText: '#ffffff',
  },
  inactive: {
    label: 'Dismantled',
    labelDE: 'Demontiert',
    icon: ShieldOff,
    badgeClass: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
    printBg: '#6b7280',
    printText: '#ffffff',
  },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const due = new Date(dateStr);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function InspectionBadge({ dateStr }) {
  const days = daysUntil(dateStr);
  if (days === null) return <span className="text-muted-foreground text-sm">—</span>;
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
        <XCircle className="w-3 h-3" /> Overdue {Math.abs(days)}d
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
        <CalendarClock className="w-3 h-3" /> Due in {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <CalendarClock className="w-3 h-3" /> {formatDate(dateStr)}
    </span>
  );
}

// ── QR Code Image ─────────────────────────────────────────────────────────────
function QRCodeImage({ value, size = 120, className = '' }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&margin=2`;
  return (
    <img src={url} alt={`QR: ${value}`} width={size} height={size} className={className} loading="lazy" />
  );
}

// ── Confirm Inspection Modal ──────────────────────────────────────────────────
function ConfirmInspectionModal({ tag, projectName, intervalDays, currentUser, open, onClose, onConfirmed }) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setNotes('');
  }, [open, tag]);

  if (!tag) return null;

  const today = new Date();
  const newDue = addDays(today, intervalDays);
  // Use local date (not UTC) — critical for UTC+2 Germany/EPC sites
  const newDueStr = `${newDue.getFullYear()}-${String(newDue.getMonth() + 1).padStart(2, '0')}-${String(newDue.getDate()).padStart(2, '0')}`;
  const confirmedByName = currentUser?.name || currentUser?.email || 'Unknown';

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const previousDue = tag.next_inspection_due || null;

      // 1. Update scaffold tag → green + new inspection date
      await pb.collection('scaffold_tags').update(tag.id, {
        status: 'green',
        next_inspection_due: newDueStr,
      }, { $autoCancel: false });

      // 2. Log to scaffold_inspections (graceful fail if collection doesn't exist yet)
      try {
        await pb.collection('scaffold_inspections').create({
          scaffold_tag_id: tag.id,
          scaffold_number: tag.scaffold_number || tag.id,
          project_id: tag.project_id,
          confirmed_by: currentUser?.id || '',
          confirmed_by_name: confirmedByName,
          confirmed_at: today.toISOString(),
          previous_due: previousDue,
          new_due: newDueStr,
          interval_days: intervalDays,
          notes: notes.trim(),
        }, { $autoCancel: false });
      } catch {
        // Collection may not exist yet — main action still succeeded
      }

      toast.success(`✓ Inspection confirmed — next due ${formatDate(newDueStr)}`);
      onConfirmed();
      onClose();
    } catch (err) {
      toast.error('Failed to confirm inspection: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Confirm Inspection — {tag.scaffold_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Scaffold summary */}
          <div className="rounded-lg bg-muted/40 border p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project</span>
              <span className="font-medium">{projectName}</span>
            </div>
            {tag.location && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{tag.location}</span>
              </div>
            )}
            {tag.level && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">{tag.level}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current next due</span>
              <span className={`font-medium ${daysUntil(tag.next_inspection_due) < 0 ? 'text-red-600' : ''}`}>
                {formatDate(tag.next_inspection_due)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">New next due</span>
              <span className="font-bold text-green-600">{formatDate(newDueStr)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Interval</span>
              <span>+{intervalDays} days (DGUV 201-011)</span>
            </div>
          </div>

          {/* Confirming user */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            Confirming as:
            <span className="font-medium text-foreground ml-1">{confirmedByName}</span>
          </div>

          {/* Warning if was red */}
          {tag.status === 'red' && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3 text-sm text-orange-700 dark:text-orange-400">
              ⚠ This scaffold was marked as failed. Confirming will set it back to <strong>Active / Safe</strong>.
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="mb-1.5 block">Inspection Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              placeholder="Observations, any items noted during inspection…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[70px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving
                ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                : <ShieldCheck className="w-4 h-4 mr-2" />}
              Confirm Safe & Extend
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Inspection History Modal ──────────────────────────────────────────────────
function InspectionHistoryModal({ tag, open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !tag) return;
    setLoading(true);
    pb.collection('scaffold_inspections').getFullList({
      filter: pb.filter('scaffold_tag_id = {:tid}', { tid: tag.id }),
      sort: '-confirmed_at',
      $autoCancel: false,
    })
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [open, tag]);

  if (!tag) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Inspection History — {tag.scaffold_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No inspections confirmed yet via the app.
            </p>
          ) : (
            history.map((h) => (
              <div key={h.id} className="rounded-lg border p-3 text-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{formatDate(h.confirmed_at)}</span>
                  <Badge variant="outline" className="text-xs">+{h.interval_days}d</Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {h.confirmed_by_name || '—'}
                  </span>
                  <span>Next due: <strong className="text-foreground">{formatDate(h.new_due)}</strong></span>
                </div>
                {h.notes && (
                  <p className="text-xs italic text-muted-foreground border-t pt-1.5">{h.notes}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Print Tag Card ────────────────────────────────────────────────────────────
function PrintTagModal({ tag, projectName, open, onClose }) {
  const printRef = useRef(null);
  if (!tag) return null;

  const cfg = STATUS_CONFIG[tag.status] || STATUS_CONFIG.green;
  const qrValue = `${window.location.origin}/scaffold-tags?q=${encodeURIComponent(tag.scaffold_number || tag.id)}`;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=500,height=700');
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="utf-8" />
      <title>ScaffTag — ${tag.scaffold_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #fff; }
        @page { size: A5 landscape; margin: 8mm; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            Print Scaffold Tag — {tag.scaffold_number}
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef}>
          <div style={{ display:'flex', border:'3px solid #1e293b', borderRadius:'8px', overflow:'hidden', fontFamily:'Arial,sans-serif', background:'#fff', minHeight:'200px' }}>
            <div style={{ width:'160px', background:cfg.printBg, color:cfg.printText, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px 8px', gap:'8px', flexShrink:0 }}>
              <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', opacity:0.85 }}>STATUS</div>
              <div style={{ fontSize:'22px', fontWeight:900, textAlign:'center', lineHeight:1.1 }}>{cfg.label}</div>
              <div style={{ fontSize:'13px', fontWeight:700, textAlign:'center', opacity:0.9 }}>{cfg.labelDE}</div>
            </div>
            <div style={{ flex:1, padding:'16px 20px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ fontSize:'28px', fontWeight:900, color:'#0f172a', letterSpacing:'1px', fontFamily:'monospace' }}>
                {tag.scaffold_number || `TAG-${tag.id?.slice(-4).toUpperCase()}`}
              </div>
              <div style={{ fontSize:'11px', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }}>{projectName}</div>
              <div style={{ borderTop:'1px solid #e2e8f0', paddingTop:'8px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                {[
                  ['Location', tag.location],
                  ['Level', tag.level],
                  ['Load Class', tag.load_class ? `LC ${tag.load_class}` : null],
                  ['Harness', tag.harness_required ? '⚠ Required' : 'Not required'],
                  ['Requester', tag.requester_company],
                  ['Erected by', tag.erected_by],
                  ['Next Inspection', formatDate(tag.next_inspection_due)],
                  ['Tag Created', formatDate(tag.created)],
                ].map(([label, val]) => val ? (
                  <div key={label} style={{ fontSize:'11px' }}>
                    <span style={{ color:'#94a3b8', fontWeight:600 }}>{label}: </span>
                    <span style={{ color:'#0f172a' }}>{val}</span>
                  </div>
                ) : null)}
              </div>
              {tag.notes && (
                <div style={{ fontSize:'10px', color:'#64748b', fontStyle:'italic', borderTop:'1px solid #f1f5f9', paddingTop:'6px' }}>{tag.notes}</div>
              )}
              <div style={{ marginTop:'auto', paddingTop:'8px', borderTop:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:'9px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'1px' }}>TrackMyScaffolding · DGUV 201-011</div>
                <div style={{ fontSize:'9px', color:'#94a3b8' }}>Printed: {new Date().toLocaleDateString('de-DE')}</div>
              </div>
            </div>
            <div style={{ width:'140px', background:'#f8fafc', borderLeft:'2px solid #e2e8f0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'12px', gap:'6px', flexShrink:0 }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrValue)}&format=svg&margin=2`} width={110} height={110} alt="QR Code" />
              <div style={{ fontSize:'9px', color:'#94a3b8', textAlign:'center', textTransform:'uppercase', letterSpacing:'0.5px' }}>Scan to confirm</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <p className="text-xs text-muted-foreground">A5 landscape · QR opens confirm inspection flow</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Print Tag</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Status Modal ─────────────────────────────────────────────────────────
function EditTagModal({ tag, open, onClose, onSaved }) {
  const [status, setStatus] = useState(tag?.status || 'green');
  const [notes, setNotes] = useState(tag?.notes || '');
  const [saving, setSaving] = useState(false);

  // Depend on tag.id + open (not full tag object) — prevents notes from being
  // reset when parent refetches tags mid-edit (new object reference, same data)
  useEffect(() => {
    if (open && tag) { setStatus(tag.status || 'green'); setNotes(tag.notes || ''); }
  }, [open, tag?.id]);

  const handleSave = async () => {
    if (!tag?.id) return;
    setSaving(true);
    try {
      await pb.collection('scaffold_tags').update(tag.id, { status, notes }, { $autoCancel: false });
      toast.success('Tag status updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error('Failed to update tag: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Tag Status — {tag?.scaffold_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button key={val} type="button" onClick={() => setStatus(val)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-xs font-medium transition-all ${status === val ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <Icon className={`w-5 h-5 ${val === 'green' ? 'text-green-600' : val === 'red' ? 'text-red-600' : 'text-muted-foreground'}`} />
                    {val === 'green' ? 'Green ✓' : val === 'red' ? 'Red ✗' : 'Inactive'}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Inspector Notes</Label>
            <Textarea placeholder="Inspection findings, reason for status change…" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── QR Preview Modal ──────────────────────────────────────────────────────────
function QRPreviewModal({ tag, open, onClose }) {
  if (!tag) return null;
  const qrValue = `${window.location.origin}/scaffold-tags?q=${encodeURIComponent(tag.scaffold_number || tag.id)}`;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" /> QR Code — {tag.scaffold_number}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="border-2 border-border rounded-xl p-3 bg-white">
            <QRCodeImage value={qrValue} size={200} />
          </div>
          <p className="text-xs text-muted-foreground text-center">Scan to open confirm inspection flow</p>
          <p className="text-xs font-mono text-center text-muted-foreground break-all">{qrValue}</p>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" size="sm" onClick={() => window.open(qrValue, '_blank')}>
            <ExternalLink className="w-3 h-3 mr-1" /> Open Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const ScaffoldTagsPage = () => {
  const { selectedProject } = useOutletContext() ?? {};
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal states
  const [editTag, setEditTag] = useState(null);
  const [printTag, setPrintTag] = useState(null);
  const [qrTag, setQrTag] = useState(null);
  const [confirmTag, setConfirmTag] = useState(null);
  const [historyTag, setHistoryTag] = useState(null);

  // Tracks which ?q= value already auto-opened the modal — prevents re-opening
  // every time fetchTags() refreshes the tags array (zombie loop fix)
  const hasAutoOpenedRef = useRef(null);

  // Inspection interval from project settings (default 28 days per DGUV)
  const intervalDays = selectedProject?.inspection_interval_days || 28;

  const fetchTags = useCallback(async () => {
    if (!selectedProject?.id) return;
    setLoading(true);
    try {
      const result = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('project_id = {:pid}', { pid: selectedProject.id }),
        sort: '-created',
        expand: 'scaffold_log_id',
        $autoCancel: false,
      });
      setTags(result);
    } catch (err) {
      if (err.status === 404 || err.message?.includes('scaffold_tags')) {
        setTags([]);
      } else {
        toast.error('Failed to load scaffold tags');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => { fetchTags(); }, [fetchTags]);

  // ── QR scan auto-open: ?q=scaffold_number → auto-open ConfirmInspectionModal
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q || loading || tags.length === 0) return;
    // Guard: only open once per ?q= value — prevents zombie re-open when
    // fetchTags() refreshes the tags array and causes a re-render
    if (hasAutoOpenedRef.current === q) return;

    const match = tags.find(
      (t) => t.scaffold_number?.toLowerCase() === q.toLowerCase() || t.id === q
    );
    if (match) {
      hasAutoOpenedRef.current = q;
      setSearch(q);            // highlight in list
      setConfirmTag(match);    // open confirm modal immediately
    }
  }, [searchParams, tags, loading]);

  // Search + status filter
  const filtered = tags.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      t.scaffold_number?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q) ||
      t.requester_company?.toLowerCase().includes(q) ||
      t.erected_by?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // KPI counts
  const greenCount = tags.filter((t) => t.status === 'green').length;
  const redCount = tags.filter((t) => t.status === 'red').length;
  const overdueCount = tags.filter((t) => t.status !== 'inactive' && daysUntil(t.next_inspection_due) < 0).length;
  const inactiveCount = tags.filter((t) => t.status === 'inactive').length;

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Select a project to view scaffold tags.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Scaffold Tags</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" /> Scaffold Tags
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {selectedProject.name} — SCAFFTAG digital registry · DGUV 201-011 · {intervalDays}-day interval
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTags}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => navigate('/scaffold-logs')}>
            <Plus className="w-4 h-4 mr-1" /> New Scaffold Log
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 cursor-pointer hover:border-green-400 transition-colors"
          onClick={() => setFilterStatus(filterStatus === 'green' ? 'all' : 'green')}>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Active (Green)
          </div>
          <div className="text-2xl font-bold text-green-600">{greenCount}</div>
        </Card>
        <Card className="p-4 cursor-pointer hover:border-red-400 transition-colors"
          onClick={() => setFilterStatus(filterStatus === 'red' ? 'all' : 'red')}>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Failed (Red)
          </div>
          <div className="text-2xl font-bold text-red-600">{redCount}</div>
        </Card>
        <Card className="p-4">
          <div className={`text-xs uppercase tracking-wide mb-1 flex items-center gap-1 ${overdueCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
            <span className={`w-2 h-2 rounded-full inline-block ${overdueCount > 0 ? 'bg-red-500' : 'bg-muted-foreground'}`} /> Overdue
          </div>
          <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{overdueCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total / Inactive</div>
          <div className="text-2xl font-bold">
            {tags.length}<span className="text-base font-normal text-muted-foreground ml-1">/ {inactiveCount}</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by tag number, location, requester, erected by…"
            className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="green">🟢 Active / Green</SelectItem>
            <SelectItem value="red">🔴 Failed / Red</SelectItem>
            <SelectItem value="inactive">⚫ Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Red alert banner */}
      {redCount > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            {redCount} scaffold{redCount > 1 ? 's' : ''} failed inspection — access must be restricted until cleared.
          </p>
          <Button size="sm" variant="outline"
            className="ml-auto border-red-300 text-red-700 hover:bg-red-100 shrink-0"
            onClick={() => setFilterStatus('red')}>
            Show Only Red
          </Button>
        </div>
      )}

      {/* Tag List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground font-medium">No scaffold tags found</p>
            <p className="text-sm text-muted-foreground mt-1">Tags are automatically created when you add a Scaffold Log.</p>
            <Button className="mt-4" size="sm" onClick={() => navigate('/scaffold-logs')}>
              <Plus className="w-4 h-4 mr-1" /> Create Scaffold Log
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((tag) => {
            const cfg = STATUS_CONFIG[tag.status] || STATUS_CONFIG.green;
            const Icon = cfg.icon;
            const days = daysUntil(tag.next_inspection_due);
            const isOverdue = tag.status !== 'inactive' && days !== null && days < 0;
            const isDueSoon = tag.status !== 'inactive' && days !== null && days >= 0 && days <= 3;

            return (
              <Card key={tag.id}
                className={`transition-all hover:shadow-md ${isOverdue ? 'border-red-300 dark:border-red-800' : isDueSoon ? 'border-orange-300 dark:border-orange-800' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status icon */}
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      tag.status === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      tag.status === 'red' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'}`}>
                      <Icon className={`w-5 h-5 ${
                        tag.status === 'green' ? 'text-green-600' :
                        tag.status === 'red' ? 'text-red-600' : 'text-muted-foreground'}`} />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-base font-mono">
                          {tag.scaffold_number || `TAG-${tag.id.slice(-4).toUpperCase()}`}
                        </span>
                        <Badge className={`text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge>
                        {tag.load_class && <Badge variant="outline" className="text-xs">LC {tag.load_class}</Badge>}
                        {tag.harness_required && (
                          <Badge variant="outline" className="text-xs border-orange-400 text-orange-600">⚠ Harness Required</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {tag.location && <span><span className="font-medium text-foreground">Location:</span> {tag.location}</span>}
                        {tag.level && <span><span className="font-medium text-foreground">Level:</span> {tag.level}</span>}
                        {tag.requester_company && <span><span className="font-medium text-foreground">Requester:</span> {tag.requester_company}</span>}
                        {tag.erected_by && <span><span className="font-medium text-foreground">Erected by:</span> {tag.erected_by}</span>}
                      </div>

                      {tag.notes && (
                        <p className="text-xs text-muted-foreground mt-1.5 italic line-clamp-1">{tag.notes}</p>
                      )}
                    </div>

                    {/* Right: inspection badge + actions */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <InspectionBadge dateStr={tag.next_inspection_due} />

                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {/* Confirm Inspection — primary action, always available for active scaffolds */}
                        {tag.status !== 'inactive' && (
                          <Button
                            size="sm"
                            className={`h-8 text-xs ${isOverdue || isDueSoon
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800'}`}
                            onClick={() => setConfirmTag(tag)}
                          >
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                            {isOverdue || isDueSoon ? 'Confirm Now' : 'Confirm'}
                          </Button>
                        )}

                        {/* History */}
                        <Button variant="outline" size="icon" className="w-8 h-8" title="Inspection History"
                          onClick={() => setHistoryTag(tag)}>
                          <History className="w-3.5 h-3.5" />
                        </Button>

                        {/* QR */}
                        <Button variant="outline" size="icon" className="w-8 h-8" title="Show QR Code"
                          onClick={() => setQrTag(tag)}>
                          <QrCode className="w-3.5 h-3.5" />
                        </Button>

                        {/* Print */}
                        <Button variant="outline" size="icon" className="w-8 h-8" title="Print Tag Card"
                          onClick={() => setPrintTag(tag)}>
                          <Printer className="w-3.5 h-3.5" />
                        </Button>

                        {/* Update status */}
                        <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setEditTag(tag)}>
                          Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Modals ── */}
      {confirmTag && (
        <ConfirmInspectionModal
          tag={confirmTag}
          projectName={selectedProject.name}
          intervalDays={intervalDays}
          currentUser={currentUser}
          open={!!confirmTag}
          onClose={() => setConfirmTag(null)}
          onConfirmed={fetchTags}
        />
      )}
      {historyTag && (
        <InspectionHistoryModal
          tag={historyTag}
          open={!!historyTag}
          onClose={() => setHistoryTag(null)}
        />
      )}
      {editTag && (
        <EditTagModal tag={editTag} open={!!editTag} onClose={() => setEditTag(null)} onSaved={fetchTags} />
      )}
      {printTag && (
        <PrintTagModal tag={printTag} projectName={selectedProject.name} open={!!printTag} onClose={() => setPrintTag(null)} />
      )}
      {qrTag && (
        <QRPreviewModal tag={qrTag} open={!!qrTag} onClose={() => setQrTag(null)} />
      )}
    </div>
  );
};

export default ScaffoldTagsPage;
