"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowDown, ArrowRight, Calculator } from "lucide-react";
import { useAppLanguage } from "@/lib/language";
import { KhumLabLogo } from "@/components/KhumLabLogo";
import { PainPointMarquee } from "@/components/PainPointMarquee";
import { WorkflowShowcase } from "@/components/WorkflowShowcase";
import { Footer } from "@/components/Footer";

interface LandingViewProps {
  isAuthenticated: boolean;
}

export function LandingView({ isAuthenticated }: LandingViewProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[620px] overflow-hidden z-0"
      >
        <div className="animate-beam-a absolute -top-28 left-[2%] h-[460px] w-[38vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="animate-beam-b absolute -top-24 left-[26%] h-[520px] w-[36vw] min-w-[300px] rounded-full bg-gradient-to-b from-emerald-400/25 via-emerald-500/12 to-transparent blur-3xl" />
        <div className="animate-beam-c absolute -top-32 left-[52%] h-[480px] w-[34vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-300/20 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="animate-beam-a absolute -top-24 right-[2%] h-[450px] w-[35vw] min-w-[260px] rounded-full bg-gradient-to-b from-emerald-500/25 via-emerald-400/10 to-transparent blur-3xl" />
      </div>

      <main className="relative z-10 w-full flex-1">
        <section className="min-h-[calc(100vh-4rem)] w-full flex flex-col justify-between overflow-x-clip">
          <div className="max-w-[1440px] mx-auto w-full flex-1 flex items-center px-8 lg:px-16 py-10">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-12">
              <div className="animate-enter lg:col-span-7 text-left space-y-6">
                <h1 className="py-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 leading-[1.15]">
                  {isEn ? (
                    <>
                      Price for Real Profit, End{" "}
                      <span className="text-emerald-400">
                        &ldquo;High Sales, Zero Profit&rdquo;
                      </span>
                    </>
                  ) : (
                    <>
                      คิดราคาขายให้มีกำไรจริง หยุดปัญหา{" "}
                      <span className="text-emerald-400">“ขายดีแต่ขาดทุน”</span>
                    </>
                  )}
                </h1>

                <p className="text-lg md:text-xl leading-relaxed text-zinc-400">
                  {isEn ? (
                    <>
                      Many online sellers set prices using{" "}
                      <span className="text-zinc-100 font-medium">
                        selling price minus product cost alone
                      </span>
                      , forgetting marketplace GP fees (12%–13%), ad spend per
                      order, boxes & bubble wrap, and flash sale discounts.
                      KhumLab reveals your true net profit, break-even volume,
                      and promo impact in seconds before you launch.
                    </>
                  ) : (
                    <>
                      ผู้ขายออนไลน์จำนวนมากตั้งราคาจาก{" "}
                      <span className="text-zinc-100 font-medium">
                        ราคาขายลบต้นทุนสินค้าเพียงอย่างเดียว
                      </span>{" "}
                      แต่ลืมหักค่า GP แพลตฟอร์ม (12%–13%), ค่าโฆษณาต่อชิ้น,
                      ค่ากล่องและบับเบิลกันกระแทก รวมถึงส่วนลดช่วงจัดแคมเปญ
                      KhumLab ช่วยให้คุณเห็นกำไรสุทธิ จุดคุ้มทุน
                      และผลกระทบจากโปรโมชันก่อนเปิดขายจริงในไม่กี่วินาที
                    </>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href="#workflow"
                    onClick={handleScrollToWorkflow}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/90 px-5 py-3.5 text-sm sm:text-base font-medium text-zinc-200 transition-all hover:border-emerald-500/50 hover:text-emerald-400"
                  >
                    <span>
                      {isEn
                        ? "See How It Works (4 Steps)"
                        : "ดูวิธีใช้งาน (4 ขั้นตอน)"}
                    </span>
                    <ArrowDown className="h-4 w-4 text-emerald-400" />
                  </a>

                  <Link
                    href={startHref}
                    className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
                  >
                    <Calculator className="h-5 w-5" />
                    <span>
                      {isAuthenticated
                        ? isEn
                          ? "Open Calculator (Dashboard)"
                          : "เข้าสู่เครื่องมือคำนวณ (Dashboard)"
                        : isEn
                          ? "Sign In / Get Started"
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

          <div className="w-full shrink-0 flex flex-col">
            <PainPointMarquee />
            <div
              aria-hidden="true"
              className="w-full h-9 md:h-12 bg-black shrink-0"
            />
          </div>
        </section>

        <WorkflowShowcase isAuthenticated={isAuthenticated} />
      </main>

      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}
