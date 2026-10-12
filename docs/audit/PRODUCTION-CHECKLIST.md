# Production & Deployment Readiness Checklist

## 1. Build, Type Safety & Code Quality
- [x] **Clean install**: `npm ci` / `npm install` succeeds cleanly with `package-lock.json`.
- [x] **Production build**: `npm run build` succeeds in `~12–15s` with **0 warnings** and **0 errors**.
- [x] **TypeScript check**: `npm run typecheck` (`tsc --noEmit`) passes with **0 errors**.
- [x] **Linter check**: `npm run lint` (`eslint .`) passes with **0 errors** and **0 warnings**.
- [x] **Source maps disabled in production**: `vite.config.ts` sets `sourcemap: mode === 'development'`, verified `0` `.map` files in `dist/`.
- [x] **No debug console logs**: Removed `console.log("Supabase projects loaded:", ...)` from `ProjectsSection.tsx`; only genuine `console.error` handlers in `ErrorBoundary` and Supabase `catch` blocks remain.
- [x] **Error Boundaries**: Every major section (`Web1Section`, `NotebookSection`, `ProjectsSection`, `SkillPowerUpsSection`, `Footer`) is wrapped in `<ErrorBoundary>` and `<Suspense fallback={<LoadingFallback />}>`.
- [x] **404 Route**: `src/App.tsx` includes a catch-all `<Route path="*" element={<NotFound />} />`.

## 2. Environment & Secrets Security
- [x] **No leaked private keys**: Audited working tree and git history (`git log -p`); only public Supabase URL and publishable/anon key (`sb_publishable_...` / `eyJ...` with `"role":"anon"`) exist.
- [x] **`.gitignore` coverage**: `.env`, `.env.*`, `dist`, `node_modules`, and editor/build logs are ignored; `!.env.example` is tracked.
- [x] **`.env.example` provided**: Documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- [x] **Node version pinned**: `.nvmrc` (`22`) and `package.json` `"engines": { "node": ">=20.0.0" }` are present.

## 3. SEO, Meta & Crawlability
- [x] **Document metadata (`index.html`)**: `<html lang="en">`, `<meta charset="UTF-8">`, `<meta name="viewport">`, `<title>`, `<meta name="description">`, `<meta name="theme-color" content="#000000">`.
- [x] **Canonical URL**: `<link rel="canonical" href="https://psp-02-portfolio.netlify.app/" />`.
- [x] **Open Graph & Twitter Cards**: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, and `twitter:card` tags present.
- [x] **Structured Data**: Schema.org `Person` JSON-LD block present in `index.html`.
- [x] **`robots.txt` & `sitemap.xml`**: Present in `public/` and copied to `dist/`, with `Sitemap: https://psp-02-portfolio.netlify.app/sitemap.xml`.
- [x] **AI Crawlability (`llms.txt`)**: Present in `public/llms.txt` and copied to `dist/llms.txt`.

## 4. Hosting, Caching & Security Headers (`public/_redirects` & `public/_headers`)
- [x] **SPA Routing (`public/_redirects`)**: `/* /index.html 200` ensures client-side routes never 404 at the CDN edge.
- [x] **Immutable Asset Caching (`public/_headers`)**: `/assets/*` served with `Cache-Control: public, max-age=31536000, immutable`.
- [x] **HTML & Root Script Revalidation (`public/_headers`)**: `/index.html`, `/psp-intro.js`, and `/keyboard-toast.js` served with `Cache-Control: public, max-age=0, must-revalidate`.
- [x] **Security Headers (`public/_headers`)**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

## 5. Accessibility & Motion
- [x] **Skip Link**: `<a href="#main-content" class="sr-only focus:not-sr-only ...">Skip to main content</a>` in `index.html`.
- [x] **Reduced Motion**: Respected across `psp-intro.js`, `keyboard-toast.js`, `ScrambledText.tsx`, `SkillPowerUpsSection.tsx`, `GhostFibers.tsx`, `Galaxy.tsx`, and `Index.tsx`.
- [x] **Keyboard Shortcuts**: `Alt+1..4` section warp, `?` / `Alt+H` `MANUAL.TXT` dialog, and `Esc` dismissal verified.
- [x] **External Links**: All `target="_blank"` links include `rel="noopener noreferrer"` and descriptive `aria-label` attributes.

## 6. Continuous Integration
- [x] **GitHub Actions (`.github/workflows/ci.yml`)**: Automatically runs `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` on pushes and pull requests.
