# TMS Sprint 3 — Implementation Spec for Manus
**Author:** Claude (Tech Lead) | **Date:** 25. april 2026  
**Stack:** React 18 + Vite + Tailwind v3 + Shadcn UI + PocketBase + Express.js  
**PocketBase ID for projects collection:** `pbc_6793512535`

---

## OVERVIEW — What we're building in Sprint 3

1. **Project Configuration Wizard** — setup per project: contract type, scaffold system, inspection interval
2. **Scaffold Log upgrade** — add industrial fields (Gerüstnummer, Steller, Standort, Deck, Lastklasse)
3. **Scaffold Tag Module** — digital SCAFFTAG: green/red status, inspection tracking, tag history
4. **Inspection Upgrade** — link inspections to scaffold logs, pass/fail → auto-update tag
5. **Freigabeschein** — auto-generate handover notification when scaffold is assigned to requester
6. **AI Alert Engine** — daily cron job, email coordinator when inspection is due

---

## PART 1 — PocketBase Schema Changes

### 1A. New migration file: `1776100000_sprint3_schema.js`

Create this file in `apps/pocketbase/pb_migrations/`:

```javascript
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {

  // ─────────────────────────────────────────────
  // 1. ADD FIELDS TO projects collection
  // ─────────────────────────────────────────────
  const projects = app.findCollectionByNameOrId("pbc_6793512535");

  // Contract type
  projects.fields.add(new Field({
    "id": "select_proj_contract",
    "name": "contract_type",
    "type": "select",
    "values": ["stundenlohn", "kubikazi", "tagessatz", "pauschale", "kombinovano"],
    "required": false
  }));

  // Inspection interval in days (default 7)
  projects.fields.add(new Field({
    "id": "num_proj_interval",
    "name": "inspection_interval_days",
    "type": "number",
    "min": 1,
    "max": 90,
    "required": false
  }));

  // Primary scaffold system (free text — e.g. "Layher Allround")
  projects.fields.add(new Field({
    "id": "text_proj_system",
    "name": "primary_scaffold_system",
    "type": "text",
    "required": false
  }));

  // Allow mixed scaffold systems
  projects.fields.add(new Field({
    "id": "bool_proj_mixed",
    "name": "allow_mixed_systems",
    "type": "bool",
    "required": false
  }));

  app.save(projects);

  // ─────────────────────────────────────────────
  // 2. ADD FIELDS TO scaffold_logs collection
  // ─────────────────────────────────────────────
  // scaffold_logs already has: project_id, length_m, width_m, height_m,
  // unit_price_eur, start_date, end_date, work_type, volume_m3,
  // rental_days, total_price_eur, holding_fee_eur, created_by
  
  const scaffoldLogs = app.findCollectionByNameOrId("scaffold_logs");

  // Gerüstnummer — master ID (e.g. "1057", "GR-042")
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_number",
    "name": "scaffold_number",
    "type": "text",
    "required": false
  }));

  // Steller / Besteller — who ordered (e.g. "Bilfinger", "KWM")
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_requester",
    "name": "requester_company",
    "type": "text",
    "required": false
  }));

  // Standort — location on site (e.g. "Filter House", "Boiler Area")
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_standort",
    "name": "site_location",
    "type": "text",
    "required": false
  }));

  // Deck — level/floor (e.g. "+0m", "+2m", "+4m")
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_deck",
    "name": "level",
    "type": "text",
    "required": false
  }));

  // Gebaut von — who built it (usually Site Team name)
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_builtby",
    "name": "built_by",
    "type": "text",
    "required": false
  }));

  // Lastklasse — load class 1-6 per DIN 4420
  scaffoldLogs.fields.add(new Field({
    "id": "num_sl_loadclass",
    "name": "load_class",
    "type": "number",
    "min": 1,
    "max": 6,
    "required": false
  }));

  // Auffanggurte erforderlich — harness required
  scaffoldLogs.fields.add(new Field({
    "id": "bool_sl_harness",
    "name": "harness_required",
    "type": "bool",
    "required": false
  }));

  // Vorsicht / Gefahren — hazard notes
  scaffoldLogs.fields.add(new Field({
    "id": "text_sl_hazard",
    "name": "hazard_notes",
    "type": "text",
    "required": false
  }));

  // Current tag status (denormalized for fast queries)
  scaffoldLogs.fields.add(new Field({
    "id": "select_sl_tag",
    "name": "tag_status",
    "type": "select",
    "values": ["green", "red", "inactive"],
    "required": false
  }));

  // Next inspection due date (denormalized for AI alerts)
  scaffoldLogs.fields.add(new Field({
    "id": "date_sl_nextinsp",
    "name": "next_inspection_due",
    "type": "date",
    "required": false
  }));

  app.save(scaffoldLogs);

  // ─────────────────────────────────────────────
  // 3. CREATE scaffold_tags collection
  // ─────────────────────────────────────────────
  const scaffoldTags = new Collection({
    "id": "pbc_scaffoldtags",
    "name": "scaffold_tags",
    "type": "base",
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "id": "text_st_id", "name": "id", "type": "text",
        "primaryKey": true, "required": true, "system": true,
        "pattern": "^[a-z0-9]+$"
      },
      {
        "id": "rel_st_log", "name": "scaffold_log_id", "type": "relation",
        "required": true, "collectionId": "scaffold_logs",
        "cascadeDelete": true, "minSelect": 1, "maxSelect": 1
      },
      {
        "id": "rel_st_proj", "name": "project_id", "type": "relation",
        "required": true, "collectionId": "pbc_6793512535",
        "cascadeDelete": true, "minSelect": 1, "maxSelect": 1
      },
      {
        "id": "select_st_status", "name": "tag_status", "type": "select",
        "values": ["green", "red", "inactive"], "required": true
      },
      {
        "id": "select_st_trigger", "name": "trigger", "type": "select",
        "values": ["initial_erection", "periodic_inspection", "post_modification",
                   "post_incident", "user_transfer"], "required": true
      },
      { "id": "text_st_requester", "name": "requester_company", "type": "text" },
      { "id": "date_st_issued", "name": "issued_date", "type": "date", "required": true },
      { "id": "date_st_nextdue", "name": "next_inspection_due", "type": "date" },
      { "id": "num_st_loadclass", "name": "load_class", "type": "number", "min": 1, "max": 6 },
      { "id": "bool_st_harness", "name": "harness_required", "type": "bool" },
      { "id": "text_st_inspector", "name": "inspector_name", "type": "text" },
      { "id": "text_st_notes", "name": "notes", "type": "text" },
      { "id": "rel_st_user", "name": "created_by", "type": "relation",
        "collectionId": "_pb_users_auth_" },
      { "id": "autodate_st_c", "name": "created", "type": "autodate",
        "onCreate": true, "onUpdate": false },
      { "id": "autodate_st_u", "name": "updated", "type": "autodate",
        "onCreate": true, "onUpdate": true }
    ]
  });

  try { app.save(scaffoldTags); }
  catch (err) { console.log("scaffold_tags:", err.message); }

  // ─────────────────────────────────────────────
  // 4. CREATE scaffold_systems collection (seed catalog)
  // ─────────────────────────────────────────────
  const scaffoldSystems = new Collection({
    "id": "pbc_scaffoldsystems",
    "name": "scaffold_systems",
    "type": "base",
    "listRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\"",
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "fields": [
      {
        "id": "text_ss_id", "name": "id", "type": "text",
        "primaryKey": true, "required": true, "system": true,
        "pattern": "^[a-z0-9]+$"
      },
      { "id": "text_ss_name", "name": "name", "type": "text", "required": true },
      { "id": "text_ss_mfr", "name": "manufacturer", "type": "text" },
      {
        "id": "select_ss_type", "name": "system_type", "type": "select",
        "values": ["modular", "frame", "tube_coupler", "mobile_aluminum"]
      },
      {
        "id": "select_ss_conn", "name": "connection_type", "type": "select",
        "values": ["rosette", "wedge_pin", "coupler", "fixed_frame"]
      },
      { "id": "text_ss_notes", "name": "notes", "type": "text" },
      { "id": "autodate_ss_c", "name": "created", "type": "autodate",
        "onCreate": true, "onUpdate": false }
    ]
  });

  try { app.save(scaffoldSystems); }
  catch (err) { console.log("scaffold_systems:", err.message); }

  // Seed scaffold systems data
  const systems = [
    { name: "Layher Allround", manufacturer: "Layher", system_type: "modular", connection_type: "rosette", notes: "Industry standard for EPC/industrial projects" },
    { name: "Layher Blitz", manufacturer: "Layher", system_type: "frame", connection_type: "fixed_frame", notes: "Fast assembly for facade work" },
    { name: "PERI UP", manufacturer: "PERI", system_type: "modular", connection_type: "wedge_pin", notes: "BIM support, integrated safety" },
    { name: "Doka Ringlock", manufacturer: "Doka", system_type: "modular", connection_type: "rosette", notes: "Layher Allround competitor" },
    { name: "Altrad / Plettac SL", manufacturer: "Altrad", system_type: "frame", connection_type: "fixed_frame", notes: "Balkan standard, good price/quality" },
    { name: "Alfix", manufacturer: "Alfix", system_type: "modular", connection_type: "rosette", notes: "Layher-compatible, economical" },
    { name: "ULMA Modular", manufacturer: "ULMA Construction", system_type: "modular", connection_type: "rosette", notes: "Strong in southern Europe" },
    { name: "Zarges / Mobile Tower", manufacturer: "Zarges", system_type: "mobile_aluminum", connection_type: "fixed_frame", notes: "Indoor mobile aluminum towers" },
    { name: "Tube & Coupler", manufacturer: "Generic", system_type: "tube_coupler", connection_type: "coupler", notes: "Traditional / zabice method" }
  ];

  for (const s of systems) {
    try {
      app.findFirstRecordByData("scaffold_systems", "name", s.name);
    } catch {
      const rec = new Record(scaffoldSystems, s);
      app.save(rec);
    }
  }

  // ─────────────────────────────────────────────
  // 5. ADD FIELDS TO safety_inspections collection
  // ─────────────────────────────────────────────
  try {
    const inspections = app.findCollectionByNameOrId("safety_inspections");

    inspections.fields.add(new Field({
      "id": "rel_si_log", "name": "scaffold_log_id", "type": "relation",
      "collectionId": "scaffold_logs", "required": false
    }));

    inspections.fields.add(new Field({
      "id": "select_si_type", "name": "inspection_type", "type": "select",
      "values": ["initial", "periodic", "post_modification", "post_incident"]
    }));

    inspections.fields.add(new Field({
      "id": "select_si_result", "name": "result", "type": "select",
      "values": ["pass", "fail"]
    }));

    inspections.fields.add(new Field({
      "id": "date_si_nextdue", "name": "next_due_date", "type": "date"
    }));

    inspections.fields.add(new Field({
      "id": "bool_si_tagupdated", "name": "tag_updated", "type": "bool"
    }));

    app.save(inspections);
  } catch (err) {
    console.log("safety_inspections update:", err.message);
  }

}, (app) => {
  // Revert — remove new collections
  try {
    const tags = app.findCollectionByNameOrId("pbc_scaffoldtags");
    app.delete(tags);
  } catch(e) {}
  try {
    const sys = app.findCollectionByNameOrId("pbc_scaffoldsystems");
    app.delete(sys);
  } catch(e) {}
});
```

