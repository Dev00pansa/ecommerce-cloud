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
import { KhumLabLogo } from "@/components/KhumLabLogo";
import { WorkflowShowcase } from "@/components/WorkflowShowcase";
import { Footer } from "@/components/Footer";

interface LandingViewProps {
  isAuthenticated: boolean;
}

/**
 * หน้าแรก (/) แบรนด์ KhumLab:
 * - ลำแสงสีเขียวด้านบนกระจาย 4 จุดเคลื่อนไหวตลอดเวลา
 * - ส่วน Hero 2 คอลัมน์ (ซ้ายข้อความ lg:col-span-7 / ขวาโลโก้ 3D เรืองแสง lg:col-span-5)
 * - ส่วนขั้นตอนการใช้งานแบบ Vertical Scroll Storytelling ทีละขั้น
 * - ส่วนท้ายเว็บ Footer พื้นหลังสีเทาเข้มทึบ
 */
export function LandingView({ isAuthenticated }: LandingViewProps) {
  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="relative overflow-x-clip flex-1 flex flex-col">
      {/* Animated Top Emerald Beams (4 ลำแสงกระจายซ้าย-กลาง-ขวา เคลื่อนไหวสลับจังหวะตลอดเวลา) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] overflow-hidden z-0"
      >
        <div className="animate-beam-a absolute -top-28 left-[2%] h-[460px] w-[38vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="animate-beam-b absolute -top-24 left-[26%] h-[520px] w-[36vw] min-w-[300px] rounded-full bg-gradient-to-b from-emerald-400/25 via-emerald-500/12 to-transparent blur-3xl" />
        <div className="animate-beam-c absolute -top-32 left-[52%] h-[480px] w-[34vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-300/20 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="animate-beam-a absolute -top-24 right-[2%] h-[450px] w-[35vw] min-w-[260px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-400/10 to-transparent blur-3xl" />
      </div>

      {/* Main Wrapper: ห้ามใช้ overflow-hidden เพื่อให้ Sticky Storytelling ทำงานได้ 100% */}
      <main className="relative z-10 w-full flex-1">
        {/* ส่วนที่ 1: Hero Section 2 คอลัมน์ (ซ้ายเนื้อหา / ขวาโลโก้ KhumLab 3D) */}
        <section className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 pt-12 pb-20 sm:pt-16 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            {/* ฝั่งซ้าย (lg:col-span-7): ข้อความ Hero ชิดซ้าย */}
            <div className="animate-enter lg:col-span-7 text-left space-y-6">
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
                KhumLab ช่วยให้คุณเห็นกำไรสุทธิ จุดคุ้มทุน
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

            {/* ฝั่งขวา (lg:col-span-5): โลโก้ KhumLab พื้นหลังโปร่งใสพร้อมเอฟเฟกต์ 3D & วงโคจรแสง */}
            <div className="animate-enter-delay-1 lg:col-span-5 flex items-center justify-center">
              <KhumLabLogo variant="hero" />
            </div>
          </div>

          {/* แถวการ์ดจุดเด่น 3 ใบ กว้างเต็ม Container max-w-[1440px] */}
          <div className="animate-enter-delay-2 mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
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
                desc: "บันทึกข้อมูลส่วนตัวบน Cloud โหลดกลับมาปรับราคาและส่งออกไฟล์ CSV ได้ทันที",
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

        {/* ส่วนที่ 2: Vertical Scroll Storytelling 4 ขั้นตอน */}
        <WorkflowShowcase isAuthenticated={isAuthenticated} />
      </main>

      {/* ส่วนที่ 3: Footer พื้นหลังสีเทาเข้มทึบ */}
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
