# Final Pre-Launch Audit Report

- **Branch**: `chore/production-audit`
- **Pre-Audit Snapshot Commit**: `7fd3f8e` (`chore: snapshot current working state prior to production audit`)
- **Environment**: React `18.3.1`, TypeScript `5.5.3`, Vite `5.4.21` (`@vitejs/plugin-react-swc`), Tailwind CSS `3.4.11`, Node `v22.15.0`, npm `10.8.2`

---

## 1. Executive Summary

We audited all **95 repository files** (`3.93 MB` source / `4.09 MB` production `dist/`), traced the complete static + dynamic import graph from `index.html` and `src/main.tsx`, cross-checked every asset in `public/` against both local code and the live Supabase database (`projects` and `certificates` tables), and verified all custom animations and interactions on the Protect List.

### Key Outcomes
- **Removed 12 proven-unused files** (`10` unreachable React components in `src/components/` and `2` unreferenced `public/psp-uploads/*.png` files totaling `1,504.75 KB` that had zero references in code, git history, or Supabase).
- **Removed 2 unused runtime dependencies** (`@radix-ui/react-slot`, `class-variance-authority`), added `"typecheck": "tsc --noEmit"` and `"engines": { "node": ">=20.0.0" }`, and applied non-breaking `npm audit fix` patches (reducing npm audit advisories from `36` to `14`, with `0` advisories affecting browser runtime code where user input could trigger them).
- **Compressed 4 oversized images in `public/`** using `sharp` while preserving exact filenames and visual quality, reducing `dist/` image weight from **`2,743.97 KB` (`2.74 MB`) to `252.32 KB` (`0.25 MB`) — a 90.8% reduction**.
- **Code-split `Footer` (`Galaxy` WebGL + `TrueFocus`) and `3d-paper-certificate.html?raw`**, cutting the initial `index-*.js` entry bundle by **29.7%** (`88.79 KB` → `64.68 KB`), initial `index-*.css` by **29.6%** (`57.00 KB` → `40.10 KB`), and `SkillPowerUpsSection-*.js` from **`642.76 KB` to `12.63 KB`** (loading the `630.44 KB` 3D paper shader HTML chunk asynchronously only when an active certificate slide mounts).
- **Consolidated Google Fonts in `index.html`**, removing 3 unused font families (`Nunito`, `Poppins`, `Sarpanch` — 8 font weights) and merging `Familjen Grotesk` into the single non-blocking stylesheet.
- **Resolved all ESLint errors and warnings** (`1 error, 3 warnings` → `0 errors, 0 warnings`) and added production configuration (`.nvmrc`, `.env.example`, `public/_headers`, `public/sitemap.xml`, canonical link, and `.github/workflows/ci.yml`).

---

## 2. Before vs. After Metrics

| Metric | Baseline (`7fd3f8e`) | Post-Audit (`chore/production-audit`) | Delta |
| :--- | :--- | :--- | :--- |
| **Total `dist/` Size (raw)** | `4,088.19 KB` (`4.09 MB`) | `1,583.89 KB` (`1.58 MB`) | **`-2,504.30 KB` (`-61.3%`)** |
| **Images in `dist/` (raw)** | `2,743.97 KB` (`2.74 MB`) | `252.32 KB` (`0.25 MB`) | **`-2,491.65 KB` (`-90.8%`)** |
| **Entry JS (`dist/assets/index-*.js`)** | `88.79 KB` (`28.89 KB` gzip) | `64.68 KB` (`20.32 KB` gzip) | **`-24.11 KB` (`-29.7%` gzip)** |
| **Entry CSS (`dist/assets/index-*.css`)** | `57.00 KB` (`11.95 KB` gzip) | `40.10 KB` (`8.93 KB` gzip) | **`-16.90 KB` (`-25.3%` gzip)** |
| **`SkillPowerUpsSection` JS Chunk** | `642.76 KB` (`164.88 KB` gzip) | `12.63 KB` (`4.90 KB` gzip) | **`-630.13 KB` (`-98.0%`)** *(shader HTML deferred)* |
| **Total CSS (all chunks)** | `89.93 KB` (`18.91 KB` gzip) | `75.86 KB` (`16.78 KB` gzip) | **`-14.07 KB` (`-15.6%`)** |
| **Google Fonts Loaded** | 10 families (2 stylesheet tags, 1 render-blocking) | 7 active families (1 non-blocking stylesheet tag) | **`-3` unused font families (`-8` weights), `0` blocking font tags** |
| **`npm run lint`** | `1 error, 3 warnings` (Exit `1`) | `0 errors, 0 warnings` (Exit `0`) | **Fixed (`100%` clean)** |
| **`npm run typecheck`** | *(script missing)* `0` errors | `0` errors (Exit `0`) | **Added script & verified** |
| **`npm run build` Warnings** | `2` warnings (Browserslist + `>500 kB` chunk) | `0` warnings | **Fixed (`100%` clean)** |
| **`npm audit` Advisories** | `36` (`29 high, 5 moderate, 2 low`) | `14` (`7 high, 7 moderate` — dev/major only) | **`-22` advisories fixed safely** |

