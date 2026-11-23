"use client";

import { useAppLanguage } from "@/lib/language";

const PAIN_POINTS_TH: readonly string[] = [
  "ขายดีแต่เงินหายไม่รู้ตัว",
  "ลืมหักค่า GP แพลตฟอร์ม 12%–15%",
  "จัด Flash Sale แล้วเข้าเนื้อ",
  "ยิงแอดเพลินจนกำไรสุทธิติดลบ",
  "ไม่รู้ต้องขายกี่ชิ้นถึงจะคืนทุน",
  "ลืมบวกค่ากล่อง บับเบิล และค่าแพ็ก",
  "ตั้งราคาขายตามคู่แข่งจนขาดทุน",
  "ลดราคา 20% แต่ต้องขายเพิ่มเกือบเท่าตัว",
  "ยอดขายหลักแสนแต่ไม่เหลือกำไรจริง",
  "ค่าธรรมเนียม Shopee / TikTok สูงขึ้นทุกปี",
  "สต็อกจมเพราะคำนวณจุดคุ้มทุนพลาด",
  "Margin บางเฉียบโดยไม่รู้ตัว",
  "จำลองแคมเปญส่วนลดไม่ทันเกม",
  "ต้นทุนแฝงกินกำไรเงียบทุกออเดอร์",
  "ค่าส่งฟรีที่ร้านต้องควักเนื้อจ่ายเอง",
  "ยอดออเดอร์พุ่งแต่เงินหมุนไม่พอสั่งของ",
  "โดนหักค่าธรรมเนียมธุรกรรมจนงง",
  "อัดโปรแถมจนไม่เหลือส่วนต่างกำไร",
  "คำนวณราคาขายในหัวแล้วพลาดทุกที",
  "ค่าแอดแพงขึ้นแต่ไม่กล้าปรับราคาขาย",
  "ขายตัดราคาสู้ร้านใหญ่จนเจ็บตัว",
  "ไม่แยกต้นทุนคงที่ออกจากต้นทุนต่อชิ้น",
  "คิดแค่ราคาขายลบทุนของแล้วนึกว่ากำไร",
  "วางแผนราคาหลายแพลตฟอร์มไม่เคยตรงกัน",
];

const PAIN_POINTS_EN: readonly string[] = [
  "High sales volume but cash keeps disappearing",
  "Forgot to deduct 12%–15% marketplace GP fees",
  "Running Flash Sales at a silent loss",
  "Overspending on ads until net profit turns negative",
  "Unsure how many units are needed to break even",
  "Missing boxes, bubble wrap & packing costs",
  "Copying competitor prices into a loss",
  "20% discount requiring nearly double the orders",
  "Six-figure revenue with almost zero real profit",
  "Shopee & TikTok fees rising every year",
  "Dead stock from miscalculated break-even points",
  "Razor-thin margins without realizing it",
  "Caught off guard during campaign discount wars",
  "Hidden costs silently eating every single order",
  "Free shipping promos paid out of pocket",
  "Orders surging while cash flow runs dry",
  "Confused by layered transaction & payment fees",
  "Freebie bundles wiping out unit margins",
  "Mental math pricing mistakes every launch",
  "Rising ad costs with no safe pricing buffer",
  "Price wars against big stores hurting margins",
  "Mixing monthly fixed costs with unit costs",
  "Thinking selling price minus COGS equals profit",
  "Inconsistent pricing plans across channels",
];

const WAVE_OFFSETS_PX: readonly number[] = [
  0, 10, -10, 6, -11, 8, -5, 10, -8, 4, -10, 7,
];

export function PainPointMarquee() {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const painPoints = isEn ? PAIN_POINTS_EN : PAIN_POINTS_TH;

  return (
    <div
      aria-label={
        isEn
          ? "Common e-commerce seller pain points that KhumLab solves"
          : "ปัญหาที่ผู้ขายออนไลน์พบบ่อยซึ่ง KhumLab ช่วยแก้ไขได้"
      }
      className="relative w-full shrink-0 h-[86px] md:h-[98px] flex items-center overflow-hidden bg-black/65 backdrop-blur-sm border-y border-zinc-800/90 light:bg-white/90 light:border-slate-200"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-500/50 light:via-emerald-500/35 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-500/50 light:via-emerald-500/35 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 border-t border-dashed border-zinc-800/40 light:border-slate-300/70"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-32 bg-gradient-to-r from-black via-black/70 to-transparent light:from-[#f8fafc] light:via-[#f8fafc]/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-32 bg-gradient-to-l from-black via-black/70 to-transparent light:from-[#f8fafc] light:via-[#f8fafc]/80"
      />

      <div className="relative z-[5] flex w-max items-center animate-pain-marquee">
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1 ? "true" : undefined}
            className="flex shrink-0 items-center gap-6 md:gap-8 pr-6 md:pr-8"
          >
            {painPoints.map((text, itemIndex) => {
              const offsetY =
                WAVE_OFFSETS_PX[itemIndex % WAVE_OFFSETS_PX.length];

              return (
                <div
                  key={`${copyIndex}-${itemIndex}`}
                  style={{ transform: `translateY(${offsetY}px)` }}
                  className="group inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 text-xs md:text-sm text-zinc-200 whitespace-nowrap select-none transition-all duration-300 hover:border-emerald-400/80 hover:text-white hover:bg-emerald-950/40 hover:shadow-[0_0_18px_rgba(16,185,129,0.4)] light:bg-white light:border-slate-200 light:text-slate-700 light:shadow-xs light:hover:border-emerald-500 light:hover:bg-emerald-50 light:hover:text-emerald-900 light:hover:shadow-sm"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] transition-all duration-300 group-hover:bg-emerald-300 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(110,231,183,1)] light:bg-emerald-600 light:shadow-none light:group-hover:bg-emerald-700 light:group-hover:shadow-none"
                  />
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
