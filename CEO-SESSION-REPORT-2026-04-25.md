# 🧠 CEO Session Report — DreamSoftAI Studio
**Datum:** 25. april 2026 | **Autor:** Claude (Co-CEO / Second Brain)  
**Sesija:** TMS Domain Deep Dive — Scaffold Safety Tag System, Standards Research, Scaffold Systems Catalog, EU Funding Strategy

---

## ✅ Šta smo danas uradili

### 1. Scaffold Safety Tag System — Kompletna specifikacija

Definisan kompletan lifecycle skele koji TMS mora pratiti:

```
MONTAŽA
  → Koordinator kreira scaffold record
  → Scaffold Requester se NOTIFIKUJE (email): "Skela #GR-042 je podignuta za vas"
  → Tag se postavlja: ZELENI 🟢
        - Za koga (Requester firma)
        - Datum montaže
        - Datum sljedeće inspekcije
        - Koordinator koji je odgovoran

UPOTREBA
  → Requester firma koristi skelu
  → AI prati countdown do inspekcije
  → N dana prije roka → AI alert koordinatoru

INSPEKCIJA (po DGUV 201-011 + DIN 4420)
  → Koordinator vrši inspekciju
  → PASS: Tag se produžava → nova datum sljedeće inspekcije
  → FAIL: Tag mijenja → CRVENI 🔴 + notifikacija Requesteru

MODIFIKACIJA (za istog ILI novog korisnika)
  → Scaffold se pravi veći/manji
  → OBAVEZNA nova inspekcija nakon modifikacije → novi tag
  → Koordinator vidi: ko je zahtijevao + šta je promijenjeno

TRANSFER
  → Firma A završila → Skela ostaje
  → Koordinator dodjeljuje novom Requesteru (Firma B)
  → Notifikacija Firmi B, tag se ažurira

DEMONTAŽA
  → Koordinator kreira "Abbau" record
  → Tag status → INACTIVE
  → Scaffold record zatvoren, billing finalizovan
```

**Trigger tipovi za novi tag:**
- `initial_erection` — montaža
- `periodic_inspection` — redovna provjera
- `post_modification` — nakon izmjene (za istog ili novog korisnika)
- `post_incident` — nakon oluje/udara/vanrednog događaja
- `user_transfer` — novi korisnik

---

### 2. Istraživanje standarda — DGUV, DIN, EN

**Hijerarhija standarda:**
```
DGUV Vorschrift 38 "Bauarbeiten"          ← Njemački zakon (obavezan)
  └── DGUV Information 201-011 (2023)     ← Praktični vodič (ažuriran jan. 2023)
      └── DIN 4420-1/2/3/4               ← Tehnički standard
          └── EN 12811-1 (European)       ← Osnova (performance requirements)
```

**Inspekcijski intervali:**

| Standard | Interval |
|----------|----------|
| DGUV 201-011 | Risk-based (Gefährdungsbeurteilung) — nema fiksni broj u zakonu |
| EN 12811 / UK | 7 dana |
| OSHA (US) | 7 dana + svaka smjena |
| EPC industrijska praksa | 28 dana uobičajeno |
| **MHKW Wiesbaden (realni projekat)** | **7 dana** — eksplicitno na tagu! |

**DGUV tag termin:** `Gerüstkontrollschild` — fizički tag na ulazu, dokumentuje status.

**Ključno pravilo sa realnog taga:**
> *"Falls mehr als 7 TAGE seit der letzten Inspektion vergangen sind, muss dieses Einsteckschild entfernt und der Vorbeiter informiert werden."*

**TMS zaključak:** Interval je konfigurabilni per-projekt parametar. Default ponuda: 7 / 14 / 28 dana.

**Freigabeschein (Übergabeschein):**  
Obavezan dokument pri predaji skele korisniku. Na MHKW gradilištu piše:  
*"Freigabeschein muss vorhanden sein"*  
TMS automatski generiše digitalni Freigabeschein pri dodjeli Requesteru.

**Koordinator — legalne odgovornosti (DGUV + BetrSichV):**
- Inspekcija prije prvog korišćenja (obavezno)
- Periodična inspekcija po definisanom intervalu (dokumentovano)
- Vanredna inspekcija nakon oluje/udara/modifikacije
- Gerüstkontrollschild mora biti vidljiv u svakom trenutku
- Svaka inspekcija pisano evidentirana
- Mora biti certificirana "Befähigte Person"

