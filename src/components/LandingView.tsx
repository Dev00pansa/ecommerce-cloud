"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  CloudUpload,
  Percent,
  Sliders,
  Sparkles,
  Store,
  Target,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface LandingViewProps {
  isAuthenticated: boolean;
}

/**
 * หน้าแรก (/): ยุบรวมส่วนแนะนำเว็บและวิธีการใช้งาน 4 ขั้นตอนเข้าด้วยกัน
 * พร้อม Staggered Entrance Animation ตามลำดับการอ่าน
 */
export function LandingView({ isAuthenticated }: LandingViewProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white/95";
  const subCardClass = isDark
    ? "border-zinc-800/80 bg-[#0A0A0A]"
    : "border-slate-200 bg-slate-50/80";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14 space-y-12">
      {/* ส่วนที่ 1: Hero อธิบายปัญหาและคุณค่าหลัก */}
      <section
        className={`animate-enter rounded-xl border p-6 sm:p-10 transition-colors ${cardClass}`}
      >
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            <Sparkles className="h-3.5 w-3.5" />
            <span>โครงงานวิชา ดิจิทัลฟอร์อีคอมเมิร์ซ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            คิดราคาขายให้มีกำไรจริง หยุดปัญหา{" "}
            <span className="text-emerald-500">“ขายดีแต่ขาดทุน”</span>
          </h1>

          <p className={`text-sm sm:text-base leading-relaxed ${mutedText}`}>
            ผู้ขายออนไลน์จำนวนมากตั้งราคาจาก{" "}
            <span className={isDark ? "text-zinc-200 font-medium" : "text-slate-900 font-medium"}>
              ราคาขายลบต้นทุนสินค้าเพียงอย่างเดียว
            </span>{" "}
            แต่ลืมหักค่า GP แพลตฟอร์ม (12%–13%), ค่าโฆษณาต่อชิ้น, ค่ากล่องและบับเบิลกันกระแทก รวมถึงส่วนลดช่วงจัดแคมเปญ
            E-Com MarginLab ช่วยให้คุณเห็นกำไรสุทธิ จุดคุ้มทุน และผลกระทบจากโปรโมชันก่อนเปิดขายจริงในไม่กี่วินาที
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={startHref}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
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
        <div className="animate-enter-delay-1 mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
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
                className={`rounded-lg border p-4 transition-colors ${subCardClass}`}
              >
                <div className="mb-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <Icon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold mb-1">{item.title}</h2>
                <p className={`text-xs leading-relaxed ${mutedText}`}>
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ส่วนที่ 2: ขั้นตอนการใช้งาน 4 ขั้นตอนต่อเนื่องเป็นเรื่องเดียวกัน */}
      <section className="animate-enter-delay-2 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
              Workflow Overview
            </span>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
              เริ่มต้นใช้งานได้ใน 4 ขั้นตอน
            </h2>
          </div>
          <span className={`text-xs ${subtleText}`}>
            สมัครสมาชิกด้วย Username เพื่อเข้าใช้งานหน้า Dashboard ส่วนตัว
          </span>
        </div>

        <div className="animate-enter-delay-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              icon: Store,
              title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
              desc: "กด Preset แพลตฟอร์มที่ขาย แล้วกรอกต้นทุนสินค้า ค่าแพ็ก ค่าแอด และราคาขายต่อชิ้น",
            },
            {
              step: "02",
              icon: Target,
              title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
              desc: "ระบบคำนวณ Net Margin % และจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time",
            },
            {
              step: "03",
              icon: Sliders,
              title: "จำลองส่วนลดโปรโมชัน",
              desc: "เลื่อนแถบส่วนลด 0%–50% เพื่อวางแผนราคา Flash Sale โดยไม่เผลอตั้งราคาจนขาดทุน",
            },
            {
              step: "04",
              icon: CloudUpload,
              title: "บันทึก Cloud & Export CSV",
              desc: "บันทึกโครงสร้างราคาสินค้าเก็บไว้บน Cloud โหลดกลับมาแก้ไขหรือส่งออกทำรายงานได้ทันที",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 ${cardClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                    STEP {step.step}
                  </span>
                </div>
                <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                <p className={`text-xs leading-relaxed ${mutedText}`}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
