# TMS Sprint 3 — Session Report
**Datum:** 26. april 2026  
**Projekat:** TrackMyScaffolding (trackmyscaffolding.com)  
**Repo:** sasagf-cell/truckmyscaffolding

---

## ✅ Šta je urađeno danas

### 1. Railway deploy pipeline — verifikovan ✅
- Testiran auto-deploy promjenom boje hero sekcije (`bg-[#f0fdf4]` → `bg-white`)
- Potvrđeno: svaki push na `main` → Railway automatski deploya za ~2 min

### 2. PocketBase volume persistence — verifikovan ✅
- Mount path: `pocketbase-volume` → `/pb/pb_data`
- Dockerfile koristi `--dir=/pb/pb_data` — savršen match
- Volume size: 5 GB, data se čuva između restartova

### 3. Signup proxy fix — glavni bug riješen ✅
- **Root cause:** Vite dev proxy (`/hcgi/platform` → PocketBase) radi samo u `dev` modu
- `server.js` u produkciji nije imao proxy → svi signup zahtjevi vraćali `index.html`
- **Fix:** Dodan HTTP proxy u `server.js` koji prosljeđuje `/hcgi/platform/*` na `pocketbase.railway.internal:8080`
- Commit: `84e9274`
- **Rezultat:** Signup radi ✅ — user se pojavio u PocketBase bazi (`test@dreamsoftai.com`)

### 4. Input text vidljivost — SignupPage ✅
- **Bug:** `--foreground: 0 0% 98%` (bijela) CSS varijabla → nevidljiv tekst na bijelim inputima
- **Fix:** Svi inputi dobili eksplicitno `text-gray-900 bg-white`
- Commit: `aefa66b` + `ac9528d`

### 5. Password eye toggle — dodan ✅
- Import `Eye`, `EyeOff` iz lucide-react
- Password polje: `type={showPassword ? 'text' : 'password'}`
- Dugme sa apsolutnim pozicioniranjem desno od inputa
- Commit: `ac9528d`

### 6. Input text vidljivost — OnboardingFlow ✅
- Isti bug kao SignupPage: bijela slova na bijeloj pozadini
- Sva 3 inputa (naziv sajta, kompanija, subcontractor email) popravljena
- Commit: `ac9528d`

---

## 🔍 Dijagnoza: Role pokazuje "User"

**Uzrok:** Stara cached auth sesija iz perioda kad proxy nije radio — authData.record nije imao `role` field
**Rješenje:** Logout → fresh signup → rola će biti "Coordinator"  
**Status:** Nije potvrđeno jer sesija istekla; testirati sutra nakon novog signupa

---

## ⏳ Ostaje za sutra (Sprint 3 nastavak)

| # | Task | Status |
|---|------|--------|
| 1 | Verifikovati role "Coordinator" nakon fresh signupa | 🔲 |
| 2 | LoginPage — provjera input text vidljivosti (vjerovatno isti bug) | 🔲 |
| 3 | Subcontractor invite — ne radi ("add your first Site Team leader") | 🔲 |
| 4 | QA-9: Create project flow | 🔲 |
| 5 | QA-10: Scaffold log kreiranje | 🔲 |
| 6 | QA-11: Inspection kreiranje | 🔲 |
| 7 | TASK-057: Risk Score Trend Indicator + Why Modal deploy | 🔲 |

---

## 📦 Commiti danas

| SHA | Opis |
|-----|------|
| `84e9274` | fix: add PocketBase proxy in server.js for production |
| `aefa66b` | fix: input text color on SignupPage |
| `ac9528d` | fix: input text visibility + password eye toggle (Signup + Onboarding) |

---

## 🧠 Tehnički zaključci

- `text-foreground` CSS klasa je **globalno bijela** u TMS dark theme-u — nikad je ne koristiti na elementima sa bijelom pozadinom. Uvijek eksplicitno `text-gray-900`.
- Vite proxy vrijedi **samo za `npm run dev`** — svaki endpoint koji frontend koristi mora biti proxiran i u `server.js` za produkciju.
- PocketBase auth record vraća custom polja (`role`, `full_name`) samo ako su definisana u migration fajlovima — potvrđeno da jeste.

---

*Sutra nastavljamo od QA verifikacije role + login stranice.*
