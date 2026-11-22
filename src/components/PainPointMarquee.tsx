"use client";

/**
 * รายการปัญหาจริงของผู้ขาย E-Commerce ครบทั้ง 24 ประโยคที่ KhumLab ช่วยแก้ได้
 */
const PAIN_POINTS: readonly string[] = [
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

/**
 * แพทเทิร์นความสูงเยื้องแนวตั้ง (Staggered Wave Elevation, หน่วย px ช่วง -11px ถึง +10px)
 * สมดุลกับรางความสูงเพรียว h-[86px] md:h-[98px] ไม่ชนขอบบน-ล่าง
 */
const WAVE_OFFSETS_PX: readonly number[] = [
  0, 10, -10, 6, -11, 8, -5, 10, -8, 4, -10, 7,
];

/**
 * แถบรางเส้นตัดแบบยาวสุดขอบจอ (Full-Bleed Staggered Wave Marquee)
 * - ความสูงเพรียวกระชับ h-[86px] md:h-[98px]
 * - เลื่อนไปทางขวาอย่างต่อเนื่องไร้รอยต่อ (90s linear infinite) โดยไม่หยุดเมื่อชี้เมาส์
 * - เมื่อชี้เมาส์ที่ป้ายข้อความ ป้ายจะเรืองแสงสีเขียวมรกตอย่างนุ่มนวล
 */
export function PainPointMarquee() {
  return (
    <div
      aria-label="ปัญหาที่ผู้ขายออนไลน์พบบ่อยซึ่ง KhumLab ช่วยแก้ไขได้"
      className="relative w-full shrink-0 h-[86px] md:h-[98px] flex items-center overflow-hidden bg-black/65 backdrop-blur-sm border-y border-zinc-800/90"
    >
      {/* เส้นแสงสีเขียวมรกตบางเฉียบซ้อนทับที่ขอบบนสุดและขอบล่างสุด */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
      />

      {/* เส้นประแนวนอนจางๆ พาดกลางราง */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-0 border-t border-dashed border-zinc-800/40"
      />

      {/* Gradient Fade ขอบซ้ายสุดและขวาสุดของหน้าจอ */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 md:w-32 bg-gradient-to-r from-black via-black/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 md:w-32 bg-gradient-to-l from-black via-black/70 to-transparent"
      />

      {/* รางข้อความเลื่อนไปทางขวาไร้รอยต่อ (Duplicate 2 ชุดต่อกันใน flex w-max) */}
      <div className="relative z-[5] flex w-max items-center animate-pain-marquee">
        {[0, 1].map((copyIndex) => (
          <div
            key={copyIndex}
            aria-hidden={copyIndex === 1 ? "true" : undefined}
            className="flex shrink-0 items-center gap-6 md:gap-8 pr-6 md:pr-8"
          >
            {PAIN_POINTS.map((text, itemIndex) => {
              const offsetY =
                WAVE_OFFSETS_PX[itemIndex % WAVE_OFFSETS_PX.length];

              return (
                <div
                  key={`${copyIndex}-${itemIndex}`}
                  style={{ transform: `translateY(${offsetY}px)` }}
                  className="group inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 text-xs md:text-sm text-zinc-200 whitespace-nowrap select-none transition-all duration-300 hover:border-emerald-400/80 hover:text-white hover:bg-emerald-950/40 hover:shadow-[0_0_18px_rgba(16,185,129,0.4)]"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] transition-all duration-300 group-hover:bg-emerald-300 group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(110,231,183,1)]"
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
