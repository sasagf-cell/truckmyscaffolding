import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import pb from '../../../lib/pocketbaseClient';
import { useInspections } from './hooks/useInspections';
import InspectionForm from './components/InspectionForm';
import InspectionHistory from './components/InspectionHistory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ShieldCheck, ShieldAlert, ShieldOff, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TAG_STATUS_DISPLAY = {
  green: {
    label: 'Active / Green',
    icon: ShieldCheck,
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  red: {
    label: 'Inspection Failed / Red',
    icon: ShieldAlert,
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  inactive: {
    label: 'Dismantled / Inactive',
    icon: ShieldOff,
    badge: 'bg-muted text-muted-foreground',
  },
};

const SafetyInspectionsPage = () => {
  const { selectedProject } = useOutletContext() ?? {};

  // Scaffold logs for this project
  const [scaffoldLogs, setScaffoldLogs] = useState([]);
  const [selectedLogId, setSelectedLogId] = useState('');
  const [currentTag, setCurrentTag] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  // Project inspection interval
  const intervalDays = selectedProject?.inspection_interval_days || 28;

  const { inspections, latest, loading, error, refresh, addInspection } = useInspections(
    selectedProject?.id,
    selectedLogId || null,
    intervalDays
  );

  // Fetch scaffold logs for project
  const fetchScaffoldLogs = useCallback(async () => {
    if (!selectedProject?.id) return;
    setLogsLoading(true);
    try {
      const logs = await pb.collection('scaffold_logs').getFullList({
        filter: pb.filter('project_id = {:pid}', { pid: selectedProject.id }),
        sort: 'scaffold_number',
        $autoCancel: false,
      });
      setScaffoldLogs(logs);
    } catch (err) {
      console.error('Failed to fetch scaffold logs:', err);
    } finally {
      setLogsLoading(false);
    }
  }, [selectedProject]);

  // Fetch current tag when scaffold log selected
  const fetchCurrentTag = useCallback(async (logId) => {
    if (!logId) { setCurrentTag(null); return; }
    try {
      const tags = await pb.collection('scaffold_tags').getFullList({
        filter: pb.filter('scaffold_log_id = {:lid}', { lid: logId }),
        $autoCancel: false,
      });
      setCurrentTag(tags[0] || null);
    } catch {
      setCurrentTag(null);
    }
  }, []);

  useEffect(() => {
    fetchScaffoldLogs();
  }, [fetchScaffoldLogs]);

  useEffect(() => {
    fetchCurrentTag(selectedLogId);
  }, [selectedLogId, fetchCurrentTag]);

  const handleNewInspection = async (data) => {
    try {
      await addInspection(data);
      const tagAction = selectedLogId
        ? ` — Scaffold Tag updated to ${data.status === 'pass' ? 'GREEN ✅' : 'RED 🔴'}`
        : '';
      toast.success(`Inspection saved${tagAction}`);
      // Refresh tag status display
      await fetchCurrentTag(selectedLogId);
    } catch (err) {
      toast.error('Failed to save inspection: ' + err.message);
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          Select a project from the sidebar to view safety inspections.
        </CardContent>
      </Card>
    );
  }

  const selectedLog = scaffoldLogs.find(l => l.id === selectedLogId) || null;
  const tagCfg = currentTag ? (TAG_STATUS_DISPLAY[currentTag.status] || TAG_STATUS_DISPLAY.green) : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Safety Inspections</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Safety Inspections</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {selectedProject.name} · Interval: every {intervalDays} days
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Scaffold Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Select Scaffold to Inspect
              </Label>
              <Select
                value={selectedLogId}
                onValueChange={setSelectedLogId}
                disabled={logsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    logsLoading ? 'Loading scaffolds…' :
                    scaffoldLogs.length === 0 ? 'No scaffold logs found — create one first' :
                    'Select scaffold by number or location…'
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All scaffolds (project overview)</SelectItem>
                  {scaffoldLogs.map((log) => (
                    <SelectItem key={log.id} value={log.id}>
                      {log.scaffold_number || `LOG-${log.id.slice(-4).toUpperCase()}`}
                      {log.location ? ` · ${log.location}` : ''}
                      {log.load_class ? ` · LC${log.load_class}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current tag status for selected scaffold */}
            {currentTag && tagCfg && (
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Current Tag Status</span>
                <Badge className={`${tagCfg.badge} gap-1 text-sm px-3 py-1`}>
                  <tagCfg.icon className="w-3.5 h-3.5" />
                  {tagCfg.label}
                </Badge>
              </div>
            )}
            {selectedLogId && !currentTag && (
              <div className="text-xs text-muted-foreground italic">No tag linked yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-700 dark:text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <InspectionForm
              onSubmit={handleNewInspection}
              isLoading={loading}
              intervalDays={intervalDays}
              selectedScaffold={selectedLog}
            />
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedLogId ? 'Inspection History — Selected Scaffold' : 'All Project Inspections'}
            </h2>
            <span className="text-sm text-muted-foreground">{inspections.length} records</span>
          </div>
          <InspectionHistory list={inspections} isLoading={loading} />
        </div>
      </div>
    </div>
  );
};

export default SafetyInspectionsPage;
