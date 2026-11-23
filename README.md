# KhumLab `v1.2.0`

**Live App:** https://khumlab.vercel.app

A real-cost pricing calculator, profit diagnostics engine, and break-even analytics web application built for e-commerce sellers and online store owners. KhumLab helps merchants calculate true unit margins, factor in marketplace GP fees, packaging, ad spend, and fixed overhead, and simulate flash sale discounts before launching campaigns.

## Key Features

- **Dual-Theme Design System (Obsidian Dark Mode & Executive Light Mode):** Switch seamlessly between KhumLab's signature Obsidian Black & Emerald Green glassmorphism dark theme and a high-contrast Executive Clean Light Mode crafted for daylight readability — persisted automatically in `localStorage` without flash-of-wrong-theme.
- **Public Navbar Theme & Language Controls:** Instant Light/Dark toggle (`Sun` / `Moon`) and bilingual `TH | EN` switcher accessible directly from the Navbar across the Landing page, Login page, Creator Credits page, and Authenticated Dashboard.
- **Full-Site Bilingual Support (TH / EN):** 100% localized Thai and English experience covering every form, diagnostic engine insight, interactive SVG chart, modal, toast notification, footer, credits page, and exported CSV column header.
- **Marketplace GP & True Unit Cost Calculator:** Built-in presets for Shopee (13%), TikTok Shop (12%), Lazada (12%), and Direct Sales (0%) with customizable fee overrides, per-unit product cost, packaging materials, average ad spend (CPA), and monthly fixed overhead.
- **E-Commerce Financial Diagnostic Engine:** Composite Profit Health Score (`0–100`, Grades `S–D`), multi-color Cost Structure Donut Chart, Discount Sensitivity Simulator (`0%–50%`), paired Revenue vs. Cumulative Net Profit Volume Projection Chart, Return Loss risk multiplier, Max Safe CPA / Break-Even ROAS, 3-tier suggested retail prices, and actionable optimization steps.
- **Private Cloud Storage (Up to 20 Plans / Account):** Save, edit, single-delete, or bulk-delete pricing plans with Realtime Supabase synchronization, automatic product photo compression (under 120 KB), custom-column CSV export, and duplicate product name protection.
- **Creator Credits & Architecture Page (`/credits`):** Dedicated bilingual showcase detailing the project origin, developer profile (`@Dev00pansa`), open-source repository links, and full technology architecture.
- **Backend-First Account Security:** Server-side SSR route protection via `@supabase/ssr`, case-sensitive username authentication, anti-bot registration guard, rate-limit cooldowns, and strict PostgreSQL Row-Level Security (RLS) isolating every user's data and storage objects.

## Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 (Custom `light:` variant) & Lucide Icons
- **Backend & Cloud:** Supabase (Auth, PostgreSQL, Storage, Realtime, RLS)
- **Hosting:** Vercel (Function Region `sin1` Singapore)

### Project Structure

```text
src/
├── app/                # Next.js App Router pages (/, /login, /dashboard, /credits), API guard, OpenGraph
├── components/         # Modular UI components (Navbar, Footer, CreditsView, CalculatorForm, AnalyticsCharts, HistoryPanel)
├── context/            # ThemeContext (Obsidian Dark & Executive Light persistence)
├── lib/                # Pure calculation engine, auth validators, i18n language store, Supabase SSR clients
└── types/              # Strict shared TypeScript interfaces and types
```

## Local Development

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/Dev00pansa/ecommerce-cloud.git
cd ecommerce-cloud
npm install
```

2. Create a `.env.local` file in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser to develop locally, or visit the live production app at https://khumlab.vercel.app.