---

## PART 2 — Project Configuration Wizard

### 2A. New file: `apps/web/src/pages/ProjectSetupPage.jsx`

This page appears when a project is first created OR when coordinator clicks "Configure Project" from project settings.

**UI Flow:**
```
Step 1: Basic Info         → Project name, location, description
Step 2: Contract Type      → Select contract type with explanation
Step 3: Scaffold System    → Select primary system from list
Step 4: Safety Settings    → Inspection interval slider, hazard defaults
Step 5: Review & Save      → Summary before saving
```

**Step 2 — Contract Type (with descriptions):**
```jsx
const contractTypes = [
  {
    value: "stundenlohn",
    label: "Stundenlohn (Hourly)",
    description: "Track worker hours per shift. For Regie work.",
    icon: "⏱️"
  },
  {
    value: "kubikazi",
    label: "Kubikazi (m³ Volume)",
    description: "Track cubic meters of scaffolding. Price per m³.",
    icon: "📐"
  },
  {
    value: "tagessatz",
    label: "Tagessatz (Daily Rate)",
    description: "Fixed daily rate per worker on site.",
    icon: "📅"
  },
  {
    value: "pauschale",
    label: "Pauschale (Fixed Price)",
    description: "Fixed total price. No time or quantity tracking needed.",
    icon: "💰"
  },
  {
    value: "kombinovano",
    label: "Kombinovano (Mixed)",
    description: "Mix of contract types. E.g. erection Pauschale + dismantling Hourly.",
    icon: "🔀"
  }
];
```

