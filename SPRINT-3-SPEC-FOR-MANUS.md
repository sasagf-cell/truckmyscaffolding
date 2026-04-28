# TMS Sprint 3 — Implementation Spec (Updated)
**Author:** Claude (Tech Lead) | **Updated:** 27. april 2026  
**Stack:** React 18 + Vite + Tailwind v3 + Shadcn UI + PocketBase + Express.js  
**Deployment:** Vercel (frontend) + Railway (API) + Hostinger (PocketBase)  
**Repo:** github.com/sasagf-cell/truckmyscaffolding | branch: `main`

---

## SPRINT 3 STATUS

| Epic | Task | Status |
|---|---|---|
| A | Project Configuration Wizard | ✅ DONE |
| B | Scaffold Tag Module | ✅ DONE |
| C | Inspection Upgrade (scaffold_log_id linking + interval) | ✅ DONE |
| D | AI Alert Engine (cron + email) | ✅ DONE |
| — | Bug fixes: timezone, QR loop, modal reset, notification dedup | ✅ DONE |
| — | Filter injection hardening (all PocketBase queries) | ✅ DONE |
| — | Vercel migration + DNS | ✅ DONE |
| — | Worker Hours week/month/all filter | ✅ DONE |
| — | Risk Score overdueInspections → real scaffold_tags data | ✅ DONE |

---

## ACTUAL IMPLEMENTED SCHEMA

### PocketBase Collections (live on production)

**`projects`** — extended with:
```
contract_type           select  [stundenlohn, kubikazi, tagessatz, pauschale, kombinovano]
inspection_interval_days number  default 28, range 1–90
primary_scaffold_system text    e.g. "Layher Allround"
allow_mixed_systems     bool
```

**`scaffold_logs`** — extended with:
```
scaffold_number         text    Gerüstnummer (e.g. "1057", "GR-042")
requester_company       text    Steller/Besteller (e.g. "Bilfinger", "KWM")
site_location           text    Standort (e.g. "Filter House", "Boiler Area")
level                   text    Deck (e.g. "+0m", "+2m")
built_by                text    Gebaut von (e.g. "DSD Montage")
load_class              number  Lastklasse 1–6 (default 3 = 2.00 kN/m²)
harness_required        bool    Auffanggurte erforderlich
hazard_notes            text    Vorsicht / Gefahren
tag_status              select  [green, red, inactive] — denormalized from scaffold_tags
next_inspection_due     date    denormalized from latest scaffold_tag
```

**`scaffold_tags`** — new collection:
```
scaffold_log_id         relation → scaffold_logs (cascadeDelete)
project_id              relation → projects (cascadeDelete)
tag_status              select   [green, red, inactive] required
trigger                 select   [initial_erection, periodic_inspection, 
                                  post_modification, post_incident, user_transfer]
requester_company       text
issued_date             date     required
next_inspection_due     date
load_class              number   1–6
harness_required        bool
inspector_name          text
notes                   text
created_by              relation → users
```
> Each inspection creates a NEW scaffold_tag record — full audit trail.  
> Tag accumulates 6-8+ rows over lifetime. The latest is the active status.

**`inspections`** — extended with (Sprint 3C):
```
scaffold_log_id         relation → scaffold_logs (nullable, backward compat)
project_id              text
status                  select   [pass, fail]
next_inspection_date    date     auto-calculated from intervalDays
inspection_type         select   [initial, periodic, post_modification, post_incident]
checklist               json
notes                   text
inspector_id            relation → users
tag_updated             bool
```

---

## IMPLEMENTED FILES

### Frontend (apps/web/src/)

| File | Description |
|---|---|
| `pages/ScaffoldTagsPage.jsx` | Tag list, status cards (green/red/inactive), QR print, edit modal, history |
| `pages/settings/ProjectConfigTab.jsx` | Project Configuration Wizard — contract type, scaffold system, inspection interval |
| `features/inspections/src/services/inspectionService.js` | create/getByProjectId/getByScaffoldLogId — auto scaffold_tag update on pass/fail |
| `features/inspections/src/hooks/useInspections.js` | project-level + scaffold-log-level filtering, intervalDays aware |
| `features/notifications/hooks/useNotifications.js` | Deduplication between scaffold_tags + inspections sources |

