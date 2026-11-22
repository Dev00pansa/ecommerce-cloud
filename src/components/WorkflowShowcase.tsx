"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Calculator } from "lucide-react";

interface WorkflowShowcaseProps {
  isAuthenticated?: boolean;
}

interface WorkflowStepItem {
  step: string;
  textSide: "left" | "right";
  image: string;
  tag: string;
  title: string;
  desc: string;
  highlight: string;
}

/**
 * ลำดับการวางฝั่งของทั้ง 4 ขั้นตอน (สลับฝั่งรับกับหัวข้อเปิดเรื่องที่ชิดซ้าย):
 * - Step 01: ข้อความอยู่ฝั่งขวา / ภาพอยู่ฝั่งซ้าย
 * - Step 02: ข้อความอยู่ฝั่งซ้าย / ภาพอยู่ฝั่งขวา
 * - Step 03: ข้อความอยู่ฝั่งขวา / ภาพอยู่ฝั่งซ้าย
 * - Step 04: ข้อความอยู่ฝั่งซ้าย / ภาพอยู่ฝั่งขวา
 */
const WORKFLOW_STEPS: WorkflowStepItem[] = [
  {
    step: "01",
    textSide: "right",
    image: "/images/workflow/step-1.jpg",
    tag: "Platform & Cost Structure",
    title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
    desc: "เริ่มต้นด้วยการเลือก Preset ค่าธรรมเนียมของแพลตฟอร์มที่คุณขายจริง (Shopee 13%, TikTok Shop 12%, Lazada 12% หรือขายตรง 0%) แล้วกรอกต้นทุนสินค้า ค่ากล่องกันกระแทก ค่าโฆษณาต่อชิ้น และราคาขายที่ตั้งไว้",
    highlight: "รองรับการปรับแก้ % ค่าธรรมเนียมและต้นทุนแฝงได้ทุกช่องแบบอิสระ",
  },
  {
    step: "02",
    textSide: "left",
    image: "/images/workflow/step-2.jpg",
    tag: "Net Margin & Break-Even Analysis",
    title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    desc: "ระบบคำนวณกำไรสุทธิต่อชิ้น อัตรากำไรสุทธิ (Net Margin %) และจุดคุ้มทุน (Break-Even Point) เป็นจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time พร้อมแจ้งเตือนทันทีหากราคาที่ตั้งไว้ทำให้ร้านขาดทุน",
    highlight: "แสดงกราฟสัดส่วนโครงสร้างราคาแยกสีชัดเจนระหว่างทุน ค่าธรรมเนียม และกำไร",
  },
  {
    step: "03",
    textSide: "right",
    image: "/images/workflow/step-3.jpg",
    tag: "Flash Sale & Promo Simulation",
    title: "จำลองส่วนลดโปรโมชัน",
    desc: "ทดลองเลื่อนแถบส่วนลดตั้งแต่ 0% ถึง 50% เพื่อดูผลกระทบก่อนเข้าร่วมแคมเปญลดราคา ระบบจะคำนวณให้ทันทีว่าหลังหักส่วนลดและค่า GP แล้วต้องขายให้ได้กี่ชิ้นจึงจะได้กำไรรวมเท่ากับการขายราคาปกติ",
    highlight: "ป้องกันการเผลอลดราคาแรงเกินจุดคุ้มทุนในช่วงจัดแคมเปญ",
  },
  {
    step: "04",
    textSide: "left",
    image: "/images/workflow/step-4.jpg",
    tag: "Cloud Storage & CSV Report",
    title: "บันทึก Cloud & Export CSV",
    desc: "บันทึกโครงสร้างราคาของสินค้าแต่ละรายการเก็บไว้บนระบบ Cloud ส่วนตัว สามารถกดดึงตัวเลขเดิมกลับมาปรับแก้ หรือส่งออกเป็นไฟล์ CSV เพื่อเปิดทำรายงานใน Excel ได้ทุกเมื่อ",
    highlight: "บันทึกข้อมูลส่วนตัวบน Cloud ปลอดภัย เข้าถึงได้จากทุกอุปกรณ์",
  },
];

/**
 * คำนวณค่า Smoothstep (0 ถึง 1) อย่างปลอดภัย ป้องกัน NaN และค่าติดลบ
 */
function clampSmoothProgress(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  const clamped = Math.max(0, Math.min(1, raw));
  return clamped * clamped * (3 - 2 * clamped);
}

/**
 * CSS Mask แนวตั้งสำหรับละลายขอบบน-ล่างของกรอบภาพให้จางเป็นโปร่งใส 100%
 */
const VERTICAL_FEATHER_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
};

/**
 * CSS Mask รัศมีวงรีสำหรับละลายขอบซ้าย-ขวาและมุมทั้ง 4 ด้านให้กลืนลงพื้นหลังลายจุด Dot-Grid
 */
