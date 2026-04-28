import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Loader2, ClipboardList } from 'lucide-react';

const CHECKLIST_ITEMS = [
  { key: 'base_plates', label: 'Base plates & sole boards' },
  { key: 'uprights', label: 'Uprights / standards (vertical tubes)' },
  { key: 'guard_rails', label: 'Guard rails (top + mid rail)' },
  { key: 'toe_boards', label: 'Toe boards (Fußleisten)' },
  { key: 'platform_boards', label: 'Platform boards (secure, no gaps)' },
  { key: 'bracing', label: 'Diagonal bracing intact' },
  { key: 'ties', label: 'Wall ties / anchors in place' },
  { key: 'access', label: 'Safe access & egress ladder' },
];

/**
 * Inspection entry form — Sprint 3C upgraded.
 * @param {Function} props.onSubmit
 * @param {boolean} props.isLoading
 * @param {number} props.intervalDays - Project inspection interval for next_due display
 * @param {Object|null} props.selectedScaffold - Current scaffold log (for display)
 */
const InspectionForm = ({ onSubmit, isLoading, intervalDays = 28, selectedScaffold }) => {
  const [status, setStatus] = useState('pass');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState(
    Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, true]))
  );

  const handleChecklistChange = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const failedItems = CHECKLIST_ITEMS.filter(i => !checklist[i.key]);
  const allPassed = failedItems.length === 0;

  // Auto-suggest fail if checklist items failed
  const effectiveStatus = !allPassed && status === 'pass' ? 'warning' : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + intervalDays);

    onSubmit({
      status,
      notes,
      checklist,
      next_inspection_date: nextDue.toISOString(),
    });

    // Reset form
    setNotes('');
    setChecklist(Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.key, true])));
    setStatus('pass');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="w-4 h-4 text-primary" />
          New Inspection Record
        </CardTitle>
        {selectedScaffold && (
          <div className="text-sm text-muted-foreground">
            Scaffold:{' '}
            <span className="font-semibold text-foreground">
              {selectedScaffold.scaffold_number || `LOG-${selectedScaffold.id?.slice(-4).toUpperCase()}`}
            </span>
            {selectedScaffold.location && ` · ${selectedScaffold.location}`}
          </div>
        )}
        {!selectedScaffold && (
          <p className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded px-2 py-1">
            Select a scaffold above to link this inspection to a specific tag.
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Status selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Inspection Result</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('pass')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  status === 'pass'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-border hover:border-green-300 text-muted-foreground'
                }`}
              >
                <ShieldCheck className={`w-6 h-6 ${status === 'pass' ? 'text-green-600' : 'text-muted-foreground'}`} />
                PASS
                <span className="text-xs font-normal opacity-70">Safe to use</span>
              </button>
              <button
                type="button"
                onClick={() => setStatus('fail')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-semibold text-sm transition-all ${
                  status === 'fail'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-border hover:border-red-300 text-muted-foreground'
                }`}
              >
                <ShieldAlert className={`w-6 h-6 ${status === 'fail' ? 'text-red-600' : 'text-muted-foreground'}`} />
                FAIL
                <span className="text-xs font-normal opacity-70">Do not use</span>
              </button>
            </div>
            {effectiveStatus === 'warning' && (
              <p className="text-xs text-orange-600 mt-1.5">
                ⚠ {failedItems.length} checklist item(s) failed — consider setting result to FAIL.
              </p>
            )}
          </div>

          {/* Checklist */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Safety Checklist
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({CHECKLIST_ITEMS.length - failedItems.length}/{CHECKLIST_ITEMS.length} OK)
              </span>
            </Label>
            <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/30">
              {CHECKLIST_ITEMS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer group py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={checklist[key]}
                    onChange={() => handleChecklistChange(key)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className={`text-sm ${!checklist[key] ? 'text-red-600 dark:text-red-400 line-through opacity-70' : 'text-foreground'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="insp-notes" className="text-sm font-medium mb-1.5 block">
              Inspector Notes
            </Label>
            <Textarea
              id="insp-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Site observations, defects found, corrective actions required…"
              className="min-h-[80px]"
            />
          </div>

          {/* Next inspection info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
            <span>Next inspection due after save:</span>
            <Badge variant="outline" className="text-xs">
              +{intervalDays} days
            </Badge>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            ) : (
              `Save Inspection${selectedScaffold ? ' + Update Tag' : ''}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InspectionForm;
