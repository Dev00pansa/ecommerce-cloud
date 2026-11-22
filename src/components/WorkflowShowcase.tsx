"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Calculator,
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
  },
  {
    step: "02",
    align: "right" as const,
    icon: Target,
    image: "/images/workflow/step-2.jpg",
    tag: "Net Margin & Break-Even Analysis",
    title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    desc: "ระบบคำนวณกำไรสุทธิต่อชิ้น อัตรากำไรสุทธิ (Net Margin %) และจุดคุ้มทุน (Break-Even Point) เป็นจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time พร้อมแจ้งเตือนทันทีหากราคาที่ตั้งไว้ทำให้ร้านขาดทุน",
  },
  {
    step: "03",
    align: "left" as const,
    icon: Sliders,
    image: "/images/workflow/step-3.jpg",
    tag: "Flash Sale & Promo Simulation",
    title: "จำลองส่วนลดโปรโมชัน",
    desc: "ทดลองเลื่อนแถบส่วนลดตั้งแต่ 0% ถึง 50% เพื่อดูผลกระทบก่อนเข้าร่วมแคมเปญลดราคา ระบบจะคำนวณให้ทันทีว่าหลังหักส่วนลดและค่า GP แล้วต้องขายให้ได้กี่ชิ้นจึงจะได้กำไรรวมเท่ากับการขายราคาปกติ",
  },
  {
    step: "04",
    align: "right" as const,
    icon: CloudUpload,
    image: "/images/workflow/step-4.jpg",
    tag: "Supabase Cloud & CSV Report",
    title: "บันทึก Cloud & Export CSV",
    desc: "บันทึกโครงสร้างราคาของสินค้าแต่ละรายการเก็บไว้บนฐานข้อมูล Supabase Cloud ส่วนตัว (ป้องกันด้วย Row Level Security) สามารถกดดึงตัวเลขเดิมกลับมาปรับแก้ หรือส่งออกเป็นไฟล์ CSV เพื่อเปิดใน Excel ได้ทุกเมื่อ",
  },
];

/**
 * ส่วนแสดงขั้นตอนการใช้งาน 4 ขั้นตอนแบบ Vertical Scroll Storytelling
 * - พื้นหลัง Sticky Full-Bleed เปลี่ยนภาพอัตโนมัติแบบ Crossfade เมื่อเลื่อนถึงแต่ละขั้นตอน
 * - เนื้อหาแต่ละขั้นตอนมีความสูงเต็มจอ (min-h-screen) เรียงแนวตั้งทีละขั้น สลับซ้าย-ขวา
 */
export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

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
            if (Number.isInteger(parsed) && parsed >= 0 && parsed < WORKFLOW_STEPS.length) {
              setActiveStep(parsed);
            }
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
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
      <div className="relative w-full">
        {/* ชั้นพื้นหลัง Sticky เต็มจอ เปลี่ยนภาพ Crossfade ตาม activeStep */}
        <div className="sticky top-0 h-screen w-full overflow-hidden z-0">
          {WORKFLOW_STEPS.map((item, idx) => {
            const isActive = activeStep === idx;
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

          {/* ชั้นสีดำทึบโปร่งแสงคลุมทับภาพพื้นหลังเพื่อความคมชัดของตัวอักษร */}
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

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
            const isCurrent = activeStep === idx;

            return (
              <article
                key={item.step}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                data-step-index={idx}
                className="relative min-h-screen w-full flex items-center"
              >
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
                  className={`relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-20 flex ${
                    isLeft ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`w-full max-w-2xl rounded-xl border border-zinc-800 bg-black/95 p-7 sm:p-10 shadow-2xl transition-all duration-700 ${
                      isCurrent
                        ? "opacity-100 translate-y-0 border-emerald-500/50"
                        : "opacity-75 translate-y-4"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="inline-flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                          {item.tag}
                        </span>
                      </div>

                      <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-sm sm:text-base font-bold text-emerald-400 tabular-nums">
                        {item.step} / 04
                      </span>
                    </div>

                    <h3 className="py-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-100 leading-[1.25] mb-4">
                      {item.title}
                    </h3>

                    <p className="text-base sm:text-lg leading-relaxed text-zinc-300">
                      {item.desc}
                    </p>

                    {idx === WORKFLOW_STEPS.length - 1 && (
                      <div className="mt-8 pt-6 border-t border-zinc-800/90 flex flex-wrap items-center justify-between gap-4">
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