---

### 3. Analiza realnog MEGAMI SCAFFTAG (slike sa gradilišta)

Aleksandar je poslao 19 fotografija sa MHKW Wiesbaden gradilišta. Analizirani realni tagovi brenda MEGAMI (polska firma za scaffold opremu).

**Fizička struktura MEGAMI SCAFFTAG-a:**

```
[TOP LOOP — visi na cijevu]
┌─────────────────────────────────┐
│  MEGAMI logo + DSD logo         │  ← Scaffold firma
│  SCAFFTAG                       │
│  AUFBAU- UND PRÜFPROTOKOLL      │
├─────────────────────────────────┤  ← ZELENA pozadina
│  Nr./        [Gerüstnummer]     │  ← npr. 1057, 879, 666, 1009
│  Steller     [Ko je naručio]    │  ← npr. Bilfinger, KWM, IMO
│  Standort    [Lokacija]         │  ← npr. "Filter House", "Site Outside"
│  Deck        [Nivo]             │  ← npr. "+0m", "+2m", "+4m"
│  Gebaut von  [Ko je izgradio]   │  ← DSD Montage (uvijek!)
│  Kontakt Tel [Telefon]          │  ← rijetko popunjen
├─────────────────────────────────┤  ← ZELENA pozadina
│  AUFBAU WIRD VERWENDET FÜR     │
│  LASTKLASSE 1-6:               │
│  ☐0.75  ☐1.50  ☑2.00          │  ← Lastklasse 3 = standard ovdje
│  ☐3.00  ☐4.50  ☐6.00          │
├─────────────────────────────────┤
│  ⚠ Falls >7 Tage → Schild      │  ← KLJUČNO: 7-dnevni interval
│    entfernen + Vorbeiter info   │
├─────────────────────────────────┤
│  DAS PRÜFPROTOKOLL MUSS VON    │
│  EINER BEFUGTEN PERSON...      │
│                                 │
│  UHRZEIT | DATUM | UNTERSCHRIFT │  ← Svaka inspekcija = jedan red
│  ---------|-------|----------   │  ← Vidjeli 6-8+ unosa po tagu
│  18.09    |       | Krusch      │
│  10.10    |       | Knuufld     │
│  ...      |       | ...         │
├─────────────────────────────────┤  ← ŽUTA pozadina
│  VORSICHT — Gefahren:           │  ← Slobodan tekst opasnosti
│  AUFFANGGURTE ERFORDERLICH      │
│  JA ☐     NEIN ☑               │  ← Pojas: DA/NE
└─────────────────────────────────┘

POLEĐINA taga:
├── Gornji dio: periodične inspekcije (DATUM + UNTERSCHRIFT)
└── Donji dio: "Unterschrift der Person, die das Gerüst ausführt 
                und inspiziert" (jednokratno pri izgradnji)
```

**Crveni tag (odvojeni fizički tag):**
- MEGAMI bijela plastika, stop ruka, 3 jezika (PL/EN/DE)
- "WSTĘP WZBRONIONY! / NO ENTRY! / ZUTRITT VERBOTEN!"
- QR kod → megami-polska.com
- **Nema podatkovnih polja** — čisto zabrana
- Fizički zamjenjuje zeleni tag pri nebezbjednoj skeletu

**Ispravljeno mapiranje polja:**

| Polje na SCAFFTAG-u | Ispravno značenje | TMS polje |
|---------------------|-------------------|-----------|
| Nr./ | Gerüstnummer (master ID) | `scaffold_number` |
| Steller | Ko je NARUČIO — firma (Bilfinger, KWM...) | `requester_company` |
| Standort | Lokacija na postrojenju (Filter House, Silo...) | `location` |
| Deck | Nivo/etaža (+0m, +2m, +4m) | `level` (slobodan tekst) |
| Gebaut von | Ko je IZGRADIO — uvijek Site Team (DSD) | `built_by` |
| Kontakt Tel. | Telefon odgovornog | `contact_phone` (optional) |
| Lastklasse | Load class 1-6 | `load_class` (select) |
| Auffanggurte | Harness required | `harness_required` (bool) |
| Vorsicht text | Hazard napomena | `hazard_notes` (text) |

