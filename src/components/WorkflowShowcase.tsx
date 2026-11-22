"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Calculator,
  CheckCircle2,
  CloudUpload,
  Sliders,
  Store,
  Target,
} from "lucide-react";

interface WorkflowShowcaseProps {
  isAuthenticated?: boolean;
}

const WORKFLOW_STEPS = [
  {
    step: "01",
    align: "left" as const,
    icon: Store,
    image: "/images/workflow/step-1.jpg",
    tag: "Platform & Cost Structure",
    title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
    desc: "เริ่มต้นด้วยการเลือก Preset ค่าธรรมเนียมของแพลตฟอร์มที่คุณขายจริง (Shopee 13%, TikTok Shop 12%, Lazada 12% หรือขายตรง 0%) แล้วกรอกต้นทุนสินค้า ค่ากล่องกันกระแทก ค่าโฆษณาต่อชิ้น และราคาขายที่ตั้งไว้",
    highlight: "รองรับการปรับแก้ % ค่าธรรมเนียมและต้นทุนแฝงได้ทุกช่องแบบอิสระ",
  },
  {
    step: "02",
    align: "right" as const,
    icon: Target,
    image: "/images/workflow/step-2.jpg",
    tag: "Net Margin & Break-Even Analysis",
    title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    desc: "ระบบคำนวณกำไรสุทธิต่อชิ้น อัตรากำไรสุทธิ (Net Margin %) และจุดคุ้มทุน (Break-Even Point) เป็นจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time พร้อมแจ้งเตือนทันทีหากราคาที่ตั้งไว้ทำให้ร้านขาดทุน",
    highlight: "แสดงกราฟสัดส่วนโครงสร้างราคาแยกสีชัดเจนระหว่างทุน ค่าธรรมเนียม และกำไร",
  },
  {
    step: "03",
    align: "left" as const,
    icon: Sliders,
    image: "/images/workflow/step-3.jpg",
    tag: "Flash Sale & Promo Simulation",
    title: "จำลองส่วนลดโปรโมชัน",
    desc: "ทดลองเลื่อนแถบส่วนลดตั้งแต่ 0% ถึง 50% เพื่อดูผลกระทบก่อนเข้าร่วมแคมเปญลดราคา ระบบจะคำนวณให้ทันทีว่าหลังหักส่วนลดและค่า GP แล้วต้องขายให้ได้กี่ชิ้นจึงจะได้กำไรรวมเท่ากับการขายราคาปกติ",
    highlight: "ป้องกันการเผลอลดราคาแรงเกินจุดคุ้มทุนในช่วงจัดแคมเปญ",
  },
  {
    step: "04",
    align: "right" as const,
    icon: CloudUpload,
    image: "/images/workflow/step-4.jpg",
    tag: "Cloud Storage & CSV Report",
    title: "บันทึก Cloud & Export CSV",
    desc: "บันทึกโครงสร้างราคาของสินค้าแต่ละรายการเก็บไว้บนระบบ Cloud ส่วนตัว สามารถกดดึงตัวเลขเดิมกลับมาปรับแก้ หรือส่งออกเป็นไฟล์ CSV เพื่อเปิดทำรายงานใน Excel ได้ทุกเมื่อ",
    highlight: "บันทึกข้อมูลส่วนตัวบน Cloud ปลอดภัย เข้าถึงได้จากทุกอุปกรณ์",
  },
];

/**
 * ส่วนแสดงขั้นตอนการใช้งาน 4 ขั้นตอนแบบ Vertical Scroll Storytelling
 * - Fade-to-Black: เมื่อเปลี่ยนขั้นตอน ภาพเดิมจะจางผ่านม่านสีดำสนิท (#000000) ก่อนเปิดภาพใหม่
 * - Staggered Reveal: ข้อความในแต่ละขั้นตอนค่อยๆ โผล่ขึ้นมาทีละส่วน (0ms, 100ms, 200ms, 300ms)
 */