---

## 3. Complete Post-Audit `dist/` Bundle Breakdown

| File | Raw Size | Gzip Size | Load Timing |
| :--- | :--- | :--- | :--- |
| `dist/index.html` | `4.12 KB` | `1.36 KB` | Initial document |
| `dist/psp-intro.js` | `7.60 KB` | `3.13 KB` | Synchronous `<head>` (PSP bounce intro) |
| `dist/keyboard-toast.js` | `9.15 KB` | `3.45 KB` | Synchronous `<head>` (`TIPS.TXT` toast) |
| `dist/assets/index-C75IOAP6.css` | `40.10 KB` | `8.93 KB` | Initial CSS |
| `dist/assets/index-BzAQjCvw.js` | `64.68 KB` | `20.32 KB` | Initial app entry |
| `dist/assets/react-vendor-DyCANEzX.js` | `144.16 KB` | `46.64 KB` | Initial vendor (`react`, `react-dom`, `react-router-dom`) |
| `dist/assets/animation-BZmPDk6C.js` | `120.26 KB` | `40.18 KB` | Initial (`framer-motion` for `ScrollProgress` / `ScrollToTop`) |
| `dist/assets/radix-DeAr4R1-.js` | `43.54 KB` | `15.37 KB` | Initial (`@radix-ui/react-tooltip`) |
| `dist/assets/Web1Section-__kxjdIX.js` | `6.33 KB` | `2.75 KB` | Lazy section 1 (`WELCOME.TXT` hero) |
| `dist/assets/FaultyTerminal-DwzLZq9h.js` | `10.48 KB` | `3.97 KB` | Lazy WebGL background (desktop only) |
| `dist/assets/heavy-8MiK7BZ-.js` | `44.40 KB` | `13.02 KB` | Lazy WebGL engine (`ogl`) |
| `dist/assets/NotebookSection-DTuXviVt.js` | `0.89 KB` | `0.52 KB` | Lazy section 2 (`#notebook`) |
| `dist/assets/ProjectsSection-B9-L1wBD.js` | `15.07 KB` | `5.55 KB` | Lazy section 3 (`#projects`) |
| `dist/assets/GhostFibers-C-cjpzuX.js` | `7.99 KB` | `3.22 KB` | Lazy WebGL background (`#projects`, desktop only) |
| `dist/assets/supabaseData-BOGwPRvJ.js` | `111.91 KB` | `30.48 KB` | Lazy data client (`@supabase/supabase-js`) |
| `dist/assets/SkillPowerUpsSection-Bh9CFBUD.js` | `12.63 KB` | `4.90 KB` | Lazy section 4 (`#skillpowerups`) |
| `dist/assets/SkillPowerUpsSection-DzAIhr6d.css` | `32.55 KB` | `6.76 KB` | Lazy CSS (`#skillpowerups`) |
| `dist/assets/3d-paper-certificate-CJdJ21kn.js` | `630.44 KB` | `160.37 KB` | Deferred async chunk (loaded when active certificate slide mounts) |
| `dist/assets/Footer-ojGLQR3n.js` | `18.18 KB` | `6.98 KB` | Lazy footer (`Galaxy` WebGL2 + `TrueFocus`) |
| `dist/assets/Footer-CIv5Gndc.css` | `3.04 KB` | `0.91 KB` | Lazy footer CSS |
| `dist/favicon.jpg` | `2.94 KB` | `2.87 KB` | Favicon (`192x192` optimized JPEG) |
| `dist/placeholder.png` | `85.87 KB` | `84.53 KB` | Fallback project preview image (`512x512` optimized PNG) |
| `dist/psp-uploads/*` (4 files) | `163.51 KB` | `161.36 KB` | Fallback certificate images |

---