### Backend (apps/api/src/)
- scaffold-tags route: `/api/scaffold-tags/initialize`, `/api/scaffold-tags/inspection`, `/:id/history`
- AI Alert cron: `jobs/inspectionAlerts.js` — daily run, checks `next_inspection_due <= today+3d`

---

## SCAFFOLD SYSTEM CATALOG (hardcoded in ProjectConfigTab)

```
layher_allround   → Layher (DE) | Modular | Rosette  [Industry Standard]
peri_up           → PERI (DE)   | Modular | Cuplock
doka_ringlock     → Doka (AT)   | Modular | Ring
altrad_plettac    → Altrad (FR) | Frame   | Pin      [Balkan Standard]
alfix             → Alfix (DE)  | Modular | Rosette
tube_coupler      → Universal   | Traditional | Clamp
```

---

## RISK SCORE FORMULA (live on Dashboard)

```
score = 100
  - (overdueInspections     × 15)   ← scaffold_tags: status="green" && next_inspection_due < today
  - (pendingRequestsOver48h × 10)   ← scaffold_requests: status="Pending" && created < (now - 48h)
  - (missingDiaryEntries    × 5)    ← diary_entries: missing weekdays in last 7 days
  - (alertCount             × 8)    ← useAlerts hook

clamp(0, 100)
```

---

## DOMAIN KNOWLEDGE (for future Manus tasks)

- **Gerüstnummer** = master ID tying tag + request + billing (e.g. "1057")
- **Steller/Besteller/Kontraktor** = same — the company USING the scaffold (Bilfinger, KWM, IMO)
- **Gebaut von / Site Team** = company BUILDING it (DSD Montage) — only they may modify
- **Modifikation** = can be for same or new user — always requires new inspection + new tag
- **Inspection interval** = project-configurable (MHKW: 7 days, EPC standard: 28 days)
- **Freigabeschein** = legal handover doc, mandatory on site ("muss vorhanden sein")
- **Lastklasse 3 (2.00 kN/m²)** = industrial project standard (DIN 4420-1)
- **"Om"** = level +0m (ground floor), not a company name
- **Tag history** = accumulates 6-8+ inspection rows per tag — never replace, always append

---

## PENDING — SPRINT 4 CANDIDATES

| Item | Priority | Notes |
|---|---|---|
| Freigabeschein PDF generation | High | Auto-generate PDF when scaffold assigned to requester |
| AI PDF Import | Medium | Upload Gerüstanforderung → auto-parse → scaffold record |
| Smart Site Diary AI | Medium | AI suggestions based on previous entries |
| Multi-project support | Medium | Already architected, needs UI |
| Inventory / Lager module | Low | scaffold_inventory collection per system (V2) |
| Risk Score → PocketBase persistence | Low | Replace localStorage trend with DB snapshot |
| SafetyInspections page | — | Check if `SafetyInspectionsPage.jsx` exists; inspectionService uses `inspections` collection |

---

## DEPLOYMENT REFERENCE (current, april 2026)

| Layer | Service | URL |
|---|---|---|
| Frontend | Vercel `truckmyscaffolding` | trackmyscaffolding.com |
| API | Railway `truckmyscaffolding` | truckmyscaffolding-production.up.railway.app |
| PocketBase | Hostinger Horizons | trackmyscaffolding.com/hcgi/platform |
| Email | Resend | noreply@trackmyscaffolding.com (verified) |

> ⚠️ `impartial-magic` Railway service = DELETED (was old frontend, migrated to Vercel Apr 27)  
> ⚠️ `netlify.toml` = DELETED (Netlify deprecated)

---

*Spec by Claude (Tech Lead) | TMS Sprint 3 complete | Updated 27. april 2026*