export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isFadingBlack, setIsFadingBlack] = useState<boolean>(false);
  const [revealedSteps, setRevealedSteps] = useState<Record<number, boolean>>({
    0: true,
  });

  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const activeStepRef = useRef<number>(0);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const elements = stepRefs.current.filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute("data-step-index");
            const parsed = Number(indexAttr);
            if (
              Number.isInteger(parsed) &&
              parsed >= 0 &&
              parsed < WORKFLOW_STEPS.length
            ) {
              setRevealedSteps((prev) =>
                prev[parsed] ? prev : { ...prev, [parsed]: true }
              );

              if (parsed !== activeStepRef.current) {
                activeStepRef.current = parsed;
                // จังหวะ Fade-to-Black: ดึงม่านสีดำสนิทขึ้นมาคั่นกลางสั้นๆ ก่อนเปิดภาพขั้นตอนถัดไป
                setIsFadingBlack(true);
                if (fadeTimeoutRef.current !== null) {
                  window.clearTimeout(fadeTimeoutRef.current);
                }
                fadeTimeoutRef.current = window.setTimeout(() => {
                  setActiveStep(parsed);
                  setIsFadingBlack(false);
                }, 180);
              }
            }
          }
        });
      },
      {
        rootMargin: "-38% 0px -38% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <section className="w-full">
      {/* ส่วนเปิดหัวข้อก่อนเข้าสู่ Vertical Storytelling */}
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 pb-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Step-by-Step Vertical Walkthrough
          </span>
          <h2 className="py-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.2]">
            เริ่มต้นใช้งานได้ใน 4 ขั้นตอน
          </h2>
          <p className="flex items-center gap-2 text-base sm:text-lg text-zinc-400">
            <span>เลื่อนหน้าจอลงเพื่อดูขั้นตอนการทำงานทีละขั้น</span>
            <ArrowDown className="h-4 w-4 text-emerald-400 animate-bounce" />
          </p>
        </div>
      </div>

      {/* โครงสร้าง Sticky Full-Bleed Background + 4 Vertical Full-Screen Steps */}
      <div className="relative w-full bg-black">
        {/* ชั้นพื้นหลัง Sticky เต็มจอ สลับภาพผ่านม่านสีดำสนิท (Fade-to-Black) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden z-0 bg-black">
          {WORKFLOW_STEPS.map((item, idx) => {
            const isActive = activeStep === idx && !isFadingBlack;
            return (
              <div
                key={item.step}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isActive
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105 pointer-events-none"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            );
          })}

          {/* ม่าน Fade-to-Black คั่นจังหวะเปลี่ยนภาพระหว่างขั้นตอน */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-300 ${
              isFadingBlack ? "opacity-95" : "opacity-60"
            }`}
          />

          {/* Gradient Mask สีดำสนิทตรงขอบบนและขอบล่างเพื่อกลืนรอยต่อให้เนียน 100% */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/70 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent"
          />

          {/* ตัวบอกลำดับขั้นตอนมุมขวาล่างของ Sticky Viewport */}
          <div className="absolute bottom-8 right-8 hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/85 px-4 py-2 text-xs font-mono text-zinc-300 backdrop-blur-md">
            <span className="text-emerald-400 font-bold">
              0{activeStep + 1}
            </span>
            <span className="text-zinc-600">/</span>
            <span>0{WORKFLOW_STEPS.length}</span>
          </div>
        </div>

        {/* รายการ 4 ขั้นตอน เรียงแนวตั้งทีละขั้น (1 ขั้นตอนต่อ 1 จอ สลับซ้าย-ขวา) */}
        <div className="relative z-10 -mt-[100vh]">
          {WORKFLOW_STEPS.map((item, idx) => {
            const Icon = item.icon;
            const isLeft = item.align === "left";
            const isRevealed = Boolean(revealedSteps[idx]);

            return (
              <article
                key={item.step}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                data-step-index={idx}
                className="relative min-h-screen w-full flex items-center"
              >
                {/* แถบเชื่อมสีดำสนิทตรงรอยต่อบน-ล่างของแต่ละขั้นตอน */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent"
                />

                {/* แผ่น Gradient สีดำสนิทไล่จากฝั่งที่มีกล่องเนื้อหาไปโปร่งใสอีกฝั่ง */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 ${
                    isLeft
                      ? "bg-gradient-to-r from-black/95 via-black/65 to-transparent"
                      : "bg-gradient-to-l from-black/95 via-black/65 to-transparent"
                  }`}
                />

                <div
                  className={`relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-24 flex ${
                    isLeft ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`w-full max-w-2xl rounded-xl border bg-black/95 p-7 sm:p-10 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isRevealed
                        ? "border-emerald-500/45 opacity-100 translate-y-0"
                        : "border-zinc-800 opacity-0 translate-y-8"
                    }`}
                  >
                    {/* จังหวะที่ 1 (delay 0ms): ป้ายเลขขั้น STEP 01 - 04 */}
                    <div
                      style={{ transitionDelay: "0ms" }}
                      className={`flex items-center justify-between gap-4 mb-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isRevealed
                          ? "opacity-100 translate-y-0 blur-0"
                          : "opacity-0 translate-y-4 blur-xs"
                      }`}
                    >
                      <div className="inline-flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          {item.tag}
                        </span>
                      </div>

                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                        STEP {item.step} / 04
                      </span>
                    </div>

                    {/* จังหวะที่ 2 (delay 100ms): หัวข้อหลัก */}
                    <h3
                      style={{ transitionDelay: "100ms" }}
                      className={`py-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100 leading-[1.25] mb-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isRevealed
                          ? "opacity-100 translate-y-0 blur-0"
                          : "opacity-0 translate-y-4 blur-xs"
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* จังหวะที่ 3 (delay 200ms): เนื้อหาคำอธิบาย */}
                    <p
                      style={{ transitionDelay: "200ms" }}
                      className={`text-base sm:text-lg leading-relaxed text-zinc-300 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isRevealed
                          ? "opacity-100 translate-y-0 blur-0"
                          : "opacity-0 translate-y-4 blur-xs"
                      }`}
                    >
                      {item.desc}
                    </p>

                    {/* จังหวะที่ 4 (delay 300ms): รายละเอียดเสริมและปุ่มดำเนินการ */}
                    <div
                      style={{ transitionDelay: "300ms" }}
                      className={`mt-6 pt-5 border-t border-zinc-800/90 space-y-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isRevealed
                          ? "opacity-100 translate-y-0 blur-0"
                          : "opacity-0 translate-y-4 blur-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-medium">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{item.highlight}</span>
                      </div>

                      {idx === WORKFLOW_STEPS.length - 1 && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                          <span className="text-sm text-zinc-400">
                            พร้อมเริ่มคำนวณกำไรและจุดคุ้มทุนของร้านคุณแล้วหรือยัง?
                          </span>
                          <Link
                            href={startHref}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400"
                          >
                            <Calculator className="h-4 w-4" />
                            <span>
                              {isAuthenticated
                                ? "เปิดเครื่องมือคำนวณทันที"
                                : "เข้าสู่ระบบเพื่อเริ่มใช้งานจริง"}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
