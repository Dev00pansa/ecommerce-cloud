"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Cloud,
  Code2,
  Cpu,
  ExternalLink,
  GraduationCap,
  Layers,
  Palette,
  Rocket,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { useAppLanguage } from "@/lib/language";
import { FloatingBackgroundDocs } from "@/components/FloatingBackgroundDocs";
import { KhumLabLogo } from "@/components/KhumLabLogo";

interface CreditsViewProps {
  isAuthenticated: boolean;
}

function GitHubLogoSvg({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

interface TechStackItem {
  name: string;
  roleTh: string;
  roleEn: string;
  descTh: string;
  descEn: string;
  accentClass: string;
  icon: "layers" | "code" | "palette" | "cloud" | "rocket";
}

const TECH_STACK_ITEMS: readonly TechStackItem[] = [
  {
    name: "Next.js 16",
    roleTh: "App Router & Turbopack",
    roleEn: "App Router & Turbopack",
    descTh:
      "โครงสร้างเว็บแอปสมัยใหม่ รองรับ Server Components และระบบตรวจสอบสิทธิ์ฝั่งเซิร์ฟเวอร์",
    descEn:
      "Modern React framework powering App Router, Server Components, and backend-first route guards.",
    accentClass:
      "border-emerald-500/25 text-emerald-400 bg-emerald-500/12 light:border-emerald-200 light:text-emerald-700 light:bg-emerald-50",
    icon: "layers",
  },
  {
    name: "TypeScript",
    roleTh: "Strict Type Safety",
    roleEn: "Strict Type Safety",
    descTh:
      "ควบคุมความถูกต้องของสูตรคำนวณต้นทุน กำไรสุทธิ และข้อมูลจากฐานข้อมูลแบบปลอดภัย 100%",
    descEn:
      "End-to-end strict typing across all pure financial formulas, edge-case guards, and cloud records.",
    accentClass:
      "border-cyan-500/25 text-cyan-400 bg-cyan-500/12 light:border-cyan-200 light:text-cyan-700 light:bg-cyan-50",
    icon: "code",
  },
  {
    name: "Tailwind CSS v4",
    roleTh: "Dual-Theme Design System",
    roleEn: "Dual-Theme Design System",
    descTh:
      "ระบบดีไซน์กระจก 2 ชั้นรองรับทั้ง Obsidian Dark Mode และ Executive Light Mode อย่างสมบูรณ์",
    descEn:
      "Two-layer glassmorphism design system supporting Obsidian Dark Mode and Executive Light Mode.",
    accentClass:
      "border-indigo-500/25 text-indigo-400 bg-indigo-500/12 light:border-indigo-200 light:text-indigo-700 light:bg-indigo-50",
    icon: "palette",
  },
  {
    name: "Supabase Cloud",
    roleTh: "Auth, PostgreSQL, Storage & RLS",
    roleEn: "Auth, PostgreSQL, Storage & RLS",
    descTh:
      "ฐานข้อมูลคลาวด์ส่วนตัวแบบ Realtime พร้อมแยกสิทธิ์ Row-Level Security และบีบอัดรูปอัตโนมัติ",
    descEn:
      "Private realtime PostgreSQL persistence with Row-Level Security isolation and compressed image storage.",
    accentClass:
      "border-purple-500/25 text-purple-400 bg-purple-500/12 light:border-purple-200 light:text-purple-700 light:bg-purple-50",
    icon: "cloud",
  },
  {
    name: "Vercel Edge",
    roleTh: "Global Hosting (sin1 Singapore)",
    roleEn: "Global Hosting (sin1 Singapore)",
    descTh:
      "โฮสติ้งความเร็วสูงในภูมิภาคสิงคโปร์เพื่อการตอบสนองที่รวดเร็วสำหรับผู้ใช้งานในประเทศไทย",
    descEn:
      "Low-latency production deployment in the Singapore region optimized for Southeast Asian sellers.",
    accentClass:
      "border-amber-500/25 text-amber-400 bg-amber-500/12 light:border-amber-200 light:text-amber-700 light:bg-amber-50",
    icon: "rocket",
  },
];

function TechIcon({ icon }: { icon: TechStackItem["icon"] }) {
  switch (icon) {
    case "layers":
      return <Layers className="h-4 w-4" />;
    case "code":
      return <Code2 className="h-4 w-4" />;
    case "palette":
      return <Palette className="h-4 w-4" />;
    case "cloud":
      return <Cloud className="h-4 w-4" />;
    case "rocket":
      return <Rocket className="h-4 w-4" />;
  }
}

export function CreditsView({ isAuthenticated }: CreditsViewProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const homeHref = isAuthenticated ? "/?landing=1" : "/";

  return (
    <div className="relative z-0 flex-1 flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black light:bg-[#f8fafc]"
      >
        <div className="khumlab-dashboard-dots absolute inset-0" />
        <div
          className="animate-dashboard-glow-a absolute inset-x-0 top-0 h-[560px] light:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(16, 185, 129, 0.22), rgba(16, 185, 129, 0.08) 45%, transparent 78%)",
          }}
        />
        <div className="animate-dashboard-glow-b absolute -top-24 left-[8%] h-[420px] w-[42vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/20 via-emerald-500/8 to-transparent light:from-emerald-500/[0.08] light:via-emerald-400/[0.03] blur-3xl" />
        <div className="animate-dashboard-glow-a absolute -top-28 right-[8%] h-[440px] w-[40vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-400/18 via-emerald-500/8 to-transparent light:from-emerald-500/[0.07] light:via-emerald-400/[0.02] blur-3xl" />
        <FloatingBackgroundDocs />
      </div>

      <main className="relative z-10 w-full max-w-[1120px] mx-auto flex-1 px-4 sm:px-8 lg:px-10 py-10 sm:py-14 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800/90 bg-[#060807]/85 px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 backdrop-blur-md transition-colors hover:border-emerald-500/50 hover:text-emerald-300 light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:text-emerald-700 light:shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isEn ? "Back to Home" : "กลับหน้าหลัก"}</span>
          </Link>

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#060807]/85 px-3.5 py-1.5 font-mono text-xs font-medium text-emerald-300 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isEn
                ? "v1.2.0 (Updated Nov 23, 2026)"
                : "v1.2.0 (อัปเดต 23 พ.ย. 2569)"}
            </span>
          </span>
        </div>

        <div className="space-y-2 animate-enter">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 light:text-emerald-700">
            KHUMLAB CREATOR CREDITS
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white light:text-slate-900">
            {isEn ? "Credits & Architecture" : "เครดิตผู้จัดทำและสถาปัตยกรรมระบบ"}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 light:text-slate-600 max-w-2xl leading-relaxed">
            {isEn
              ? "Meet the creator behind KhumLab and explore the modern web stack powering real-cost e-commerce profit intelligence."
              : "ข้อมูลผู้พัฒนาเบื้องหลัง KhumLab และชุดเทคโนโลยีสมัยใหม่ที่ขับเคลื่อนเครื่องมือคำนวณต้นทุนและกำไรสำหรับผู้ขายออนไลน์"}
          </p>
        </div>

        <section className="animate-enter-delay-1 rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-slate-200 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                  CREATOR PROFILE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                  {isEn ? "Developer & Project Origin" : "ข้อมูลผู้พัฒนาและที่มาของโครงงาน"}
                </h2>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-300 light:border-emerald-300 light:bg-emerald-100/80 light:text-emerald-800">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Digital for E-Commerce</span>
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-500/20 via-black to-emerald-950/50 shadow-[0_0_24px_rgba(16,185,129,0.22)] light:border-emerald-200 light:from-emerald-50 light:via-white light:to-emerald-100/70 light:shadow-sm">
                  <KhumLabLogo size={48} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white light:text-slate-900">
                      Dev00pansa
                    </h3>
                    <span className="rounded-lg border border-zinc-800 bg-black/70 px-2.5 py-0.5 text-xs font-medium text-zinc-300 light:border-slate-200 light:bg-slate-100 light:text-slate-700">
                      Pansa Ruamsap
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400 light:text-emerald-700">
                    Creator & Full-Stack Developer
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-black/55 p-5 space-y-3 text-sm sm:text-base leading-relaxed text-zinc-300 light:border-slate-200 light:bg-slate-50/80 light:text-slate-700">
              <p>
                {isEn ? (
                  <>
                    <strong className="text-white light:text-slate-900">
                      KhumLab
                    </strong>{" "}
                    was designed and engineered by{" "}
                    <strong className="text-emerald-400 light:text-emerald-700">
                      Dev00pansa (Pansa Ruamsap)
                    </strong>{" "}
                    as a flagship project for the{" "}
                    <strong className="text-white light:text-slate-900">
                      Digital for E-Commerce
                    </strong>{" "}
                    course.
                  </>
                ) : (
                  <>
                    <strong className="text-white light:text-slate-900">
                      KhumLab
                    </strong>{" "}
                    ได้รับการออกแบบและพัฒนาโดย{" "}
                    <strong className="text-emerald-400 light:text-emerald-700">
                      Dev00pansa (Pansa Ruamsap)
                    </strong>{" "}
                    ขึ้นเป็นโครงงานในรายวิชา{" "}
                    <strong className="text-white light:text-slate-900">
                      ดิจิทัลฟอร์อีคอมเมิร์ซ (Digital for E-Commerce)
                    </strong>
                  </>
                )}
              </p>
              <p className="text-zinc-400 light:text-slate-600 text-sm">
                {isEn
                  ? "Created with a clear mission: empower online merchants and brand owners to uncover hidden marketplace GP fees, ad costs, packaging expenses, and flash sale risks so they can price confidently for real net profit — completely free to use."
                  : "พัฒนาขึ้นด้วยเป้าหมายที่ชัดเจนในการช่วยให้ผู้ขายออนไลน์และเจ้าของแบรนด์สามารถคำนวณต้นทุนแฝง ค่า GP แพลตฟอร์ม ค่าโฆษณา ค่าแพ็ก และผลกระทบจากส่วนลดโปรโมชันได้อย่างแม่นยำ เพื่อตั้งราคาขายที่มีกำไรสุทธิจริง โดยเปิดให้ใช้งานฟรีโดยไม่มีค่าใช้จ่าย"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="https://github.com/Dev00pansa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.45)] transition-all hover:bg-emerald-400 hover:-translate-y-0.5 light:bg-emerald-600 light:text-white light:shadow-sm light:hover:bg-emerald-700"
              >
                <GitHubLogoSvg className="h-4 w-4 shrink-0" />
                <span>
                  {isEn
                    ? "Visit GitHub Profile (@Dev00pansa)"
                    : "เยี่ยมชมโปรไฟล์ GitHub (@Dev00pansa)"}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
              </a>

              <a
                href="https://github.com/Dev00pansa/ecommerce-cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-emerald-500/30 bg-black/75 px-5 py-3 text-sm font-semibold text-zinc-100 transition-all hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 light:border-slate-300 light:bg-white light:text-slate-800 light:hover:border-emerald-600 light:hover:bg-emerald-50 light:hover:text-emerald-800 light:shadow-xs"
              >
                <GitHubLogoSvg className="h-4 w-4 shrink-0" />
                <span>
                  {isEn
                    ? "View Source Code (ecommerce-cloud)"
                    : "ดูซอร์สโค้ดโปรเจกต์ (ecommerce-cloud)"}
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </a>
            </div>
          </div>
        </section>

        <section className="animate-enter-delay-2 rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-slate-200 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400 light:text-emerald-700">
                  TECH STACK & ARCHITECTURE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white light:text-slate-900">
                  {isEn
                    ? "Technologies Powering KhumLab"
                    : "สถาปัตยกรรมและเทคโนโลยีที่ใช้พัฒนา"}
                </h2>
              </div>
            </div>

            <span className="rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 font-mono text-xs font-medium text-emerald-300 light:border-emerald-200 light:bg-white light:text-emerald-700">
              {isEn
                ? "v1.2.0 (Updated Nov 23, 2026)"
                : "v1.2.0 (อัปเดต 23 พ.ย. 2569)"}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TECH_STACK_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="rounded-xl border border-zinc-800/90 bg-black/65 p-5 space-y-3 transition-colors hover:border-emerald-500/35 light:border-slate-200 light:bg-slate-50/75 light:hover:border-emerald-300"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.accentClass}`}
                    >
                      <TechIcon icon={item.icon} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white light:text-slate-900 truncate">
                        {item.name}
                      </h3>
                      <p className="font-mono text-[11px] text-zinc-400 light:text-slate-500 truncate">
                        {isEn ? item.roleEn : item.roleTh}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 light:text-slate-600">
                    {isEn ? item.descEn : item.descTh}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
