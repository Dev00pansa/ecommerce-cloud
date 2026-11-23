# KhumLab — Permanent AI Guardrails & Engineering Rules

All AI coding assistants and contributors working inside the `ecommerce-cloud` (**KhumLab**) repository MUST strictly obey the following non-negotiable rules at all times:

## 1. Google Search Console & SEO Protection (DO NOT DELETE OR MODIFY)
- **Site Verification Meta Tag:** NEVER delete, overwrite, or strip `metadata.verification.google` (`JEcBvWHZNHzyVdzt5HthC8q1MEl_Uegpb90xvexdm7Q`) in `src/app/layout.tsx`, and NEVER remove `<meta name="google-site-verification" ... />` from the landing page.
- **SEO Routes (`robots.txt` & `sitemap.xml`):** NEVER delete, rename, or break the routes of `src/app/robots.ts` or `src/app/sitemap.ts`.
- **Middleware Exclusions:** NEVER remove `robots.txt` or `sitemap.xml` from the `config.matcher` exclusion regex in `src/middleware.ts`, so search engine crawlers receive fast static responses without session interception.
- **Public vs. Private Indexing:** Keep public pages (`/`, `/credits`, `/login`) crawlable and keep private routes (`/dashboard`, `/dashboard/`, `/api/`) disallowed in `src/app/robots.ts`.

## 2. Strict Privacy Guardrail (Katum Group)
- **Zero Student IDs Anywhere:** NEVER write, commit, log, or display 10-digit student ID numbers of any member of the **Katum Group** (`กลุ่มคาทุม`, 5 members) anywhere in code, comments, UI, markdown files, commit messages, or tests.
- **Allowed Display Format:** Display ONLY the prefix (`นาย` / `Mr.`) and first/last name inside `src/components/CreditsView.tsx`.

## 3. Secrets & Credential Protection
- **No Secret Leakage:** NEVER commit or expose `.env`, `.env.local`, `.env*`, or any Supabase service/anon secret keys into Git history or client bundles beyond the intended public `NEXT_PUBLIC_*` variables.
- Ensure `.gitignore` continuously ignores `.env*` and `.vercel`.

## 4. Core System & Design Invariants
- **Default Theme:** Keep **Executive Light Mode (`"light"`)** as the default theme for first-time visitors in `src/context/ThemeContext.tsx` and the pre-render inline script in `src/app/layout.tsx`, while persisting user-selected `'dark'` or `'light'` choices in `localStorage` (`khumlab_theme`).
- **Dark Mode Integrity:** Preserve the existing Obsidian Black & Emerald Green Dark Mode card styling and animations intact.
- **Real App Screenshots:** Preserve all 4 real application captures inside `public/screenshots/` (`step-01-calculator.png`, `step-02-analytics.png`, `step-03-promo.png`, `step-04-cloud.png`) used by `WorkflowShowcase.tsx` and `AuthForm.tsx`; do NOT reintroduce generic stock photos.
- **Financial Formulas & Database Integrity:** Do NOT alter core pure calculation logic in `src/lib/calculator.ts` or break Supabase PostgreSQL schema, Storage buckets, or Row-Level Security (RLS) policies unless explicitly requested.

## 5. Code Quality & Release Discipline
- Write self-documenting TypeScript without verbose Thai explanatory comments in source files.
- Always run `npm run lint` and `npm run build` with **0 Errors** before committing or pushing to `origin/main`.
