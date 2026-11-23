"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, Calculator } from "lucide-react";
import { useAppLanguage } from "@/lib/language";

interface WorkflowShowcaseProps {
  isAuthenticated?: boolean;
}

interface WorkflowStepItem {
  step: string;
  textSide: "left" | "right";
  image: string;
  tag: string;
  titleTh: string;
  titleEn: string;
  descTh: string;
  descEn: string;
  highlightTh: string;
  highlightEn: string;
}

const WORKFLOW_STEPS: WorkflowStepItem[] = [
  {
    step: "01",
    textSide: "right",
    image: "/screenshots/step-01-calculator.png",
    tag: "Platform & Cost Structure",
    titleTh: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
    titleEn: "Select Platform & Enter Costs",
    descTh:
      "เริ่มต้นด้วยการเลือก Preset ค่าธรรมเนียมของแพลตฟอร์มที่คุณขายจริง (Shopee 13%, TikTok Shop 12%, Lazada 12% หรือขายตรง 0%) แล้วกรอกต้นทุนสินค้า ค่ากล่องกันกระแทก ค่าโฆษณาต่อชิ้น และราคาขายที่ตั้งไว้",
    descEn:
      "Start by choosing your sales channel preset (Shopee 13%, TikTok Shop 12%, Lazada 12%, or Direct 0%), then input product cost, packaging materials, ad spend per unit, and your planned selling price.",
    highlightTh: "รองรับการปรับแก้ % ค่าธรรมเนียมและต้นทุนแฝงได้ทุกช่องแบบอิสระ",
    highlightEn:
      "Fully customize platform fee percentages and hidden per-unit costs anytime.",
  },
  {
    step: "02",
    textSide: "left",
    image: "/screenshots/step-02-analytics.png",
    tag: "Net Margin & Break-Even Analysis",
    titleTh: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    titleEn: "Inspect Net Margin & Break-Even",
    descTh:
      "ระบบคำนวณกำไรสุทธิต่อชิ้น อัตรากำไรสุทธิ (Net Margin %) และจุดคุ้มทุน (Break-Even Point) เป็นจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time พร้อมแจ้งเตือนทันทีหากราคาที่ตั้งไว้ทำให้ร้านขาดทุน",
    descEn:
      "Instantly calculate net profit per unit, net margin %, and minimum monthly break-even volume to cover fixed costs — with immediate diagnostic alerts if your selling price loses money.",
    highlightTh:
      "แสดงกราฟสัดส่วนโครงสร้างราคาแยกสีชัดเจนระหว่างทุน ค่าธรรมเนียม และกำไร",
    highlightEn:
      "Color-coded visual charts clearly separate cost, fees, ad spend, and real profit.",
  },
  {
    step: "03",
    textSide: "right",
    image: "/screenshots/step-03-promo.png",
    tag: "Flash Sale & Promo Simulation",
    titleTh: "จำลองส่วนลดโปรโมชัน",
    titleEn: "Simulate Flash Sale Discounts",
    descTh:
      "ทดลองเลื่อนแถบส่วนลดตั้งแต่ 0% ถึง 50% เพื่อดูผลกระทบก่อนเข้าร่วมแคมเปญลดราคา ระบบจะคำนวณให้ทันทีว่าหลังหักส่วนลดและค่า GP แล้วต้องขายให้ได้กี่ชิ้นจึงจะได้กำไรรวมเท่ากับการขายราคาปกติ",
    descEn:
      "Slide discounts from 0% to 50% to preview campaign impact before joining a Flash Sale. See immediately how many extra units you must sell to earn the same total profit as regular pricing.",
    highlightTh: "ป้องกันการเผลอลดราคาแรงเกินจุดคุ้มทุนในช่วงจัดแคมเปญ",
    highlightEn:
      "Protect your store from accidentally discounting past your break-even margin.",
  },
  {
    step: "04",
    textSide: "left",
    image: "/screenshots/step-04-cloud.png",
    tag: "Cloud Storage & CSV Report",
    titleTh: "บันทึก Cloud & Export CSV",
    titleEn: "Save to Cloud & Export CSV",
    descTh:
      "บันทึกโครงสร้างราคาของสินค้าแต่ละรายการเก็บไว้บนระบบ Cloud ส่วนตัว สามารถกดดึงตัวเลขเดิมกลับมาปรับแก้ หรือส่งออกเป็นไฟล์ CSV เพื่อเปิดทำรายงานใน Excel ได้ทุกเมื่อ",
    descEn:
      "Store every product pricing plan securely in your private Cloud workspace. Reopen any record to update figures or export custom-column CSV reports ready for Excel and Google Sheets.",
    highlightTh: "บันทึกข้อมูลส่วนตัวบน Cloud ปลอดภัย เข้าถึงได้จากทุกอุปกรณ์",
    highlightEn:
      "Private cloud persistence synced in real time across all your devices.",
  },
];

