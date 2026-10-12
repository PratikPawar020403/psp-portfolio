# Cleanup Log & Rollback Plan

Every change on `chore/production-audit` is organized into atomic commits by category so any individual commit—or the entire branch—can be reverted cleanly without side effects.

---

## 1. Commit Log by Category

| Group | Commit Hash | Commit Message | Summary of Changes |
| :--- | :--- | :--- | :--- |
| **Pre-Audit Snapshot** | `7fd3f8e` | `chore: snapshot current working state prior to production audit` | Baseline state with PSP simple-fade intro, `WELCOME.TXT`, and `TIPS.TXT` terminal keyboard toast (`3s` duration, `0.9s` delay). |
| **Group 1: Dead Files** | `22371f6` | `chore(cleanup): remove proven-unused components and unreferenced public assets` | Removed 10 unreachable React component files in `src/components/` and 2 unreferenced images in `public/psp-uploads/` (`1.50 MB`). |
| **Group 2: Dependencies** | `451292a` | `chore(deps): remove unused packages, add typecheck script, and apply non-breaking security patches` | Removed `@radix-ui/react-slot` and `class-variance-authority`, added `typecheck` script & `engines`, and ran `npm audit fix`. |
| **Group 3: Assets** | `02c034a` | `perf(assets): compress oversized fallback images and favicon in public/` | Compressed `placeholder.png` (`561.6 KB` → `85.9 KB`), `favicon.jpg` (`70.4 KB` → `2.9 KB`), and 2 fallback certificate images (`598.9 KB` → `155.1 KB`). |
| **Group 4: Performance** | `8bce0ac` | `perf(chunks): lazy-load Footer and 3D certificate shader HTML and remove unused motion imports` | Lazy-loaded `Footer` in `Index.tsx`, dynamically imported `3d-paper-certificate.html?raw` in `ThreeDPaper.tsx`, and removed unused `framer-motion` imports from certificate cards. |
| **Group 5: Config & SEO** | `4e99cab` | `chore(config): add .nvmrc, .env.example, _headers, sitemap.xml, canonical tag, and consolidate Google Fonts` | Added `.nvmrc`, `.env.example`, `public/_headers`, `public/sitemap.xml`, `Sitemap:` in `robots.txt`, canonical link, and removed 3 unused Google Fonts families. |
| **Group 6: Code Quality** | `88f10ce` | `fix(quality): resolve all ESLint errors/warnings, remove debug console.log, and prune unused font classes` | Replaced `require("tailwindcss-animate")` with ES import in `tailwind.config.ts`, fixed `useCallback` in `ScrambledText.tsx`, resolved Fast Refresh lint warning in `CertificateCarousel.tsx`, and removed debug `console.log` in `ProjectsSection.tsx`. |

---

## 2. Evidence Log for Every Deleted File & Dependency

### Deleted Source Files (`src/components/`)

| File Path | Size | Proof of Unused Status |
| :--- | :--- | :--- |
| `src/components/ui/aurora-background.tsx` | `2.73 KB` | `0` imports across all files in `src/`; leftover from earlier background experiment (`Web1Section.tsx` uses `FaultyTerminal`). |
| `src/components/certificates/CarouselNavigation.tsx` | `0.63 KB` | `0` imports across all files in `src/`; `SkillPowerUpsSection.tsx` uses continuous RAF marquee + drag instead of arrow buttons. |
| `src/components/certificates/CertificateHeader.tsx` | `2.92 KB` | `0` imports across all files in `src/`; `SkillPowerUpsSection.tsx` renders its own `. certs` folder tab header. |
| `src/components/projects/ProjectGrid.tsx` | `0.92 KB` | `0` imports across all files in `src/`; `ProjectsSection.tsx` renders editorial `ProjectRow` items directly. |
| `src/components/projects/ProjectFilters.tsx` | `1.32 KB` | `0` imports across all files in `src/`; `ProjectsSection.tsx` renders inline category filter pills. |
| `src/components/projects/ProjectCard.tsx` | `1.90 KB` | Only imported by unreachable `src/components/projects/ProjectGrid.tsx`. |
| `src/components/projects/ProjectCardFront.tsx` | `2.03 KB` | OnlyImported by unreachable `src/components/projects/ProjectCard.tsx`. |
| `src/components/projects/ProjectCardBack.tsx` | `3.70 KB` | Only imported by unreachable `src/components/projects/ProjectCard.tsx`. |
| `src/components/ui/button.tsx` | `1.96 KB` | Only imported by unreachable `ProjectFilters.tsx` and `ProjectCardBack.tsx`; `0` reachable imports from `src/main.tsx`. |
| `src/components/ui/card.tsx` | `1.96 KB` | Only imported by unreachable `ProjectCard.tsx`; `0` reachable imports from `src/main.tsx`. |

### Deleted Public Assets (`public/psp-uploads/`)

| File Path | Size | Proof of Unused Status |
| :--- | :--- | :--- |
| `public/psp-uploads/2b274cfb-8016-4bb6-bc4a-f8c41c4396ed.png` | `1,086.12 KB` | `0` references in `src/`, `public/`, `index.html`; `0` occurrences in git commit history (`git log -S "2b274cfb"`); `0` references in live Supabase `projects` and `certificates` tables. |
| `public/psp-uploads/dc7a9a29-35c0-448b-aba0-d60326e3ce9c.png` | `418.63 KB` | `0` references in `src/`, `public/`, `index.html`; `0` occurrences in git commit history (`git log -S "dc7a9a29"`); `0` references in live Supabase `projects` and `certificates` tables. |

### Removed Dependencies (`package.json`)

| Package | Proof of Unused Status |
| :--- | :--- |
| `@radix-ui/react-slot` | Only imported by dead `src/components/ui/button.tsx`. `0` imports in reachable source files. |
| `class-variance-authority` | Only imported by dead `src/components/ui/button.tsx`. `0` imports in reachable source files. |

---

## 3. Rollback Plan

### Revert a Single Category Commit
Each category was committed separately. To revert any single category while keeping all other improvements:
```bash
# Example: restore the original uncompressed images (Group 3)
git revert 02c034a

# Example: restore the deleted unused components/assets (Group 1)
git revert 22371f6
```

### Restore a Single Deleted File from the Pre-Audit Snapshot (`7fd3f8e`)
```bash
git checkout 7fd3f8e -- <path/to/file>
```

### Full Rollback to Pre-Audit State
If you ever want to discard the entire audit and return to the exact pre-audit state:
```bash
git checkout main
# or reset chore/production-audit to the snapshot commit:
git reset --hard 7fd3f8e
npm install
```