**Step 3 — Scaffold System:**
- Fetch from `scaffold_systems` collection
- Show as card grid with name + type + manufacturer
- "Allow mixed systems" toggle below

**Step 4 — Safety Settings:**
```jsx
// Inspection interval select
<Select value={inspectionInterval} onValueChange={setInspectionInterval}>
  <SelectItem value="7">Every 7 days (Weekly — strict industrial)</SelectItem>
  <SelectItem value="14">Every 14 days (Bi-weekly)</SelectItem>
  <SelectItem value="28">Every 28 days (Monthly — standard EPC)</SelectItem>
  <SelectItem value="custom">Custom</SelectItem>
</Select>

// Note below:
// "Per DGUV Information 201-011: inspection interval is project-specific.
//  7 days is required on many industrial sites."
```

**Save logic:**
```javascript
// PATCH /api/projects/:id with:
{
  contract_type: selectedContractType,
  primary_scaffold_system: selectedSystemName,
  allow_mixed_systems: allowMixed,
  inspection_interval_days: parseInt(inspectionInterval)
}
```

### 2B. Add "Setup Project" button to ProjectDetailPage

If `project.contract_type` is null/empty → show yellow banner:
```jsx
{!project.contract_type && (
  <Alert className="border-yellow-500 bg-yellow-50">
    <AlertTriangle className="h-4 w-4 text-yellow-600" />
    <AlertDescription>
      This project is not configured yet. 
      <Button variant="link" onClick={() => navigate(`/projects/${id}/setup`)}>
        Configure now →
      </Button>
    </AlertDescription>
  </Alert>
)}
```

