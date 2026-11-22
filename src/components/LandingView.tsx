"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowDown, ArrowRight, Calculator } from "lucide-react";
import { KhumLabLogo } from "@/components/KhumLabLogo";
import { PainPointMarquee } from "@/components/PainPointMarquee";
import { WorkflowShowcase } from "@/components/WorkflowShowcase";
import { Footer } from "@/components/Footer";

interface LandingViewProps {
  isAuthenticated: boolean;
}

/**
 * หน้าแรก (/) แบรนด์ KhumLab:
 * - คงพื้นหลังลายจุด Dot-Grid และลำแสงสีเขียวเคลื่อนไหวด้านบนไว้ 100%
 * - จัดโครงสร้าง Hero Section เป็น min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between overflow-x-clip
 * - เนื้อหา Hero ด้านบนอยู่ใน flex-1 flex items-center (ภายใน max-w-[1440px])
 * - วาง PainPointMarquee ไว้นอก max-w-[1440px] ด้านล่างสุดแบบ Full-Bleed 100% โดยไม่ทับปุ่มหรือโลโก้ KL
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

      {/* Main Wrapper */}
      <main className="relative z-10 w-full flex-1">
        {/* ส่วนที่ 1: Hero Section + Full-Bleed Staggered Wave Marquee ด้านล่างสุด */}
        <section className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between overflow-x-clip">
          {/* เนื้อหา Hero ด้านบน (หัวข้อ + ปุ่ม + โลโก้ KL) กึ่งกลางพื้นที่แนวตั้ง */}
          <div className="max-w-[1440px] mx-auto w-full flex-1 flex items-center px-8 lg:px-16 py-10">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
              <div className="animate-enter lg:col-span-7 text-left space-y-6">
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

                {/* ปุ่มคู่ใต้คำอธิบาย: ซ้าย "ดูวิธีใช้งาน (4 ขั้นตอน)" / ขวา "เข้าสู่ระบบ / เริ่มใช้งาน" */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href="#workflow"
                    onClick={handleScrollToWorkflow}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/90 px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-200 transition-all hover:border-emerald-500/50 hover:text-emerald-400"
                  >
                    <span>ดูวิธีใช้งาน (4 ขั้นตอน)</span>
                    <ArrowDown className="h-4 w-4 text-emerald-400" />
                  </a>

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
                </div>
              </div>

              <div className="animate-enter-delay-1 lg:col-span-5 flex items-center justify-center">
                <KhumLabLogo variant="hero" />
              </div>
            </div>
          </div>

          {/* แถบรางเส้นตัดยาวสุดขอบจอ + พื้นที่สีดำสนิทด้านล่าง 36px-48px เชื่อมลงสู่โซน 4 ขั้นตอน */}
          <div className="w-full shrink-0 flex flex-col">
            <PainPointMarquee />
            <div
              aria-hidden="true"
              className="w-full h-9 md:h-12 bg-black shrink-0"
            />
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