**Napomena:** DSD = Site Team u TMS kontekstu. Steller = Besteller u Gerüstbuch = Kontraktor u Gerüstanforderung = `requester_company` u TMS. Isto lice, različiti nazivi.

**Scaffold Inspector na realnom projektu:** Viđena imena — Krusch, Knuufld, Kneeze — to su koordinatori koji potpisuju sedmične inspekcije.

---

### 4. Tag ↔ Excel liste — Mapping

**Gerüstnummer je master ključ koji sve veže:**

```
Gerüstanforderung (zahtjev/request)
    Kontraktor = Steller na tagu = Besteller u Gerüstbuch = requester_company u TMS
    Anlage + Anlagenteil = Standort na tagu = location u TMS
    Aufstellungsebene = Deck na tagu = level u TMS
    Gerüstnummer ← LINKED →
    
Gerüstbuch (billing/obračun)
    Gerüstnummer ← ISTI
    Miettage, Vorhaltung, Regiestunden ← Billing polja (V2)
    Länge/Breite/Höhe, m²/m³ ← Measurement polja (V2)

SCAFFTAG (fizički)
    Nr./ = Gerüstnummer ← ISTI
    + Safety polja (Lastklasse, harness, inspekcije)
```

**Šta je u Excel listama ali nije na tagu** → Billing modul (V2):
- Miettage, Vorhaltung nach 30 Tagen
- Regiestunden Tagschicht/Nachtschicht
- Night/Saturday/Sunday/Holiday surcharges
- Einzelpreis, m², m³, Gerüstkosten

**Šta je na tagu ali nije u Excel listama** → Safety modul (V2):
- Lastklasse (load class)
- Inspekcijska tabela sa potpisima
- Harness requirement

**TMS value:** Prva platforma koja spaja billing + safety pod jednim Gerüstnummer.

---

### 5. Kompletni TMS Data Model (ažuriran)

```sql
-- NOVA kolekcija
scaffold_tags:
  scaffold_log_id     → scaffold_logs
  project_id          → projects
  tag_status          enum: 'green' | 'red' | 'inactive'
  trigger             enum: 'initial' | 'periodic' | 'post_modification' 
                            | 'post_incident' | 'transfer'
  requester_company   text
  issued_date         datetime
  next_inspection_due date  -- auto-calc: issued_date + project.inspection_interval
  load_class          int (1-6)
  harness_required    bool
  hazard_notes        text
  inspector_name      text
  created_by          → users

-- PROŠIRITI scaffold_logs
scaffold_logs:
  + scaffold_number   text   -- Gerüstnummer (master ID, npr. "1057")
  + requester_company text   -- Steller / Besteller
  + location          text   -- Standort (Filter House, Silo Area...)
  + level             text   -- Deck (+0m, +2m, +4m)
  + built_by          text   -- Gebaut von (DSD Montage)
  + load_class        int    -- Lastklasse 1-6
  + harness_required  bool

-- PROŠIRITI safety_inspections  
safety_inspections:
  + scaffold_log_id   → scaffold_logs
  + inspection_type   enum: 'initial' | 'periodic' | 'post_modification' | 'post_incident'
  + result            enum: 'pass' | 'fail'
  + next_due_date     date  -- auto-calc
  + tag_updated       bool

-- NOVA kolekcija
scaffold_handover:  -- digitalni Freigabeschein / Übergabeschein
  scaffold_log_id     → scaffold_logs
  requester_company   text
  handover_date       datetime
  load_class          int
  coordinator_id      → users
  signed              bool
  notes               text

-- PROŠIRITI projects
projects:
  + inspection_interval_days  int  -- default: 7 ili 28 (per project)
  + primary_scaffold_system   → scaffold_systems (nova tabela)
  + allow_mixed_systems       bool
  + secondary_systems[]       → scaffold_systems[]

-- NOVA seed tabela
scaffold_systems:
  name        text  -- "Layher Allround", "PERI UP", "Plettac SL"...
  manufacturer text  -- "Layher", "PERI", "Altrad"...
  type        enum: 'modular' | 'frame' | 'tube_coupler' | 'mobile_aluminum'
  connection  enum: 'rosette' | 'wedge_pin' | 'coupler' | 'fixed_frame'
  notes       text
```