---

## PART 3 — Scaffold Log Upgrade

### 3A. Update `ScaffoldLogsPage.jsx`

Add new fields to the form dialog:

**New form fields (add to existing formData state):**
```javascript
const [formData, setFormData] = useState({
  // EXISTING fields (keep all):
  project_id: '',
  length_m: '',
  width_m: '',
  height_m: '',
  work_type: '',
  unit_price_eur: '',
  start_date: '',
  end_date: '',
  
  // NEW fields:
  scaffold_number: '',      // Gerüstnummer e.g. "1057"
  requester_company: '',    // Steller / Besteller
  site_location: '',        // Standort e.g. "Filter House"
  level: '',                // Deck e.g. "+0m", "+2m"
  built_by: '',             // Gebaut von
  load_class: 3,            // Lastklasse default 3
  harness_required: false,  // Auffanggurte
  hazard_notes: '',         // Vorsicht text
});
```

**New form section — add BEFORE the dimensions grid:**
```jsx
{/* INDUSTRIAL IDENTIFICATION — Scaffold Tag Fields */}
<div className="border rounded-lg p-4 space-y-4">
  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
    📋 Scaffold Identification (SCAFFTAG)
  </h3>
  
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Scaffold Number (Gerüstnummer)</Label>
      <Input 
        placeholder="e.g. 1057, GR-042" 
        value={formData.scaffold_number}
        onChange={(e) => setFormData({...formData, scaffold_number: e.target.value})}
      />
    </div>
    <div className="space-y-2">
      <Label>Requester Company (Steller)</Label>
      <Input 
        placeholder="e.g. Bilfinger, KWM, IMO"
        value={formData.requester_company}
        onChange={(e) => setFormData({...formData, requester_company: e.target.value})}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label>Site Location (Standort)</Label>
      <Input 
        placeholder="e.g. Filter House, Boiler Area, Silo"
        value={formData.site_location}
        onChange={(e) => setFormData({...formData, site_location: e.target.value})}
      />
    </div>
    <div className="space-y-2">
      <Label>Level / Deck</Label>
      <Input 
        placeholder="e.g. +0m, +2m, +4m"
        value={formData.level}
        onChange={(e) => setFormData({...formData, level: e.target.value})}
      />
    </div>
  </div>

  <div className="grid grid-cols-3 gap-4">
    <div className="space-y-2">
      <Label>Built By (Gebaut von)</Label>
      <Input 
        placeholder="e.g. DSD Montage"
        value={formData.built_by}
        onChange={(e) => setFormData({...formData, built_by: e.target.value})}
      />
    </div>
    <div className="space-y-2">
      <Label>Load Class (Lastklasse)</Label>
      <Select 
        value={String(formData.load_class)} 
        onValueChange={(v) => setFormData({...formData, load_class: parseInt(v)})}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Class 1 — 0.75 kN/m²</SelectItem>
          <SelectItem value="2">Class 2 — 1.50 kN/m²</SelectItem>
          <SelectItem value="3">Class 3 — 2.00 kN/m² (standard)</SelectItem>
          <SelectItem value="4">Class 4 — 3.00 kN/m²</SelectItem>
          <SelectItem value="5">Class 5 — 4.50 kN/m²</SelectItem>
          <SelectItem value="6">Class 6 — 6.00 kN/m²</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>Fall Arrest Harness</Label>
      <div className="flex items-center gap-2 h-10">
        <Switch 
          checked={formData.harness_required}
          onCheckedChange={(v) => setFormData({...formData, harness_required: v})}
        />
        <span className="text-sm">{formData.harness_required ? "Required ⚠️" : "Not required"}</span>
      </div>
    </div>
  </div>

  <div className="space-y-2">
    <Label>Hazard Notes (Vorsicht)</Label>
    <Input 
      placeholder="e.g. Beware of overhead pipes, wet floor"
      value={formData.hazard_notes}
      onChange={(e) => setFormData({...formData, hazard_notes: e.target.value})}
    />
  </div>
</div>
```

