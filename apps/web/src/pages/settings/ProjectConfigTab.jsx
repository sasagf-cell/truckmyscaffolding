import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Layers, FileText, ShieldCheck, Euro } from 'lucide-react';
import { toast } from 'sonner';

// ── Scaffold Systems Catalog ────────────────────────────────────────────────
const SCAFFOLD_SYSTEMS = [
  {
    id: 'layher_allround',
    name: 'Layher Allround',
    manufacturer: 'Layher (DE)',
    type: 'Modular',
    connection: 'Rosette',
    badge: 'Industry Standard',
  },
  {
    id: 'peri_up',
    name: 'PERI UP',
    manufacturer: 'PERI (DE)',
    type: 'Modular',
    connection: 'Cuplock',
  },
  {
    id: 'doka_ringlock',
    name: 'Doka Ringlock',
    manufacturer: 'Doka (AT)',
    type: 'Modular',
    connection: 'Ring',
  },
  {
    id: 'altrad_plettac',
    name: 'Altrad / Plettac SL',
    manufacturer: 'Altrad (FR)',
    type: 'Frame',
    connection: 'Pin',
    badge: 'Balkan Standard',
  },
  {
    id: 'alfix',
    name: 'Alfix',
    manufacturer: 'Alfix (DE)',
    type: 'Modular',
    connection: 'Rosette',
  },
  {
    id: 'tube_coupler',
    name: 'Tube & Coupler',
    manufacturer: 'Universal',
    type: 'Traditional',
    connection: 'Clamp',
  },
];

// ── Contract Types — must match PocketBase SELECT field values exactly ──────
const CONTRACT_TYPES = [
  { value: 'pauschale',    label: 'Lump Sum (LS) — Fixed Price',   unit: null  },
  { value: 'kubikazi',     label: 'Unit Rate — Kubatur (m³)',       unit: 'm³'  },
  { value: 'stundenlohn',  label: 'Time & Materials / Hourly',      unit: 'h'   },
  { value: 'tagessatz',    label: 'Day Rate (Per Diem)',             unit: 'day' },
  { value: 'kombinovano',  label: 'Combined / Mixed',               unit: null  },
];

// ── Inspection Intervals ────────────────────────────────────────────────────
const INSPECTION_INTERVALS = [
  { days: 7, label: '7 days', description: 'Weekly — MHKW / High-risk sites' },
  { days: 14, label: '14 days', description: 'Bi-weekly' },
  { days: 28, label: '28 days', description: 'Monthly — DGUV 201-011 standard' },
];

// ── Component ───────────────────────────────────────────────────────────────
const ProjectConfigTab = () => {
  const { selectedProject } = useOutletContext() ?? {};
  const { getProjectSettings, updateProjectSettings, loading } = useSettings();

  const [config, setConfig] = useState({
    contract_type: '',
    scaffold_system: '',
    inspection_interval_days: 28,
    rate: '',
    rate_currency: 'EUR',
    rate_unit: '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!selectedProject?.id) return;
      const data = await getProjectSettings(selectedProject.id);
      if (data) {
        setConfig({
          contract_type: data.contract_type || '',
          scaffold_system: data.primary_scaffold_system || data.scaffold_system || '',
          inspection_interval_days: data.inspection_interval_days || 28,
          rate: data.rate != null ? String(data.rate) : '',
          rate_currency: data.rate_currency || 'EUR',
          rate_unit: data.rate_unit || '',
        });
      }
    };
    load();
  }, [selectedProject, getProjectSettings]);

  // Auto-set rate_unit from contract_type
  const handleContractTypeChange = (value) => {
    const found = CONTRACT_TYPES.find((c) => c.value === value);
    setConfig((prev) => ({
      ...prev,
      contract_type: value,
      rate_unit: found?.unit || prev.rate_unit,
    }));
    setSaved(false);
  };

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedProject?.id) return;
    setSaving(true);
    try {
      const result = await updateProjectSettings(selectedProject.id, config);
      if (result) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Please select a project to configure it.
        </CardContent>
      </Card>
    );
  }

  const selectedContractType = CONTRACT_TYPES.find((c) => c.value === config.contract_type);
  const selectedSystem = SCAFFOLD_SYSTEMS.find((s) => s.id === config.scaffold_system);

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-300">

      {/* ── Section 1: Contract Type ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Contract Type</CardTitle>
              <CardDescription>Billing model for this project (Lump Sum, Unit Rate, T&amp;M, Day Rate…)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <Label>Contract Model *</Label>
              <Select value={config.contract_type} onValueChange={handleContractTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type…" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="form-group">
              <Label>Currency</Label>
              <Select value={config.rate_currency} onValueChange={(v) => handleChange('rate_currency', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                  <SelectItem value="CHF">CHF — Swiss Franc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rate row — only shown when contract type has a unit */}
          {config.contract_type && config.contract_type !== 'pauschale' && config.contract_type !== 'kombinovano' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="form-group">
                <Label>
                  Rate
                  {selectedContractType?.unit && (
                    <span className="ml-1 text-muted-foreground font-normal">
                      ({config.rate_currency} / {selectedContractType.unit})
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={config.rate}
                    onChange={(e) => handleChange('rate', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <Label>Rate Unit (override)</Label>
                <Input
                  placeholder={selectedContractType?.unit || 'e.g. h, m³, day'}
                  value={config.rate_unit}
                  onChange={(e) => handleChange('rate_unit', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 2: Primary Scaffold System ───────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Primary Scaffold System</CardTitle>
              <CardDescription>Main scaffolding system used on this project site</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SCAFFOLD_SYSTEMS.map((sys) => {
              const isSelected = config.scaffold_system === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => handleChange('scaffold_system', sys.id)}
                  className={`relative text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                  )}
                  <div className="font-semibold text-sm">{sys.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{sys.manufacturer}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">{sys.type}</Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">{sys.connection}</Badge>
                  </div>
                  {sys.badge && (
                    <div className="mt-2">
                      <Badge className="text-xs px-1.5 py-0 bg-primary/10 text-primary border-0">
                        {sys.badge}
                      </Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedSystem && (
            <p className="mt-3 text-sm text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedSystem.name}</span> — {selectedSystem.manufacturer}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Section 3: Inspection Interval ───────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Inspection Interval</CardTitle>
              <CardDescription>
                How often scaffolds must be inspected per DGUV 201-011. This applies to all scaffolds on this project.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {INSPECTION_INTERVALS.map((interval) => {
              const isSelected = Number(config.inspection_interval_days) === interval.days;
              return (
                <button
                  key={interval.days}
                  type="button"
                  onClick={() => handleChange('inspection_interval_days', interval.days)}
                  className={`relative text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                  )}
                  <div className="text-2xl font-bold text-primary">{interval.days}</div>
                  <div className="font-medium text-sm mt-0.5">days</div>
                  <div className="text-xs text-muted-foreground mt-1">{interval.description}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Standard per DGUV Information 201-011 (Jan. 2023) and DIN 4420. Industrial sites typically use 7-day intervals.
          </p>
        </CardContent>
      </Card>

      {/* ── Save ─────────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-2 border-t">
        <Button type="submit" disabled={saving || loading}>
          {saving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Saved</>
          ) : (
            'Save Configuration'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProjectConfigTab;