function getRadialFeatherMask(imageOnLeft: boolean): CSSProperties {
  const gradient = imageOnLeft
    ? "radial-gradient(ellipse 82% 78% at 44% 50%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.22) 74%, transparent 95%)"
    : "radial-gradient(ellipse 82% 78% at 56% 50%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.22) 74%, transparent 95%)";

  return {
    maskImage: gradient,
    WebkitMaskImage: gradient,
  };
}

/**
 * ส่วนแสดงขั้นตอนการใช้งาน 4 ขั้นตอนแบบ Frameless Editorial:
 * - ใช้พื้นหลังโปร่งใส (bg-transparent) เพื่อคงพื้นหลังสีดำลายจุด Dot-Grid ของเว็บให้ต่อเนื่องเป็นผืนเดียว
 * - แยกแต่ละ Step เป็น Section อิสระ (overflow-hidden) ป้องกันภาพทะลุข้ามขั้น 100%
 * - ใช้ CSS mask-image ละลายขอบภาพทั้ง 4 ด้านให้กลืนเข้ากับพื้นหลังลายจุดโดยไม่ใช้แผ่นดำทึบแปะทับ
 */
export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const imageWrapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;

    const updateSectionsProgress = () => {
      rafId = null;
      const viewportHeight = Math.max(window.innerHeight, 1);
      const viewportCenter = viewportHeight / 2;
      const activeRange = Math.max(viewportHeight * 0.72, 1);

      for (let i = 0; i < WORKFLOW_STEPS.length; i += 1) {
        const stepEl = stepRefs.current[i];
        const imageEl = imageWrapRefs.current[i];
        const contentEl = contentRefs.current[i];

        if (!stepEl) continue;

        const rect = stepEl.getBoundingClientRect();
        const stepCenter = rect.top + rect.height / 2;
        const offsetFromCenter = stepCenter - viewportCenter;
        const distanceRatio = Math.abs(offsetFromCenter) / activeRange;

        const progress = clampSmoothProgress(1 - distanceRatio);

        if (imageEl) {
          // จำกัดความสว่างภาพไว้ที่ระดับ ~0.55 เพื่อไม่ให้แย่งสายตาตัวหนังสือ
          const targetOpacity = 0.08 + progress * 0.47;
          const scale = 1.04 - progress * 0.04;
          imageEl.style.opacity = targetOpacity.toFixed(3);
          imageEl.style.transform = `scale(${scale.toFixed(4)})`;
        }

        if (contentEl) {
          const textProgress = clampSmoothProgress(
            1 - Math.abs(offsetFromCenter) / (activeRange * 0.95)
          );
          const direction = offsetFromCenter > 0 ? 1 : -1;
          const translateY = (1 - textProgress) * 24 * direction;
          const textOpacity = 0.12 + textProgress * 0.88;
          contentEl.style.opacity = textOpacity.toFixed(3);
          contentEl.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
        }
      }
    };

    const scheduleUpdate = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateSectionsProgress);
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
    <section
      id="workflow"
      className="relative w-full bg-transparent scroll-mt-16 pt-12 pb-16"
    >
      {/* หัวข้อเปิดเรื่อง ชิดฝั่งซ้ายเหมือนเดิม */}
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 pb-10">
        <div className="max-w-3xl space-y-3 text-left">
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

      {/* รายการ 4 ขั้นตอน: แยกแต่ละขั้นตอนเป็น Section อิสระ (overflow-hidden) บนพื้นหลังโปร่งใสเห็นลายจุด Dot-Grid */}
      <div className="w-full bg-transparent">
        {WORKFLOW_STEPS.map((item, idx) => {
          const isTextRight = item.textSide === "right";
          const isImageLeft = isTextRight;

          return (
            <article
              key={item.step}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              className="relative min-h-[85vh] w-full flex items-center overflow-hidden py-20 bg-transparent"
            >
              {/* ภาพประกอบประจำขั้นตอน: อยู่เฉพาะใน Section ของตัวเองฝั่งตรงข้ามกับข้อความ และละลายขอบทั้ง 4 ด้านด้วย CSS Mask */}
              <div
                aria-hidden="true"
                style={VERTICAL_FEATHER_MASK}
                className={`pointer-events-none absolute inset-y-4 z-0 w-full lg:w-[62%] ${
                  isImageLeft ? "left-0" : "right-0"
                }`}
              >
                <div
                  ref={(el) => {
                    imageWrapRefs.current[idx] = el;
                  }}
                  style={{
                    ...getRadialFeatherMask(isImageLeft),
                    opacity: 0.55,
                    transform: "scale(1)",
                  }}
                  className="h-full w-full will-change-[opacity,transform]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover object-center saturate-[0.95] contrast-[1.05]"
                  />
                </div>
              </div>

              {/* เนื้อหาตัวหนังสือแบบไร้กรอบ (Frameless Editorial Typography) */}
              <div
                className={`relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16 flex ${
                  isTextRight ? "lg:justify-end" : "lg:justify-start"
                }`}
              >
                <div
                  ref={(el) => {
                    contentRefs.current[idx] = el;
                  }}
                  style={{
                    opacity: 1,
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
    </section>
  );
}
