"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Percent,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { WorkflowShowcase } from "@/components/WorkflowShowcase";

interface LandingViewProps {
  isAuthenticated: boolean;
}

/**
 * หน้าแรก (/): ยุบรวมส่วนแนะนำเว็บและวิธีการใช้งาน 4 ขั้นตอนเข้าด้วยกัน
 * พร้อม Top-Down Hero Emerald Beam และ Staggered Entrance Animation
 */
export function LandingView({ isAuthenticated }: LandingViewProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]/90"
    : "border-slate-200 bg-white/95";
  const subCardClass = isDark
    ? "border-zinc-800/80 bg-[#0A0A0A]/90"
    : "border-slate-200 bg-slate-50/80";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";

  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="relative overflow-x-clip flex-1">
      {/* Top-Down Hero Emerald Beam (2 ชั้นซ้อนกันเพื่อความมีมิติ) */}
      <div
        aria-hidden="true"
        className="animate-enter pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden"
      >
        {/* ชั้นนอก: แสงฟุ้งวงกว้างส่องจากขอบบนลงมากลางหน้าจอ */}
        <div
          className={`absolute left-1/2 -top-20 h-[440px] w-[min(1100px,96vw)] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/20 via-emerald-400/10 to-transparent blur-3xl ${
            isDark ? "opacity-100" : "opacity-65"
          }`}
        />
        {/* ชั้นใน: ลำแสงไฮไลต์สีเขียวสว่างตรงกึ่งกลางด้านบน */}
        <div
          className={`absolute left-1/2 -top-12 h-[260px] w-[min(460px,75vw)] -translate-x-1/2 rounded-full bg-emerald-400/25 blur-3xl ${
            isDark ? "opacity-95" : "opacity-55"
          }`}
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 space-y-14">
        {/* ส่วนที่ 1: Hero อธิบายปัญหาและคุณค่าหลัก */}
        <section
          className={`animate-enter relative overflow-hidden rounded-xl border p-6 sm:p-10 transition-colors ${cardClass}`}
        >
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>โครงงานวิชา ดิจิทัลฟอร์อีคอมเมิร์ซ</span>
            </div>

            <h1 className="py-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.15]">
              คิดราคาขายให้มีกำไรจริง หยุดปัญหา{" "}
              <span className="text-emerald-500">“ขายดีแต่ขาดทุน”</span>
            </h1>

            <p className={`text-lg md:text-xl leading-relaxed ${mutedText}`}>
              ผู้ขายออนไลน์จำนวนมากตั้งราคาจาก{" "}
              <span
                className={
                  isDark
                    ? "text-zinc-200 font-medium"
                    : "text-slate-900 font-medium"
                }
              >
                ราคาขายลบต้นทุนสินค้าเพียงอย่างเดียว
              </span>{" "}
              แต่ลืมหักค่า GP แพลตฟอร์ม (12%–13%), ค่าโฆษณาต่อชิ้น,
              ค่ากล่องและบับเบิลกันกระแทก รวมถึงส่วนลดช่วงจัดแคมเปญ
              E-Com MarginLab ช่วยให้คุณเห็นกำไรสุทธิ จุดคุ้มทุน
              และผลกระทบจากโปรโมชันก่อนเปิดขายจริงในไม่กี่วินาที
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={startHref}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
              >
                <Calculator className="h-4 w-4" />
                <span>
                  {isAuthenticated
                    ? "เข้าสู่เครื่องมือคำนวณ (Dashboard)"
                    : "เข้าสู่ระบบ / เริ่มใช้งาน"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* จุดเด่น 3 ข้อแบบกระชับ */}
          <div className="animate-enter-delay-1 mt-9 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Percent,
                title: "หักค่า GP แพลตฟอร์มแม่นยำ",
                desc: "มี Preset Shopee 13%, TikTok Shop 12%, Lazada 12% และขายตรง 0% พร้อมปรับแก้ได้อิสระ",
              },
              {
                icon: Sliders,
                title: "จำลองโปรโมชัน 0%–50%",
                desc: "รู้ทันทีว่าถ้าลดราคาลง กำไรต่อชิ้นเหลือเท่าไหร่ และต้องขายเพิ่มกี่ชิ้นจึงจะได้กำไรรวมเท่าเดิม",
              },
              {
                icon: BarChart3,
                title: "บันทึกแผนราคาบน Cloud",
                desc: "จัดเก็บประวัติคำนวณส่วนตัวด้วย Supabase RLS โหลดกลับมาปรับราคาและ Export CSV ได้ทันที",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`rounded-lg border p-5 transition-colors ${subCardClass}`}
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-base font-bold mb-1.5">{item.title}</h2>
                  <p className={`text-sm leading-relaxed ${mutedText}`}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ส่วนที่ 2: ขั้นตอนการใช้งาน 4 ขั้นตอน */}
        <WorkflowShowcase />
      </main>
    </div>
  );
}