const VERTICAL_FEATHER_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.92) 80%, transparent 100%)",
};

function getRadialFeatherMask(imageOnLeft: boolean): CSSProperties {
  const gradient = imageOnLeft
    ? "radial-gradient(ellipse 82% 78% at 44% 50%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.22) 74%, transparent 95%)"
    : "radial-gradient(ellipse 82% 78% at 56% 50%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.22) 74%, transparent 95%)";

  return {
    maskImage: gradient,
    WebkitMaskImage: gradient,
  };
}

export function WorkflowShowcase({
  isAuthenticated = false,
}: WorkflowShowcaseProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";

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
      className="relative w-full overflow-x-clip bg-[#000000] light:bg-[#f8fafc] scroll-mt-16 pt-20 pb-20 border-b border-zinc-900/80 light:border-slate-200"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-950/10 light:from-emerald-500/[0.05] to-transparent"
      />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16 pb-10">
        <div className="max-w-3xl space-y-3 text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 light:text-emerald-700">
            Step-by-Step Vertical Walkthrough
          </span>
          <h2 className="py-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-100 light:text-slate-900 leading-[1.2]">
            {isEn ? "Get Started in 4 Simple Steps" : "เริ่มต้นใช้งานได้ใน 4 ขั้นตอน"}
          </h2>
          <p className="flex items-center gap-2 text-base sm:text-lg text-zinc-400 light:text-slate-600">
            <span>
              {isEn
                ? "Scroll down to explore each step of the workflow"
                : "เลื่อนหน้าจอลงเพื่อดูขั้นตอนการทำงานทีละขั้น"}
            </span>
            <ArrowDown className="h-4 w-4 text-emerald-400 light:text-emerald-600" />
          </p>
        </div>
      </div>

      <div className="w-full bg-[#000000] light:bg-[#f8fafc]">
        {WORKFLOW_STEPS.map((item, idx) => {
          const isTextRight = item.textSide === "right";
          const isImageLeft = isTextRight;
          const isVisible = visibleSteps[idx];
          const title = isEn ? item.titleEn : item.titleTh;
          const desc = isEn ? item.descEn : item.descTh;
          const highlight = isEn ? item.highlightEn : item.highlightTh;

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
              className="relative min-h-[85vh] w-full flex items-center overflow-hidden py-20 bg-[#000000] light:bg-[#f8fafc]"
            >
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
                      ? "opacity-55 light:opacity-45 scale-100"
                      : "opacity-10 scale-[1.03]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-cover object-top saturate-[0.95] contrast-[1.05]"
                  />
                </div>
              </div>

              <div
                className={`relative z-10 w-full max-w-[1440px] mx-auto px-8 lg:px-16 flex ${
                  isTextRight ? "lg:justify-end" : "lg:justify-start"
                }`}
              >
                <div
                  className={`w-full max-w-xl text-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[opacity,transform] light:rounded-2xl light:bg-white/90 light:backdrop-blur-md light:border light:border-slate-200/90 light:p-7 sm:light:p-9 light:shadow-[0_12px_36px_rgba(15,23,42,0.08)] ${
                    isVisible
                      ? "translate-x-0 opacity-100"
                      : hiddenSlideClass
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold tracking-[0.2em] text-emerald-400 light:text-emerald-700">
                      {item.step}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-zinc-600 light:text-slate-300"
                    >
                      —
                    </span>
                    <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-zinc-400 light:text-slate-500">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="py-1 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white light:text-slate-900 leading-[1.2] mt-4">
                    {title}
                  </h3>

                  <p className="text-base sm:text-lg text-zinc-300 light:text-slate-700 leading-relaxed mt-5 max-w-xl">
                    {desc}
                  </p>

                  <p className="border-l-2 border-emerald-500/80 light:border-emerald-600 pl-4 mt-6 text-sm sm:text-base text-zinc-400 light:text-slate-600">
                    {highlight}
                  </p>

                  {idx === WORKFLOW_STEPS.length - 1 && (
                    <div className="mt-8 pt-2">
                      <Link
                        href={startHref}
                        className="inline-flex items-center gap-2.5 rounded-lg bg-emerald-500 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:bg-emerald-400 light:bg-emerald-600 light:text-white light:hover:bg-emerald-700 light:shadow-sm"
                      >
                        <Calculator className="h-4 w-4" />
                        <span>
                          {isAuthenticated
                            ? isEn
                              ? "Launch Calculator Now"
                              : "เปิดเครื่องมือคำนวณทันที"
                            : isEn
                              ? "Sign In to Start Calculating"
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