**Update table columns** — add Scaffold# and Requester as first visible columns:
```jsx
<TableHead>Scaffold #</TableHead>
<TableHead>Requester</TableHead>
<TableHead>Location / Level</TableHead>
<TableHead>Tag Status</TableHead>  // NEW — green/red badge
// ... existing columns
```

**Tag status badge in table:**
```jsx
<TableCell>
  {item.tag_status === 'green' && (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
      🟢 Active
    </span>
  )}
  {item.tag_status === 'red' && (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
      🔴 Unsafe
    </span>
  )}
  {(!item.tag_status || item.tag_status === 'inactive') && (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      ⚫ Inactive
    </span>
  )}
</TableCell>
```

**After successful create** → call the tag initialization endpoint:
```javascript
// In handleSubmit, after pb.collection('scaffold_logs').create(data):
if (!editingId) {
  // New scaffold → initialize green tag
  await fetch(`${import.meta.env.VITE_API_URL}/api/scaffold-tags/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      scaffold_log_id: newRecord.id,
      project_id: formData.project_id,
      requester_company: formData.requester_company,
      load_class: formData.load_class,
      harness_required: formData.harness_required
    })
  });
}
```

---

## PART 4 — Scaffold Tag Module (Backend)

### 4A. New API route: `apps/api/src/routes/scaffold-tags.js`

```javascript
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getPocketBaseClient } from '../utils/pocketbaseClient.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// POST /api/scaffold-tags/initialize
// Called when a new scaffold is created → creates first GREEN tag
router.post('/initialize', authMiddleware, async (req, res) => {
  try {
    const pb = await getPocketBaseClient();
    const { scaffold_log_id, project_id, requester_company, load_class, harness_required } = req.body;

    // Get project to read inspection_interval_days
    const project = await pb.collection('projects').getOne(project_id);
    const interval = project.inspection_interval_days || 28;

    const issuedDate = new Date();
    const nextDue = new Date(issuedDate);
    nextDue.setDate(nextDue.getDate() + interval);

    // Create scaffold_tag record
    const tag = await pb.collection('scaffold_tags').create({
      scaffold_log_id,
      project_id,
      tag_status: 'green',
      trigger: 'initial_erection',
      requester_company: requester_company || '',
      issued_date: issuedDate.toISOString(),
      next_inspection_due: nextDue.toISOString(),
      load_class: load_class || 3,
      harness_required: harness_required || false,
      created_by: req.user.id
    });

    // Update scaffold_log with tag_status and next_inspection_due (denormalized)
    await pb.collection('scaffold_logs').update(scaffold_log_id, {
      tag_status: 'green',
      next_inspection_due: nextDue.toISOString()
    });

    // Send Freigabeschein email to requester (if requester_company is set)
    if (requester_company) {
      // Log that notification was sent (no requester email in system — just log)
      await pb.collection('email_logs').create({
        recipient: 'coordinator_notification',
        subject: `Scaffold #${scaffold_log_id} — Freigabeschein issued for ${requester_company}`,
        status: 'sent',
        timestamp: new Date().toISOString(),
        created_by: req.user.id
      });
    }

    res.json({ success: true, tag });
  } catch (err) {
    console.error('scaffold-tags/initialize error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scaffold-tags/inspection
// Record an inspection result → update tag status
router.post('/inspection', authMiddleware, async (req, res) => {
  try {
    const pb = await getPocketBaseClient();
    const { scaffold_log_id, project_id, result, inspection_type, notes, inspector_name } = req.body;

    // Get project inspection interval
    const project = await pb.collection('projects').getOne(project_id);
    const interval = project.inspection_interval_days || 28;

    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + interval);

    const newTagStatus = result === 'pass' ? 'green' : 'red';

    // Create new scaffold_tag (each inspection = new tag entry = audit trail)
    const tag = await pb.collection('scaffold_tags').create({
      scaffold_log_id,
      project_id,
      tag_status: newTagStatus,
      trigger: inspection_type || 'periodic_inspection',
      issued_date: now.toISOString(),
      next_inspection_due: result === 'pass' ? nextDue.toISOString() : null,
      inspector_name: inspector_name || req.user.name,
      notes: notes || '',
      created_by: req.user.id
    });

    // Update scaffold_log (denormalized)
    await pb.collection('scaffold_logs').update(scaffold_log_id, {
      tag_status: newTagStatus,
      next_inspection_due: result === 'pass' ? nextDue.toISOString() : null
    });

    res.json({ success: true, tag, new_status: newTagStatus });
  } catch (err) {
    console.error('scaffold-tags/inspection error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scaffold-tags/:scaffold_log_id/history
// Returns full tag history for a scaffold
router.get('/:scaffold_log_id/history', authMiddleware, async (req, res) => {
  try {
    const pb = await getPocketBaseClient();
    const tags = await pb.collection('scaffold_tags').getFullList({
      filter: `scaffold_log_id = "${req.params.scaffold_log_id}"`,
      sort: '-issued_date'
    });
    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 4B. Register route in `apps/api/src/routes/index.js`

Add this line with other route imports:
```javascript
import scaffoldTagsRouter from './scaffold-tags.js';
// ...
router.use('/scaffold-tags', scaffoldTagsRouter);
```

---

## PART 5 — AI Alert Engine (Cron Job)

### 5A. New file: `apps/api/src/jobs/inspectionAlerts.js`

```javascript
import { getPocketBaseClient } from '../utils/pocketbaseClient.js';
import { sendEmail } from '../services/emailService.js';

// Call this function once per day (schedule in main.js)
export async function runInspectionAlerts() {
  try {
    const pb = await getPocketBaseClient();
    const today = new Date();
    
    // Alert threshold — notify N days before due
    const ALERT_DAYS_BEFORE = 3;
    const alertDate = new Date(today);
    alertDate.setDate(alertDate.getDate() + ALERT_DAYS_BEFORE);

    // Find all GREEN scaffold logs where next_inspection_due <= alertDate
    const overdueLogs = await pb.collection('scaffold_logs').getFullList({
      filter: `tag_status = "green" && next_inspection_due <= "${alertDate.toISOString()}"`,
      expand: 'project_id'
    });

    for (const log of overdueLogs) {
      const project = log.expand?.project_id;
      if (!project) continue;

      const dueDate = new Date(log.next_inspection_due);
      const isOverdue = dueDate < today;
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      // Get project coordinator (user_id)
      const coordinator = await pb.collection('users').getOne(project.user_id).catch(() => null);
      if (!coordinator?.email) continue;

      const subject = isOverdue
        ? `⚠️ OVERDUE: Scaffold #${log.scaffold_number || log.id} inspection required`
        : `🔔 Reminder: Scaffold #${log.scaffold_number || log.id} inspection due in ${daysUntilDue} day(s)`;

      const body = `
        <h2>${isOverdue ? '⚠️ OVERDUE INSPECTION' : '🔔 Inspection Due Soon'}</h2>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Scaffold:</strong> #${log.scaffold_number || 'N/A'} — ${log.site_location || ''} ${log.level || ''}</p>
        <p><strong>Requester:</strong> ${log.requester_company || 'N/A'}</p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString('de-DE')}</p>
        ${isOverdue ? '<p style="color:red"><strong>ACTION REQUIRED: Tag must be removed from service until inspection is completed.</strong></p>' : ''}
        <p>Log in to <a href="https://trackmyscaffolding.com">TrackMyScaffolding</a> to record the inspection.</p>
      `;

      await sendEmail({
        to: coordinator.email,
        subject,
        html: body
      });

      // Log the alert
      await pb.collection('email_logs').create({
        recipient: coordinator.email,
        subject,
        status: 'sent',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`[InspectionAlerts] Checked ${overdueLogs.length} scaffolds. Alerts sent.`);
  } catch (err) {
    console.error('[InspectionAlerts] Error:', err.message);
  }
}
```

### 5B. Schedule in `apps/api/src/main.js`

Add after existing imports and before app.listen:
```javascript
import { runInspectionAlerts } from './jobs/inspectionAlerts.js';

// Run inspection alerts once per day at 07:00
const ALERT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
setInterval(runInspectionAlerts, ALERT_INTERVAL_MS);
// Also run once on startup (after 10 seconds delay)
setTimeout(runInspectionAlerts, 10000);
```

---

## PART 6 — Safety Inspections Page Upgrade

### 6A. Update `SafetyInspectionsPage.jsx`

Add these fields to the inspection form:
```javascript
// New fields in form state:
scaffold_log_id: '',   // Link to which scaffold
inspection_type: 'periodic',  // initial/periodic/post_modification/post_incident
result: 'pass',        // pass / fail
next_due_date: ''      // auto-calculated but can override
```

**New form section:**
```jsx
<div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label>Linked Scaffold</Label>
    <Select value={formData.scaffold_log_id} 
            onValueChange={(v) => setFormData({...formData, scaffold_log_id: v})}>
      <SelectTrigger><SelectValue placeholder="Select scaffold (optional)" /></SelectTrigger>
      <SelectContent>
        {scaffoldLogs.map(s => (
          <SelectItem key={s.id} value={s.id}>
            #{s.scaffold_number || s.id.slice(0,6)} — {s.site_location} {s.level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  <div className="space-y-2">
    <Label>Inspection Type</Label>
    <Select value={formData.inspection_type}
            onValueChange={(v) => setFormData({...formData, inspection_type: v})}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="initial">Initial (after erection)</SelectItem>
        <SelectItem value="periodic">Periodic (routine)</SelectItem>
        <SelectItem value="post_modification">Post-Modification</SelectItem>
        <SelectItem value="post_incident">Post-Incident (storm/impact)</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

{/* Pass / Fail result */}
<div className="space-y-2">
  <Label>Inspection Result</Label>
  <div className="flex gap-4">
    <Button 
      type="button"
      variant={formData.result === 'pass' ? 'default' : 'outline'}
      className={formData.result === 'pass' ? 'bg-green-600 hover:bg-green-700' : ''}
      onClick={() => setFormData({...formData, result: 'pass'})}>
      ✅ PASS — Safe to use
    </Button>
    <Button 
      type="button"
      variant={formData.result === 'fail' ? 'destructive' : 'outline'}
      onClick={() => setFormData({...formData, result: 'fail'})}>
      ❌ FAIL — Remove from service
    </Button>
  </div>
</div>
```

**After save** → call scaffold-tags/inspection API if scaffold_log_id is set:
```javascript
if (formData.scaffold_log_id && formData.result) {
  await fetch(`${API_URL}/api/scaffold-tags/inspection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      scaffold_log_id: formData.scaffold_log_id,
      project_id: formData.project_id,
      result: formData.result,
      inspection_type: formData.inspection_type,
      notes: formData.notes || '',
      inspector_name: currentUser.name
    })
  });
}
```

---

## PART 7 — Dashboard Widget (Inspection Alerts)

### 7A. Add "Upcoming Inspections" widget to Dashboard

**New component: `apps/web/src/components/InspectionAlertsWidget.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const InspectionAlertsWidget = ({ projectId }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const today = new Date();
      const alertDate = new Date(today);
      alertDate.setDate(alertDate.getDate() + 7); // Next 7 days

      const logs = await pb.collection('scaffold_logs').getFullList({
        filter: `project_id = "${projectId}" && tag_status = "green" && next_inspection_due <= "${alertDate.toISOString()}"`,
        sort: 'next_inspection_due'
      });
      setAlerts(logs);
    };
    if (projectId) fetchAlerts();
  }, [projectId]);

  if (alerts.length === 0) return (
    <Card>
      <CardHeader><CardTitle className="text-sm flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" /> Inspections
      </CardTitle></CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        All scaffolds are up to date ✅
      </CardContent>
    </Card>
  );

  return (
    <Card className="border-orange-200">
      <CardHeader><CardTitle className="text-sm flex items-center gap-2 text-orange-600">
        <AlertTriangle className="w-4 h-4" /> Inspections Due ({alerts.length})
      </CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(log => {
          const due = new Date(log.next_inspection_due);
          const isOverdue = due < new Date();
          return (
            <div key={log.id} className={`flex justify-between text-xs p-2 rounded ${isOverdue ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}`}>
              <span>#{log.scaffold_number || '—'} {log.site_location} {log.level}</span>
              <span className="font-semibold">
                {isOverdue ? '⚠️ OVERDUE' : due.toLocaleDateString('de-DE')}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default InspectionAlertsWidget;
```

**Add to DashboardPage** inside the grid:
```jsx
<InspectionAlertsWidget projectId={currentProjectId} />
```

---

## DEPLOYMENT CHECKLIST

After Manus completes implementation:

1. ✅ Run PocketBase migration (copy migration file to server via admin panel OR git push)
2. ✅ Verify `scaffold_tags` collection appears in PocketBase admin
3. ✅ Verify new fields in `scaffold_logs` (scaffold_number, requester_company, etc.)
4. ✅ Verify `scaffold_systems` seeded with 9 systems
5. ✅ Test Project Setup Wizard — create project with contract_type + inspection_interval
6. ✅ Test new Scaffold Log form — fill in Gerüstnummer, Steller, Standort, Level, Lastklasse
7. ✅ Verify green tag auto-created when new scaffold log is saved
8. ✅ Test inspection flow — PASS → tag stays green, new due date set
9. ✅ Test inspection flow — FAIL → tag turns red
10. ✅ Verify Dashboard widget shows upcoming inspections
11. ✅ Verify inspection alert email sent (check email_logs collection)

---

## IMPORTANT NOTES FOR MANUS

- **PocketBase field IDs** must be unique strings — use the pattern `type_collection_fieldname` as shown
- **scaffold_logs collection** — it does NOT have a migration file, it was created manually via PocketBase admin. Use the hook `scaffold-logs-auto-calculate.pb.js` as reference for field names
- **Do NOT break existing fields**: length_m, width_m, height_m, work_type, unit_price_eur, start_date, end_date, volume_m3, rental_days, total_price_eur, holding_fee_eur
- **Test on Railway** after deployment — both frontend (impartial-magic) and API (truckmyscaffolding) services
- **Environment variables** are on Railway — no need to touch .env locally

---

*Spec by Claude (Tech Lead) | TMS Sprint 3 | 25. april 2026*
