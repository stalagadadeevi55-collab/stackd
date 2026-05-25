# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check then bundle for production (generates PWA service worker)
npm run lint      # Run ESLint
npm run preview   # Serve the production build locally
npm test          # Run Vitest unit tests
npm run test:coverage  # Run tests with coverage report
```

## Architecture

**Stackd** is a React 19 + TypeScript SPA — a financial planning tool for young professionals. The build pipeline is Vite 8 with the `@vitejs/plugin-react` plugin (Oxc compiler), Tailwind CSS via `@tailwindcss/vite`, and `vite-plugin-pwa` for service worker + PWA manifest.

Entry chain: `index.html` → `src/main.tsx` → `src/router.tsx` → pages.

All application code lives under `src/`. There are no sub-packages or workspaces.

**External services**: Supabase (auth + PostgreSQL). Credentials must be in `.env.local`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Data flow**: All financial calculations are pure TypeScript functions in `src/lib/calculations/`. User profile is stored in Supabase `profiles` table and cached locally in Zustand with `persist` middleware (localStorage key: `stackd-profile`). Calculations run client-side — no backend server needed.

**Routing**: React Router v7 with `createBrowserRouter`. Route hierarchy: public (`/`, `/auth`) → `AuthGuard` → `OnboardingGuard` → `AppShell` → feature pages. `AuthGuard` redirects unauthenticated users to `/auth`. `OnboardingGuard` redirects users with no profile to `/onboarding`.

**Styling**: Global Tailwind is imported once in `src/index.css`. Dark theme: slate-950 background, emerald-400 accents. No `tailwind.config.js` — using Tailwind v4 defaults via vite plugin.

**TypeScript strictness**: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `noFallthroughCasesInSwitch` are all enabled. `verbatimModuleSyntax` is on — use `import type` for type-only imports. No `enum` — use `const` object maps with `as const` and derived union types.

**ESLint** uses flat-config format (`eslint.config.js`). Run lint before committing.

**Testing**: Vitest with jsdom environment. Tests live alongside source in `src/lib/calculations/*.test.ts`. The Walmart/Bentonville scenario ($90k salary, 6% 401k, AR state, biweekly) is the canonical test fixture.

## Key calculation facts

- Biweekly = **26** pay periods/year (not 24 — that's semi-monthly)
- 401k pre-tax contributions reduce federal taxable income (not state or FICA base)
- `employerMatch = salary × min(contributionPct, matchCapPct)/100 × (matchPct/100)`
- Federal tax brackets are in `src/lib/constants.ts` — separate arrays per filing status using actual 2024 IRS thresholds
- State tax rates are flat/approximate in `STATE_TAX_RATES` — clearly labeled as estimates

## Folder structure

```
src/
  auth/           # AuthContext (Supabase session), AuthGuard, OnboardingGuard
  components/
    ui/           # Card, Button, Input, Select, Badge, Disclaimer, UpdateBanner, ErrorBoundary
    layout/       # AppShell (nav), BottomNav (mobile tabs), PageHeader
  features/
    profile/      # OnboardingWizard (5-step), ProfileForm
    dashboard/    # SummaryCard, NextStepCard
  lib/
    supabase.ts         # createClient<Database>(...)
    profileMapper.ts    # toUserProfile / toProfileRow (snake_case ↔ camelCase)
    constants.ts        # Tax brackets, FICA, STATE_TAX_RATES, PAY_PERIODS, US_STATES
    calculations/       # taxes, paycheck, retirement, investment, recommendations + *.test.ts
  hooks/
    useProfile.ts   # Fetch from Supabase, sync to Zustand; saveProfile()
    usePaycheck.ts  # useMemo wrapper around calculatePaycheck
  store/
    profileStore.ts  # Zustand + persist (localStorage)
  types/
    index.ts        # UserProfile, PaycheckResult, RetirementResult, etc.
    supabase.ts     # Database type (hand-authored; replace with supabase gen types)
  pages/           # One file per route (DashboardPage, PaycheckPage, etc.)
  router.tsx       # createBrowserRouter definition
```
