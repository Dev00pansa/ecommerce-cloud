# GitHub Copilot Instructions — KhumLab (`ecommerce-cloud`)

Follow these permanent project guardrails whenever suggesting or editing code in this repository:

## 1. Google Search Console & SEO Protection
- **NEVER delete or modify** `metadata.verification.google` (`JEcBvWHZNHzyVdzt5HthC8q1MEl_Uegpb90xvexdm7Q`) in `src/app/layout.tsx`.
- **NEVER delete or break** `src/app/robots.ts` or `src/app/sitemap.ts`.
- **NEVER remove** `robots.txt` or `sitemap.xml` from `config.matcher` in `src/middleware.ts`.
- Keep `/`, `/credits`, and `/login` allowed and `/dashboard`, `/dashboard/`, and `/api/` disallowed in `src/app/robots.ts`.

## 2. Strict Privacy Guardrail (Katum Group)
- **NEVER include** 10-digit student ID numbers for any of the 5 Katum Group members anywhere in code, docs, UI, comments, or commit messages.
- Only display prefix (`นาย` / `Mr.`) and full names in `src/components/CreditsView.tsx`.

## 3. Secrets & Credentials
- **NEVER commit** `.env`, `.env.local`, `.env*`, or Supabase secret keys to Git. Verify `.gitignore` keeps `.env*` excluded.

## 4. Core Architecture & Visual Invariants
- Keep **Executive Light Mode (`"light"`)** as the default first-visit theme in `src/context/ThemeContext.tsx` and the inline pre-paint script in `src/app/layout.tsx`, while respecting saved `localStorage` (`khumlab_theme`) choices.
- Preserve existing Obsidian Dark Mode visuals and animations intact.
- Preserve the 4 real screenshots in `public/screenshots/` (`step-01-calculator.png`, `step-02-analytics.png`, `step-03-promo.png`, `step-04-cloud.png`).
- Preserve core calculation formulas in `src/lib/calculator.ts` and Supabase PostgreSQL/RLS security.
- Avoid verbose Thai explanatory comments in source code; verify `npm run lint` and `npm run build` pass with 0 Errors before pushing.
