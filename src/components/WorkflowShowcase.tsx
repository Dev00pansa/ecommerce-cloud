"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, Calculator } from "lucide-react";

interface WorkflowShowcaseProps {
  isAuthenticated?: boolean;
}

interface WorkflowStepItem {
  step: string;
  align: "left" | "right";
  image: string;
  tag: string;
  title: string;
  desc: string;
  highlight: string;
}

const WORKFLOW_STEPS: WorkflowStepItem[] = [
  {
    step: "01",
    align: "left",
    image: "/images/workflow/step-1.jpg",
    tag: "Platform & Cost Structure",
    title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
    desc: "เริ่มต้นด้วยการเลือก Preset ค่าธรรมเนียมของแพลตฟอร์มที่คุณขายจริง (Shopee 13%, TikTok Shop 12%, Lazada 12% หรือขายตรง 0%) แล้วกรอกต้นทุนสินค้า ค่ากล่องกันกระแทก ค่าโฆษณาต่อชิ้น และราคาขายที่ตั้งไว้",
    highlight: "รองรับการปรับแก้ % ค่าธรรมเนียมและต้นทุนแฝงได้ทุกช่องแบบอิสระ",
  },
  {
    step: "02",
    align: "right",
    image: "/images/workflow/step-2.jpg",
    tag: "Net Margin & Break-Even Analysis",
    title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    desc: "ระบบคำนวณกำไรสุทธิต่อชิ้น อัตรากำไรสุทธิ (Net Margin %) และจุดคุ้มทุน (Break-Even Point) เป็นจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time พร้อมแจ้งเตือนทันทีหากราคาที่ตั้งไว้ทำให้ร้านขาดทุน",
    highlight: "แสดงกราฟสัดส่วนโครงสร้างราคาแยกสีชัดเจนระหว่างทุน ค่าธรรมเนียม และกำไร",
  },
  {
    step: "03",
    align: "left",
    image: "/images/workflow/step-3.jpg",
    tag: "Flash Sale & Promo Simulation",
    title: "จำลองส่วนลดโปรโมชัน",
    desc: "ทดลองเลื่อนแถบส่วนลดตั้งแต่ 0% ถึง 50% เพื่อดูผลกระทบก่อนเข้าร่วมแคมเปญลดราคา ระบบจะคำนวณให้ทันทีว่าหลังหักส่วนลดและค่า GP แล้วต้องขายให้ได้กี่ชิ้นจึงจะได้กำไรรวมเท่ากับการขายราคาปกติ",
    highlight: "ป้องกันการเผลอลดราคาแรงเกินจุดคุ้มทุนในช่วงจัดแคมเปญ",
  },
  {
    step: "04",
    align: "right",
    image: "/images/workflow/step-4.jpg",
    tag: "Cloud Storage & CSV Report",
    title: "บันทึก Cloud & Export CSV",
    desc: "บันทึกโครงสร้างราคาของสินค้าแต่ละรายการเก็บไว้บนระบบ Cloud ส่วนตัว สามารถกดดึงตัวเลขเดิมกลับมาปรับแก้ หรือส่งออกเป็นไฟล์ CSV เพื่อเปิดทำรายงานใน Excel ได้ทุกเมื่อ",
    highlight: "บันทึกข้อมูลส่วนตัวบน Cloud ปลอดภัย เข้าถึงได้จากทุกอุปกรณ์",
  },
];

/**
 * คำนวณค่า Smoothstep (0 ถึง 1) อย่างปลอดภัย ไม่เกิด NaN หรือค่าติดลบ
 */
function clampSmoothProgress(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  const clamped = Math.max(0, Math.min(1, raw));
  return clamped * clamped * (3 - 2 * clamped);
}

/**
 * ส่วนแสดงขั้นตอนการใช้งาน 4 ขั้นตอนแบบ Frameless Editorial Vertical Storytelling
 * - ใช้ Passive Scroll Listener + requestAnimationFrame คำนวณ Continuous Scroll Progress
 *   เพื่อให้ภาพพื้นหลังและข้อความค่อยๆ สว่างขึ้นและจางลงสู่สีดำอย่างต่อเนื่องไร้รอยต่อแข็งๆ
 */
