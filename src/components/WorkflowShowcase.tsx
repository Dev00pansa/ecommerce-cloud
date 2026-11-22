"use client";

import { CloudUpload, Sliders, Store, Target } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const WORKFLOW_STEPS = [
  {
    step: "01",
    icon: Store,
    title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
    desc: "กด Preset แพลตฟอร์มที่ขาย แล้วกรอกต้นทุนสินค้า ค่าแพ็ก ค่าแอด และราคาขายต่อชิ้น",
  },
  {
    step: "02",
    icon: Target,
    title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
    desc: "ระบบคำนวณ Net Margin % และจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time",
  },
  {
    step: "03",
    icon: Sliders,
    title: "จำลองส่วนลดโปรโมชัน",
    desc: "เลื่อนแถบส่วนลด 0%–50% เพื่อวางแผนราคา Flash Sale โดยไม่เผลอตั้งราคาจนขาดทุน",
  },
  {
    step: "04",
    icon: CloudUpload,
    title: "บันทึก Cloud & Export CSV",
    desc: "บันทึกโครงสร้างราคาสินค้าเก็บไว้บน Cloud โหลดกลับมาแก้ไขหรือส่งออกทำรายงานได้ทันที",
  },
];

/**
 * ส่วนแสดงขั้นตอนการใช้งาน 4 ขั้นตอนในหน้าแรก
 */
export function WorkflowShowcase() {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white/95";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  return (
    <section className="animate-enter-delay-2 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
            Workflow Overview
          </span>
          <h2 className="mt-1 py-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.2]">
            เริ่มต้นใช้งานได้ใน 4 ขั้นตอน
          </h2>
        </div>
        <span className={`text-sm ${subtleText}`}>
          สมัครสมาชิกด้วย Username เพื่อเข้าใช้งานหน้า Dashboard ส่วนตัว
        </span>
      </div>

      <div className="animate-enter-delay-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        {WORKFLOW_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.step}
              className={`rounded-xl border p-6 sm:p-7 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 ${cardClass}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500">
                  STEP {step.step}
                </span>
              </div>
              <h3 className="py-0.5 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.25] mb-2">
                {step.title}
              </h3>
              <p className={`text-base sm:text-lg leading-relaxed ${mutedText}`}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
