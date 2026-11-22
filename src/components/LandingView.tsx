"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import {
  ArrowDown,
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
 * - ส่วน Hero จัดความสูง min-h-[calc(100vh-4rem)] ให้แสดงครบพอดีใน 1 หน้าจอ
 *   โดยไม่ให้หัวข้อ 4 ขั้นตอนด้านล่างโผล่แหว่งขึ้นมา
 * - มีปุ่มรอง "ดูวิธีใช้งาน (4 ขั้นตอน)" และแถบสัญญาณเลื่อนลงด้านล่างสุดของจอแรก
 */
export function LandingView({ isAuthenticated }: LandingViewProps) {
  const startHref = isAuthenticated ? "/dashboard" : "/login";

  function handleScrollToWorkflow(event: MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById("workflow");
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

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
        {/* ส่วนที่ 1: Hero Section พอดี 1 หน้าจอ (min-h-[calc(100vh-4rem)]) */}
        <section className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-between px-8 lg:px-16 pt-10 pb-8">
          {/* แถวบน: 2 คอลัมน์ (ซ้ายข้อความ Hero / ขวาโลโก้ KhumLab 3D) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 my-auto">
            <div className="animate-enter lg:col-span-7 text-left space-y-5">
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

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href={startHref}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
                >
                  <Calculator className="h-5 w-5" />
                  <span>
                    {isAuthenticated
                      ? "เข้าสู่เครื่องมือคำนวณ (Dashboard)"
                      : "เข้าสู่ระบบ / เริ่มใช้งาน"}
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <a
                  href="#workflow"
                  onClick={handleScrollToWorkflow}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/90 px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-200 transition-all hover:border-emerald-500/50 hover:text-emerald-400"
                >
                  <span>ดูวิธีใช้งาน (4 ขั้นตอน)</span>
                  <ArrowDown className="h-4 w-4 text-emerald-400" />
                </a>
              </div>
            </div>

            <div className="animate-enter-delay-1 lg:col-span-5 flex items-center justify-center">
              <KhumLabLogo variant="hero" />
            </div>
          </div>

          {/* แถวล่างของหน้าจอแรก: การ์ดจุดเด่น 3 ใบ + แถบสัญญาณเลื่อนลงดูวิธีใช้งาน */}
          <div className="space-y-6 pt-8">
            <div className="animate-enter-delay-2 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    className="rounded-xl border border-zinc-800/90 bg-[#050505]/90 p-5 transition-all hover:border-emerald-500/40"
                  >
                    <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-100 mb-1">
                      {item.title}
                    </h2>
                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* แถบสัญญาณขนาดกะทัดรัดด้านล่างสุดของหน้าจอ Hero */}
            <div className="animate-enter-delay-3 flex justify-center pt-1">
              <a
                href="#workflow"
                onClick={handleScrollToWorkflow}
                className="group inline-flex items-center gap-2 rounded-full border border-zinc-800/90 bg-zinc-950/80 px-4 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <span>เลื่อนลงเพื่อดูวิธีใช้งาน 4 ขั้นตอน</span>
                <ArrowDown className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
              </a>
            </div>
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