---

### 6. Scaffold Systems Catalog — Baza za TMS

**Tip 1: Modularne (universalne) skele** — industrijska primjena, EPC
- Layher Allround (DE) — rozeta, do 8 elemenata na čvoru, 360° — **STANDARD na MHKW**
- PERI UP (DE) — modular, BIM podrška, integrisana sigurnost
- Doka Ringlock (AT) — direktni Layher konkurent
- Alfix (DE) — Layher-compatible, ekonomičniji

**Tip 2: Ramovske (fasadne) skele** — fasade, stanogradnja
- Layher Blitz (DE) — brza montaža, 6 komponenti
- Altrad / Plettac SL (FR/DE) — Balkan standard, dobar price/quality
- Altrad Baumann, Altrad Assco — varijante

**Tip 3: Cijevna sa spojnicama ("žabice")** — tradicionalna, najjeftinija
- Generic Tube & Coupler — najviše vremena, najstarija metoda

**Tip 4: Mobilne aluminijske** — za unutrašnje radove
- Zarges (DE), Altrex (NL)

**Ostali značajni proizvođači:**
- ULMA Construction (ES) — jug Europe i Latinska Amerika
- BrandSafway (US) — mega industrijski projekti
- MJ-Gerüst (DE) — Layher-compatible, "Made in Germany" ekonomičnija verzija
- Pilosio (IT) — skučeni prostori, restauracije

**Napomena:** U praksi se sistemi ne bi trebali miješati, ali se ponekad miješaju. TMS prati primary + optional secondary sistem. AI warning ako se detektira miješanje bez odobrenja.

---

### 7. AI Roadmap za TMS

**Faza 1 (Sprint 3-4) — Rule-based AI:**
- Countdown timer: X dana do inspekcije → alert koordinatoru
- Auto-flag: inspekcija overdue → status upozorenje na dashboardu
- Freigabeschein auto-generacija pri kreiranju scaffold-a + dodjeli Requesteru

**Faza 2 (Sprint 5-6) — Intelligent AI:**
- PDF Import: upload Gerüstanforderung → AI parsira → auto-popunjava scaffold record
- AI Assistant: koordinator pita u natural language, AI odgovara o statusu skela
- Vanredna inspekcija trigger: koordinator označava "oluja/incident" → AI kreira inspekcijsku obavezu

**Faza 3 (V2+) — Predictive AI:**
- Risk scoring po skelama (koliko dugo, kakvo opterećenje, historija inspekcija)
- Billing prediction: procjena Miettage troškova
- Pattern recognition: koje skele najčešće idu u crveni status

---

### 8. EU Funding Strategy

**Zašto TMS je EU fundable:**
- AI u **safety-critical** kontekstu (EU AI Act Annex III — high-risk AI, workplace safety)
- Direktna digitalizacija DGUV/EN 12811 compliance
- GDPR-compliant by design (W-001 anonimni worker sistem)
- Target market: EU construction sector €2.1T/year, industrial scaffolding ~€8-12B/year

**Funding opportunities:**

| Program | Relevantnost | Timing |
|---------|-------------|--------|
| EIC Accelerator | AI + Construction Tech + SME | **Oct/Nov 2026** ✅ |
| Horizon Europe Cluster 4 | Digital & Industrial AI | Rolling 2025-2027 |
| EU AI Act Regulatory Sandbox | AI u safety-critical sistemu | 2026 |
| Digital Europe Programme | AI deployment u industiji | 2025-2027 |
| KfW / German state funds | Nakon GmbH registracije | Od jun 2026 |

**Prerequisiti:**
- GmbH registracija u Njemačkoj: **juni 2026** (4-6 sedmica za PIC broj)
- EU Funding & Tenders portal: PIC broj odmah nakon GmbH
- Dokumentovati AI komponente kao **AI system per EU AI Act Annex III**
- Razvoj + grant prijava teku **paralelno** — ne čekati finish