## 4. Items Left Untouched — Needs Your Decision (Risky / Uncertain)

In accordance with Rule 3 ("Anything rated **Risky** or **Uncertain** is listed for me to decide and is **not** changed"), the following items were identified and left untouched:

1. **Placeholder GitHub URLs in Local Fallback Data (`src/data/projects.ts`) — *Uncertain (Content Decision)***
   - **Location**: `src/data/projects.ts` lines 13, 27, 39:
     - `Legal-Sakha`: `githubUrl: "https://github.com/yourusername/legal-sakha"`
     - `ani-realm`: `githubUrl: "https://github.com/yourusername/ani-realm"`
     - `FitFocus`: `githubUrl: "https://github.com/yourusername/fitfocus"`
   - **Context**: When Supabase is reachable, `ProjectsSection.tsx` replaces `initialProjectsData` with live rows from Supabase (`projects` table). However, if Supabase is offline or slow, these local fallback rows are shown and their GitHub links point to `github.com/yourusername/...`.
   - **Action Needed**: Tell us whether to update these 3 fallback URLs to `https://github.com/PratikPawar020403/...` (or remove `githubUrl` on those fallback items).

2. **Signed Supabase Storage URLs in Database (`projects` & `certificates` tables) — *Risky / Operational Notice***
   - **Context**: Live rows in Supabase `projects` and `certificates` use signed storage URLs (`/storage/v1/object/sign/...`) with JWT `exp` timestamps set roughly 1 year from creation (expiring in late 2026 / 2027). Additionally, two project `image_url` values in the `projects` table (`Unicorn Explorer` and `DoorDecor`) have a trailing newline (`\n`) at the end of the URL string.
   - **Action Needed**: Consider switching the `portfolio-images` and `certificates` Supabase Storage buckets to **Public** URLs (`/storage/v1/object/public/...`) so certificate and project images never expire.

3. **`sonner` Dependency (`package.json`, `src/App.tsx`, `src/pages/Index.tsx`) — *Uncertain***
   - **Context**: Following the replacement of the keyboard navigation toast with `public/keyboard-toast.js`, `sonner` is only used for error fallback toasts if a `React.lazy()` section chunk fails to load over the network (`toast.error('Failed to load ... section')` in `src/pages/Index.tsx`).
   - **Action Needed**: Kept for resilience on flaky networks. If you prefer zero toast libraries in the React bundle, we can remove `sonner` and `<Toaster />`.

4. **Remaining `npm audit` Advisories Requiring Major Version Bumps — *Risky (Major Upgrades)***
   - `vite` (`5.4.21` → `8.x`), `react-router-dom` (`6.30.x` → `7.18.x`), and `sharp` (`0.34.5` → `0.35.5`) have advisories that require major semver upgrades (`npm audit fix --force`).
   - Because `vite@8` and `react-router-dom@7` introduce breaking configuration and routing changes, we did not force-upgrade them.

---

## 5. Protect List Verification

Every item on the Protect List was verified in both source and production build (`dist/`):
- **PSP Intro (`public/psp-intro.js`)**: Present in `index.html` `<head>`, plays the 5-contact DVD-style bounce (`duration: 6500`, `holdAfterCorner: 900`, `fade: 800`, `oncePerSession: false`) and dispatches `psp:reveal` and `psp:done`.
- **Terminal Keyboard Toast (`public/keyboard-toast.js`)**: Present in `index.html` `<head>`, waits `900ms` after `psp:done`, displays `TIPS.TXT` for `3000ms` without colliding with `WELCOME.TXT`.
- **Keyboard Navigation (`src/components/navigation/KeyboardNavigation.tsx`)**: `Alt+1..4` (`Digit1..4`), `?` / `Alt+H` (`MANUAL.TXT` modal), and `Esc` all work.
- **Hero Section (`src/components/Web1Section.tsx`)**: Displays `WELCOME.TXT`, centered `PRATIK S PAWAR` heading, and triggers both `ScrambledText` animations on every refresh/reveal.
- **3D Certificate Carousel (`src/components/SkillPowerUpsSection.tsx`, `ThreeDPaper.tsx`)**: Smooth RAF marquee, folder mouth counter badge, and interactive 3D paper certificate `<iframe srcDoc>` all work identically.
- **Static Hosting Files**: `public/_redirects`, `public/_headers`, `public/robots.txt`, `public/sitemap.xml`, and `public/llms.txt` are all copied into `dist/`.
