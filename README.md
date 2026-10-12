# Pratik S Pawar — Portfolio

Personal portfolio website showcasing projects, academic background, and certifications with retro CRT/terminal aesthetics, interactive WebGL shaders, and a 3D paper certificate carousel.

- **Live URL**: [https://psp-02-portfolio.netlify.app/](https://psp-02-portfolio.netlify.app/)

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) (`@vitejs/plugin-react-swc`)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) + Radix Tooltip
- **Graphics & Animation**: [OGL](https://github.com/oframe/ogl) WebGL (`FaultyTerminal`, `GhostFibers`), Custom WebGL2 (`Galaxy`), Three.js 3D Paper Shader (`ThreeDPaper`), [Framer Motion](https://www.framer.com/motion/)
- **Backend / Data**: [Supabase](https://supabase.com/) (with offline/local fallback data in `src/data/projects.ts` and `src/components/certificates/CertificateCarousel.tsx`)
- **Deployment**: [Netlify](https://www.netlify.com/) (`public/_redirects` & `public/_headers`)

## Getting Started

### Prerequisites

- **Node.js**: `>= 20.0.0` (Node `22` LTS pinned in `.nvmrc`)
- **npm**: `10+`

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PratikPawar020403/psp-portfolio.git
   cd psp-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables (Optional — falls back to public read-only Supabase config):**
   Copy `.env.example` to `.env` if overriding the Supabase project:
   ```bash
   cp .env.example .env
   ```
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:8080](http://localhost:8080) in your browser.
   - Add `?intro` to force-play the PSP intro animation (`http://localhost:8080/?intro`).
   - Add `?toast` to force-show the `TIPS.TXT` terminal keyboard toast (`http://localhost:8080/?toast`).

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite dev server on `http://localhost:8080` |
| `npm run build` | Build production bundle into `dist/` |
| `npm run preview` | Serve the production `dist/` build locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm run typecheck` | Run TypeScript compiler check (`tsc --noEmit`) |

## Deployment (Netlify)

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Routing & Headers**: Automatically configured via `public/_redirects` (SPA history fallback) and `public/_headers` (immutable asset caching and security headers).