**Pitch angle:**
> *"TMS je prvi AI-powered scaffold lifecycle management sistem koji digitalizuje DGUV/EN 12811 compliance u real-time, eliminiše papirnu evidenciju na industrijskim gradilištima, i automatizuje safety inspection alerting po EU standardima. Štiti živote radnika kroz AI-driven inspekcijsko praćenje."*

**Konkurentska analiza — zašto TMS ne postoji:**
- Scaffmaster, ScaffoldTracker, Procore scaffold module — generički, bez AI alerting, bez DGUV fokusa
- Nema digitalni SCAFFTAG sa QR kodom
- Nema safety + billing + inventory integracija
- Nema EPC/industrial fokus
- Nema GDPR-compliant worker tracking
- Nema multi-contract type engine

---

## 📋 Sprint 3 — Šta slijedi

Spremnii smo za implementaciju sa punim domain znanjem. Sprint 3 = **Project Configuration Wizard + Scaffold Tag Module**:

### Sprint 3 scope:

**A) Project Configuration Wizard (već planiran):**
- Tip ugovora (Stundenlohn/Kubikazi/Tagessatz/Pauschale/Kombinovano)
- Aktivni moduli
- **NOVO: Primary scaffold system** (select iz kataloga)
- **NOVO: Inspection interval** (7 / 14 / 28 dana — default 7 za industrijske)
- Rate/pricing setup

**B) Scaffold Tag Module (novi — iz danas):**
- scaffold_tags kolekcija u PocketBase
- Proširiti scaffold_logs sa novim poljima (scaffold_number, requester_company, location, level, load_class, harness_required)
- Green/Red tag status na scaffold detail stranici
- Digitalni Freigabeschein generacija (PDF)
- Email notifikacija Requesteru pri kreiranju

**C) Inspection Upgrade:**
- Vezati safety_inspections za scaffold_log_id
- Inspection type (initial/periodic/post_mod/post_incident)
- Pass/Fail result → automatski update scaffold_tag status
- Next due date auto-calc

**D) AI Alert Engine (basic):**
- Backend cron job: daily check na inspection deadlines
- X dana prije → email koordinatoru
- Overdue → dashboard flag

### Koji moduli se pišu instrukcijama za Manus:
1. PocketBase schema migration (nova polja + kolekcije)
2. Scaffold Tag UI (tag status badge na scaffold list i detail)
3. Inspection Flow upgrade
4. Freigabeschein PDF generacija
5. Cron job za AI alerts

---

## 📊 Status projekata (EOD 25. april 2026)

| Projekat | Status | Sljedeći korak |
|----------|--------|----------------|
| TrackMyScaffolding | 🟢 LIVE Beta — domain knowledge KOMPLETAN | Sprint 3: Config Wizard + Tag Module |
| AI Agent Manager | 🟢 Spreman za marketing | Blog post #1 do 2. juna |
| Zlatcoin | 🔴 Blokiran | JWT_SECRET fix → produkcija |

---

## 🧠 Domain znanje stečeno danas (za buduće sesije)

1. **Gerüstnummer** = master ID koji veže tag + request + billing
2. **Steller/Besteller/Kontraktor** = isti subjekt — firma koja koristi skelu (Bilfinger, KWM, IMO...)
3. **DSD Montage** = Site Team = jedini koji grade i modificiraju skele
4. **Inspekcijski interval** = 7 dana na ovom projektu (MHKW Wiesbaden) — konfigurabilno per-projekt
5. **Modifikacija** = može biti za istog ili novog korisnika — uvijek zahtijeva novu inspekciju + novi tag
6. **MEGAMI SCAFFTAG** = fizički tag koji TMS digitalizuje (zelena strana = Aufbau + Prüfprotokoll; bijela = No Entry)
7. **Layher Allround** = primary sistem skela na projektu (rozeta/modularni sistem)
8. **Freigabeschein** = legalni dokument obavezan na gradilištu — TMS ga digitalizuje
9. **Lastklasse 3 (2.00 kN/m²)** = standard na industrijskom projektu
10. **"Om"** = nivo +0m (prizemlje), ne firma

---

*Generisano od Claude — Co-CEO / Second Brain | DreamSoftAI Studio*  
*Sljedeća sesija: Sprint 3 specifikacija → Manus instrukcije za implementaciju*
