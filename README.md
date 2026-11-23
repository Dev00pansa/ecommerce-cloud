# KhumLab `v1.1.0`

**Live App:** https://khumlab.vercel.app

A real-cost pricing calculator, profit diagnostics engine, and break-even analytics web application built for e-commerce sellers and online store owners. KhumLab helps merchants calculate true unit margins, factor in marketplace GP fees, packaging, ad spend, and fixed overhead, and simulate flash sale discounts before launching campaigns.

## Key Features

- **Full-Site Bilingual Support (TH / EN):** Switch seamlessly between Thai and English across every page, form, diagnostic chart, modal, notification toast, and CSV export header, persisted automatically across sessions.
- **Marketplace GP & True Unit Cost Calculator:** Built-in presets for Shopee (13%), TikTok Shop (12%), Lazada (12%), and Direct Sales (0%) with customizable fee overrides, per-unit product cost, packaging materials, average ad spend (CPA), and monthly fixed overhead.
- **E-Commerce Financial Diagnostic Engine:** Evaluates a composite Profit Health Score (`0–100`, Grades `S–D`), Cost Structure Donut Chart, Discount Sensitivity Simulator (`0%–50%`), Volume & Break-Even Projection Chart (Revenue vs. Cumulative Net Profit), Return Loss risk multiplier, Max Safe CPA / Break-Even ROAS, 3-tier suggested retail prices, and actionable optimization recommendations.
- **Layered Emerald Glass UI & Semantic Analytics:** Obsidian Black & Emerald Green compartmentalized glassmorphism cards paired with a semantic multi-color data palette for instant readability across desktop and mobile viewports.
- **Private Cloud Storage (Up to 20 Plans / Account):** Save, edit, single-delete, or bulk-delete pricing plans with Realtime Supabase synchronization, automatic product photo compression (under 120 KB), and duplicate product name protection.
- **Custom-Column CSV Export:** Choose exactly which products and data columns to export into a UTF-8 BOM CSV spreadsheet ready for Microsoft Excel and Google Sheets.
- **Backend-First Account Security:** Server-side SSR route protection via `@supabase/ssr`, case-sensitive username authentication, anti-bot registration guard, rate-limit cooldowns, and strict PostgreSQL Row-Level Security (RLS) isolating every user's data and storage objects.

## Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 & Lucide Icons
- **Backend & Cloud:** Supabase (Auth, PostgreSQL, Storage, Realtime, RLS)
- **Hosting:** Vercel (Function Region `sin1` Singapore)

### Project Structure

```text
src/
├── app/                # Next.js App Router pages, API guard, OpenGraph image
├── components/         # Modular UI components (Navbar, AuthForm, CalculatorForm, AnalyticsCharts, HistoryPanel)
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

Open http://localhost:3000 in your browser to start developing locally, or visit the live production app at https://khumlab.vercel.app.
