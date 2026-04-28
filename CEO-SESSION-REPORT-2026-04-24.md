# 🧠 CEO Session Report — DreamSoftAI Studio
**Datum:** 24. april 2026 | **Autor:** Claude (Co-CEO / Second Brain)  
**Sesija:** Studio setup, plugin instalacija, TMS security audit

---

## ✅ Urađeno danas

### 1. Etsy/YouTube workflow analiza
- Analizirano 5 prompt fajlova iz Downloads (etsy-research, midjourney-artwork, crop-and-mockups, create-listing, full-listing)
- Video identificiran: "Beginners Guide to Claude (Save Time & Make Money)" — 4-fazni Etsy digital art pipeline
- **Odluka:** Ne otvaramo Etsy pravac sada. Fokus ostaje na TMS/AI Agent Manager/Zlatcoin.
- Korisno za budućnost: Python/Pillow crop pattern iz faze 3 primjenjiv za TMS Auto PDF Reports feature.

### 2. Plugin stack — KOMPLETAN ✅
Instaliran kompletan CEO plugin stack:

**Prioritet 1 (instalirano):**
| Plugin | Primjena |
|--------|----------|
| Sales | AI Agent Manager outreach, pipeline juni 2026 |
| Legal | SEBN ugovori, Zlatcoin compliance |
| Operations | AI dev tim (Manus, Horizons, Antigravity) |
| Finance | SEBN P&L, Zlatcoin billing review |
| Marketing | Blog serija AI Agent Manager jun-jul |
| Data | TMS KPI metrike, rast praćenje |

**Prioritet 2 (instalirano):**
| Plugin | Primjena |
|--------|----------|
| Product Management | TMS/AAM feature specs, sprint planning |
| Brand Voice | DreamSoftAI voice konzistentnost |
| Customer Support | TMS beta korisnici, KB artikli |
| Enterprise Search | Cross-tool pretraga |
| Cowork Plugin Management | Custom plugini za Studio |

**Prioritet 3 (instalirano — low priority):**
Bio Research, Zoom Plugin, Apollo, Common Room, PDF Viewer

**Ukupno skilova u sistemu:** 50+

### 3. TMS Security Audit — Debug endpointi
Pregledao TMS lokalni kod. Ključni nalazi:

#### ✅ Produkcijska verzija (`apps/`) je ČISTA
- `apps/pocketbase/pb_hooks/fix-unique-token.pb.js` — nema debug ruta
- Nema `/api/fix-db`, `/api/send-test-email` u `apps/` folderu
- Sve ostale rute u `apps/api/src/routes/` su legitimne

#### 🔴 KRITIČNO — horizons-export-4 (Apr 21) ima probleme
Fajl: `horizons-export-4/apps/pocketbase/pb_hooks/fix-unique-token.pb.js`

**Problem 1 — Debug endpoint bez auth:**
```
GET /api/send-test-email  ← javno dostupan
```

**Problem 2 — HARDKODOVANI RESEND API KEY:**
```
Bearer re_B5FTRBJt_5kbf1URsVXN4R4Nrm4tHigCc
```
Ovaj ključ je exposure rizik ako je ovaj export ikad bio na serveru ili u git repozitoriju.

---

## 🔴 HITNE AKCIJE — Neizlaziti iz dana bez ovih

### [1] ODMAH — Rotirati Resend API key
1. Idi na **resend.com → API Keys**
2. Pronađi ključ koji počinje sa `re_B5FTRBJt...`
3. Obriši ga
4. Generiši novi ključ
5. Ažuriraj `.env` fajl u `apps/api/` sa novim ključem
6. Redeploy API servisa

### [2] PROVJERITI — Koji kod radi na produkciji?
- Da li je `apps/` folder ono što je deployano na `trackmyscaffolding.com/hcgi/platform`?
- Ili je neki od horizons-export foldova posljednji deployovan?
- Pitati Horizons tim: "Koji export je zadnji deployovan na produkciju?"

### [3] AKO server ima staru verziju — uploadati čisti fajl
`apps/pocketbase/pb_hooks/fix-unique-token.pb.js` je čist — uploadati ga na PocketBase server putem admin panela.

---

## 📋 Ostali otvoreni zadaci (iz CEO briefinga)

### Sedmica 1 (24-30. april)
- [ ] 🔴 Rotirati Resend API key (HITNO — iz ovog reporta)
- [ ] 🔴 Potvrditi koji kod radi na TMS produkciji
- [ ] 🟡 Provjeriti SPF/MX DNS status na Resend dashboardu
- [ ] 🟡 Zlatcoin: Fix JWT_SECRET enforcement (ukloniti `"zlatcoin-default-key-change-in-prod"`)

### Sedmica 2-3 (maj)
- [ ] TMS: Dodati industrijska polja u Scaffold Logs (Scaffold Number, Plant, Plant Section)
- [ ] TMS: AI Assistant (OpenAI API konekcija)
- [ ] Zlatcoin: Server-authoritative terms acceptance (ukloniti localStorage)
- [ ] Zlatcoin: KYC S3 storage finalizacija
- [ ] AI Agent Manager: Napisati blog post #1 (deadline 2. juni)
- [ ] AI Agent Manager: Setup blog na agents.dreamsoftai.com/blog

### Sedmica 4+ (kraj maja - juni)
- [ ] Zlatcoin: Final security audit → soft launch beta
- [ ] AI Agent Manager: Blog počinje 2. juni, outreach 1. juni
- [ ] TMS: QR onboarding, Worker Hours, Multi-project

---

## 📊 Status projekata (EOD 24. april)

| Projekat | Status | Sljedeći korak |
|----------|--------|----------------|
| TrackMyScaffolding | 🟡 LIVE Beta — security provjera pending | Rotirati Resend key, potvrditi deploy verziju |
| AI Agent Manager | 🟢 Spreman za marketing | Blog post #1 do 2. juna |
| Zlatcoin | 🔴 Blokiran | JWT_SECRET fix → produkcija |

---

## 🧠 Memory sistema — inicijalizirano
Kreirani trajni memory fajlovi (ostaju kroz sesije):
- `project_trackmyscaffolding.md`
- `project_ai_agent_manager.md`
- `project_zlatcoin.md`
- `project_dreamsoftai_studio.md`
- `feedback_aleksandar.md`

---

*Generisano od Claude — Co-CEO / Second Brain | DreamSoftAI Studio*  
*Sljedeća sesija: Početi sa Resend key rotacijom + potvrditi TMS deploy verziju*
