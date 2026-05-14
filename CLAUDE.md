# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check then bundle for production
npm run lint      # Run ESLint
npm run preview   # Serve the production build locally
```

There is no test runner configured yet.

## Architecture

**Stackd** is a React 19 + TypeScript SPA — a financial planning tool. The build pipeline is Vite 8 with the `@vitejs/plugin-react` plugin (Oxc compiler) and Tailwind CSS via `@tailwindcss/vite`.

Entry chain: `index.html` → `src/main.tsx` → `src/App.tsx`.

All application code lives under `src/`. There are no sub-packages or workspaces; `tsconfig.json` uses project references pointing to `tsconfig.app.json` (browser code) and `tsconfig.node.json` (Vite config / build scripts).

**Styling**: Global Tailwind is imported once in `src/index.css`. Component-scoped styles use plain CSS with nesting in `*.css` files co-located with their component. The theme is dark (slate-950 background, emerald-400 accents).

**TypeScript strictness**: `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all enabled in `tsconfig.app.json`. `verbatimModuleSyntax` is on — use `import type` for type-only imports.

**ESLint** uses the flat-config format (`eslint.config.js`) with `react-hooks` and `react-refresh` plugins. Run lint before committing; the build does not automatically gate on lint.
