"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
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
 * CSS Mask แนวตั้งสำหรับละลายขอบบน-ล่างของกรอบภาพให้จางเป็นโปร่งใส 100%
 */
const VERTICAL_FEATHER_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
};

/**
 * CSS Mask รัศมีวงรีสำหรับละลายขอบซ้าย-ขวาและมุมทั้ง 4 ด้านให้กลืนลงพื้นหลังสีดำสนิท
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
 * - ใช้พื้นหลังสีดำสนิทแยกโซนชัดเจนจากหน้า Hero (bg-[#000000])
 * - คงระบบวางภาพแยกตาม Section อิสระและ CSS mask-image เบลอขอบทั้ง 4 ด้าน 100%
 * - เพิ่มแอนิเมชัน Directional Slide-In เลื่อนเข้าจากด้านข้างตามฝั่งของข้อความด้วย IntersectionObserver
 */
export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleSteps((prev) => {
          let changed = false;
          const next = [...prev];

          for (const entry of entries) {
            const indexAttr = entry.target.getAttribute("data-step-index");
            if (indexAttr === null) continue;
            const idx = Number.parseInt(indexAttr, 10);
            if (!Number.isFinite(idx) || idx < 0 || idx >= next.length) {
              continue;
            }

            if (entry.isIntersecting !== next[idx]) {
              next[idx] = entry.isIntersecting;
              changed = true;
            }
          }

          return changed ? next : prev;
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    for (let i = 0; i < WORKFLOW_STEPS.length; i += 1) {
      const el = stepRefs.current[i];
      if (el) {
        observer.observe(el);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const startHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <section
      id="workflow"
      className="relative w-full overflow-x-clip bg-[#000000] scroll-mt-16 pt-20 pb-20 border-b border-zinc-900/80"
    >
      {/* เงาไล่ระดับด้านบนสุดเชื่อมรอยต่อจากแถบ Marquee ของหน้า Hero สู่พื้นหลังสีดำสนิท */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-950/10 to-transparent"
      />

      {/* หัวข้อเปิดเรื่อง ชิดฝั่งซ้าย */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16 pb-10">
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

      {/* รายการ 4 ขั้นตอน: แยกแต่ละขั้นตอนเป็น Section อิสระ (overflow-hidden) บนพื้นหลังสีดำสนิท */}
      <div className="w-full bg-[#000000]">
        {WORKFLOW_STEPS.map((item, idx) => {
          const isTextRight = item.textSide === "right";
          const isImageLeft = isTextRight;
          const isVisible = visibleSteps[idx];

          // ทิศทางเลื่อนเข้าตามฝั่งของข้อความ: ขวาเลื่อนจากขวา (translate-x-12), ซ้ายเลื่อนจากซ้าย (-translate-x-12)
          const hiddenSlideClass = isTextRight
            ? "translate-x-12 opacity-0"
            : "-translate-x-12 opacity-0";

          return (
            <article
              key={item.step}
              data-step-index={idx}
              ref={(el) => {
                stepRefs.current[idx] = el;
              }}
              className="relative min-h-[85vh] w-full flex items-center overflow-hidden py-20 bg-[#000000]"
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
                  style={getRadialFeatherMask(isImageLeft)}
                  className={`h-full w-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
                    isVisible
                      ? "opacity-55 scale-100"
                      : "opacity-10 scale-[1.03]"
                  }`}
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

              {/* เนื้อหาตัวหนังสือแบบไร้กรอบ (Frameless Editorial Typography) + Directional Slide-In */}
              <div
                className={`relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16 flex ${
                  isTextRight ? "lg:justify-end" : "lg:justify-start"
                }`}
              >
                <div
                  className={`w-full max-w-xl text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : hiddenSlideClass
                  }`}
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
