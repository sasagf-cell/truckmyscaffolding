# TrackMyScaffolding — Session Report
**Datum:** 24. april 2026  
**Trajanje:** Cijeli dan (dva dijela sesije)

---

## ✅ Završeno danas

### 1. Custom Domain — trackmyscaffolding.com
- Konfigurisan Hostinger DNS: ALIAS record za apex domain + TXT verification za Railway
- Railway `impartial-magic` servis sada servira na `trackmyscaffolding.com`
- **Status:** ✅ Live i radi

### 2. Codebase Audit — Full Mental Model
- Napravljena kompletna mapa arhitekture (snimljeno u memory)
- Identifikovani anti-pattersi i potencijalni crash-evi
- Sve snimljeno u `memory/project_tms_architecture.md`

### 3. Bug Fixes — Proaktivno

| Bug | Fajl | Fix |
|-----|------|-----|
| `useOutletContext()` crash u Settings tabovima | `SettingsLayout.jsx` | Dodan `useOutletContext` + pass-through na `<Outlet>` |
| Create Project navigirao na settings umjesto onboarding | `DashboardPage.jsx` | `navigate('/onboarding')` |
| `useRef` nije bio importovan | `QRGeneratorModal.jsx` | Dodan u React import |
| `listSubcontractors` nije postojao u hooku | `useSubcontractors.js` | Implementiran sa paginacijom i filterima |
| Email invite hook bio disabled | `pb_hooks/subcontractor-invite-email.pb.js` | Aktiviran, ispravljen URL |
| Site Team morao ručno login nakon registracije | `SubcontractorSignupPage.jsx` | Auto-login → redirect `/dashboard` |
| SafetyInspectionsPage hardcoded `DEMO-SCAFFOLD-123` | `SafetyInspectionsPage.jsx` | Čita `selectedProject.id` iz outlet context |
| DashboardPage null crash bez projekta | `DashboardPage.jsx` | Role-aware empty state |

### 4. UI Rename: Subcontractor → Site Team
- `SignupPage.jsx` — dropdown opcija
- `AppLayout.jsx` — role display u sidebar-u
- `InviteSubcontractorModal.jsx` — role opcije ("Site Team — Worker", "Site Team — Supervisor")

### 5. .gitignore Proširen
- Dodano: `*.tar.gz`, `*.pdf`, `*.PDF`, `.DS_Store`, `horizons-export*/`, `REPORT-*.html`, itd.
- Spriječeno da 5000+ neželjenih fajlova uđe u git

### 6. Biznis Kontekst — Ispravno Razumijevanje
- Snimljeno u `memory/project_tms_business_context.md`
- **Ispravno:** App je napravljen ZA Scaffold Coordinatore kao Steven Tucker
- Aleksandar = Fachbauleiter (piping) — NIJE target korisnik
- Site Team = DSD Montage / Megami (Gerüstbauer)
- App zamjenjuje Stevenovu veliku Excel tabelu

---

## 🔬 Tim Audit — Završen (kraj sesije)

Agenti su uradili audit koji nam treba za sljedeći sprint:

### Findings — Projects Collection
Trenutna polja: `id`, `user_id`, `name`, `location`, `description`, `scaffold_prefix`, `type`, `status`  
**Nedostaje:** `contract_type`, `project_config`, `active_modules` — ništa od ovoga ne postoji još

### Findings — Onboarding Flow (4 koraka)
1. Naziv gradilišta
2. Naziv kompanije
3. Invite subcontractor (opcionalno)
4. Completion

**Problem:** Hardcoded `scaffold_prefix: 'GER'`, ne pita za tip ugovora, ne konfiguriše module

### Findings — Module System
- 10 modula u AppLayout-u
- Permissions su role-based, ne project-based
- Nema `active_modules` po projektu
- Jedan jedini custom permission: `canViewRequests` na subcontractor recordu

### Findings — Contract Types (dizajn zadatak)
Agent koji je trebao dizajnirati data model nije uspio (limit). Radimo ovo u sljedećoj sesiji.

---

## ⏳ Gdje Smo Stali — Sljedeći Korak

### 🎯 Project Configuration Wizard (V2 — Faza 1)

Korisnik (Aleksandar) je objasnio ključni zahtjev:

> Coordinator pri kreiranju projekta mora da konfiguriše:
> 1. **Tip ugovora** sa Site Team-om (po satu / po m³ / po danu / Pauschal / kombinovano)
> 2. **Aktivne module** — svaki projekat može pratiti drugačiji set od 10 funkcija
> 3. **Rate/cijene** vezane za tip ugovora
> 4. Ako je Pauschal — Worker Hours se automatski isključuje (nema praćenja sati)
> 5. Ako je po m³ — Scaffold Logs dobijaju obavezno m³ polje

### Šta treba uraditi u sljedećoj sesiji:

**1. PocketBase migracija** — dodati na `projects` kolekciju:
```
contract_type: select (hourly | cubic_meter | daily | fixed_price | lv_position | combined)
contract_config: json (rate_per_hour, rate_per_m3, rate_per_day, total_amount, currency)
active_modules: json (koje od 10 modula su uključene za ovaj projekat)
```

**2. Onboarding Wizard Redesign** — dodati korake:
- Korak 2b: Tip ugovora + rate
- Korak 2c: Aktivni moduli (auto-prijedlog + ručna korekcija)

**3. AppLayout izmjena** — `show` uslov za svaki modul da čita i `selectedProject.active_modules`

**4. ProjectSettings tab** — dodati sekciju za izmjenu contract config nakon kreiranja

---

## 📋 V2 Roadmap (podsjetnik)

| Faza | Šta | Status |
|------|-----|--------|
| V2 Faza 0 | Bug fixes + domain | ✅ Završeno |
| V2 Faza 1 | Project Configuration Wizard + contract types | 🔄 Sljedeći sprint |
| V2 Faza 2 | AI PDF import (Gerüstanforderung) | 📅 Nakon Faze 1 |
| V2 Faza 3 | Smart Site Diary AI | 📅 Planirano |
| V2 Faza 4 | Worker Hours GDPR (W-001) | 📅 Planirano |
| V3 | Multi-project dashboard, advanced reporting | 📅 Q3 2026 |

---

*Report generisan: 24.04.2026. — TrackMyScaffolding dev session*