export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const bgRefs = useRef<Array<HTMLDivElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const updateScrollScene = () => {
      rafId = null;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportCenter = viewportHeight / 2;
      const fadeDistance = Math.max(viewportHeight * 0.62, 1);

      for (let i = 0; i < WORKFLOW_STEPS.length; i += 1) {
        const stepEl = stepRefs.current[i];
        const bgEl = bgRefs.current[i];
        const contentEl = contentRefs.current[i];

        if (!stepEl) continue;

        const rect = stepEl.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const offsetFromCenter = stepCenter - viewportCenter;
        const distanceRatio = Math.abs(offsetFromCenter) / fadeDistance;

        const rawProgress = 1 - distanceRatio;
        const progress = clampSmoothProgress(rawProgress);

        if (bgEl) {
          const scale = 1.04 - 0.04 * progress;
          bgEl.style.opacity = progress.toFixed(3);
          bgEl.style.transform = `scale(${scale.toFixed(4)})`;
        }

        if (contentEl) {
          const textProgress = clampSmoothProgress(1 - Math.abs(offsetFromCenter) / (fadeDistance * 0.92));
          const direction = offsetFromCenter > 0 ? 1 : -1;
          const translateY = (1 - textProgress) * 26 * direction;
          contentEl.style.opacity = textProgress.toFixed(3);
          contentEl.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        }
      }
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScrollScene);
      }
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <section id="workflow" className="w-full scroll-mt-16 pt-16">
      {/* ส่วนเปิดหัวข้อก่อนเข้าสู่ Vertical Storytelling */}
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 pb-14">
        <div className="max-w-3xl space-y-3">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Step-by-Step Vertical Walkthrough
          </span>
          <h2 className="py-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.2]">
            เริ่มต้นใช้งานได้ใน 4 ขั้นตอน
          </h2>
          <p className="flex items-center gap-2 text-base sm:text-lg text-zinc-400">
            <span>เลื่อนหน้าจอลงเพื่อดูขั้นตอนการทำงานทีละขั้น</span>
            <ArrowDown className="h-4 w-4 text-emerald-400" />
          </p>
        </div>
      </div>

      {/* โครงสร้าง Sticky Full-Bleed Background + 4 Frameless Editorial Steps */}
      <div className="relative w-full bg-black">
        {/* ชั้นพื้นหลัง Sticky เต็มจอ สว่างขึ้นและจางมืดลงตาม Continuous Scroll Progress */}
        <div className="sticky top-0 h-screen w-full overflow-hidden z-0 bg-black">
          {WORKFLOW_STEPS.map((item, idx) => (
            <div
              key={item.step}
              ref={(el) => {
                bgRefs.current[idx] = el;
              }}
              style={{
                opacity: idx === 0 ? 1 : 0,
                transform: idx === 0 ? "scale(1)" : "scale(1.04)",
              }}
              className="pointer-events-none absolute inset-0 will-change-[opacity,transform]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}

          {/* ชั้นคลุมความมืดและ Gradient กลืนขอบบน-ล่างอย่างนุ่มนวล */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-black/55"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"
          />
        </div>

        {/* รายการ 4 ขั้นตอนแบบไร้กรอบ (Frameless Editorial) สลับซ้าย-ขวา */}
        <div className="relative z-10 -mt-[100vh]">
          {WORKFLOW_STEPS.map((item, idx) => {
            const isLeft = item.align === "left";

            return (
              <article
                key={item.step}
                ref={(el) => {
                  stepRefs.current[idx] = el;
                }}
                className="relative min-h-screen w-full flex items-center"
              >
                {/* แผ่นไล่เฉดสีดำทึบด้านหลังตัวหนังสือ: มือถือคลุมเต็มจอ, Desktop ไล่เฉดตามฝั่งซ้าย/ขวา */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-black/80 lg:bg-transparent ${
                    isLeft
                      ? "lg:bg-gradient-to-r lg:from-black lg:via-black/92 lg:to-transparent"
                      : "lg:bg-gradient-to-l lg:from-black lg:via-black/92 lg:to-transparent"
                  }`}
                />

                <div
                  className={`relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-24 flex justify-start ${
                    isLeft ? "lg:justify-start" : "lg:justify-end"
                  }`}
                >
                  <div
                    ref={(el) => {
                      contentRefs.current[idx] = el;
                    }}
                    style={{
                      opacity: idx === 0 ? 1 : 0,
                      transform: "translate3d(0, 0px, 0)",
                    }}
                    className="w-full max-w-xl text-left will-change-[opacity,transform]"
                  >
                    {/* 1. เลขขั้นตอนสไตล์ Editorial */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold tracking-[0.2em] text-emerald-400">
                        {item.step}
                      </span>
                      <span aria-hidden="true" className="text-zinc-600">
                        —
                      </span>
                      <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-zinc-400">
                        {item.tag}
                      </span>
                    </div>

                    {/* 2. หัวข้อหลัก */}
                    <h3 className="py-1 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.2] mt-4">
                      {item.title}
                    </h3>

                    {/* 3. เนื้อหาคำอธิบาย */}
                    <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mt-5 max-w-xl">
                      {item.desc}
                    </p>

                    {/* 4. จุดเน้นสำคัญด้านล่างด้วยเส้นขอบตั้งสีเขียว */}
                    <p className="border-l-2 border-emerald-500/80 pl-4 mt-6 text-sm sm:text-base text-zinc-400">
                      {item.highlight}
                    </p>

                    {/* 5. ปุ่ม CTA ปิดท้ายใน Step 04 */}
                    {idx === WORKFLOW_STEPS.length - 1 && (
                      <div className="mt-8 pt-2">
                        <Link
                          href={startHref}
                          className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400"
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
