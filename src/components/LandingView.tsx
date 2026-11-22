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
import { WorkflowShowcase } from "@/components/WorkflowShowcase";

interface LandingViewProps {
  isAuthenticated: boolean;
}

/**
 * หน้าแรก (/):
 * - ลำแสงสีเขียวด้านบนกระจายหลายจุดและเคลื่อนไหวตลอดเวลา (Animated Top Emerald Beams)
 * - ส่วน Hero ไร้กรอบสี่เหลี่ยมครอบ จัดวางชิดซ้ายใน Container กว้าง max-w-[1440px]
 * - ส่วนขั้นตอนการใช้งานแบบ Vertical Scroll Storytelling เต็มจอทีละขั้น
 */
export function LandingView({ isAuthenticated }: LandingViewProps) {
  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="relative overflow-x-clip flex-1">
      {/* Animated Top Emerald Beams (4 ลำแสงกระจายซ้าย-กลาง-ขวา เคลื่อนไหวสลับจังหวะตลอดเวลา) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] overflow-hidden z-0"
      >
        {/* ลำแสงที่ 1: ฝั่งซ้าย */}
        <div className="animate-beam-a absolute -top-28 left-[2%] h-[460px] w-[38vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent blur-3xl" />
        {/* ลำแสงที่ 2: กลางค่อนซ้าย */}
        <div className="animate-beam-b absolute -top-24 left-[26%] h-[520px] w-[36vw] min-w-[300px] rounded-full bg-gradient-to-b from-emerald-400/25 via-emerald-500/12 to-transparent blur-3xl" />
        {/* ลำแสงที่ 3: กลางค่อนขวา */}
        <div className="animate-beam-c absolute -top-32 left-[52%] h-[480px] w-[34vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-300/20 via-emerald-500/10 to-transparent blur-3xl" />
        {/* ลำแสงที่ 4: ฝั่งขวา */}
        <div className="animate-beam-a absolute -top-24 right-[2%] h-[450px] w-[35vw] min-w-[260px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-400/10 to-transparent blur-3xl" />
      </div>

      {/* Main Wrapper: ห้ามใช้ overflow-hidden เพื่อให้ Sticky Storytelling ด้านล่างทำงานได้ 100% */}
      <main className="relative z-10 w-full">
        {/* ส่วนที่ 1: Hero Section (ถอดกรอบสี่เหลี่ยมออก จัดชิดซ้ายใน Container max-w-[1440px]) */}
        <section className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="animate-enter max-w-4xl text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>โครงงานวิชา ดิจิทัลฟอร์อีคอมเมิร์ซ</span>
            </div>

            <h1 className="py-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 leading-[1.15]">
              คิดราคาขายให้มีกำไรจริง หยุดปัญหา{" "}
              <span className="text-emerald-400">“ขายดีแต่ขาดทุน”</span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-zinc-400">
              ผู้ขายออนไลน์จำนวนมากตั้งราคาจาก{" "}
              <span className="text-zinc-100 font-medium">
                ราคาขายลบต้นทุนสินค้าเพียงอย่างเดียว
              </span>{" "}
              แต่ลืมหักค่า GP แพลตฟอร์ม (12%–13%), ค่าโฆษณาต่อชิ้น,
              ค่ากล่องและบับเบิลกันกระแทก รวมถึงส่วนลดช่วงจัดแคมเปญ
              E-Com MarginLab ช่วยให้คุณเห็นกำไรสุทธิ จุดคุ้มทุน
              และผลกระทบจากโปรโมชันก่อนเปิดขายจริงในไม่กี่วินาที
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={startHref}
                className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500 px-7 py-4 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
              >
                <Calculator className="h-5 w-5" />
                <span>
                  {isAuthenticated
                    ? "เข้าสู่เครื่องมือคำนวณ (Dashboard)"
                    : "เข้าสู่ระบบ / เริ่มใช้งาน"}
                </span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* แถวการ์ดจุดเด่น 3 ใบ กว้างเต็ม Container max-w-[1440px] */}
          <div className="animate-enter-delay-1 mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                icon: Percent,
                title: "หักค่า GP แพลตฟอร์มแม่นยำ",
                desc: "มี Preset Shopee 13%, TikTok Shop 12%, Lazada 12% และขายตรง 0% พร้อมปรับแก้ตัวเลขได้อิสระ",
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
                  className="rounded-xl border border-zinc-800/90 bg-[#050505]/90 p-6 transition-all hover:border-emerald-500/40"
                >
                  <div className="mb-3.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-base leading-relaxed text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ส่วนที่ 2: Vertical Scroll Storytelling 4 ขั้นตอน (เต็มจอทีละขั้น) */}
        <WorkflowShowcase isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
}
