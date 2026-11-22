"use client";

import { evaluatePasswordStrength } from "@/lib/auth";
import { useTheme } from "@/components/ThemeProvider";

interface PasswordStrengthMeterProps {
  password: string;
}

/**
 * ตัววัดระดับความปลอดภัยรหัสผ่านแบบเรียลไทม์ (3 ระดับ: แดง / เหลือง / เขียว)
 */
export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const { isDark } = useTheme();

  if (!password) {
    return null;
  }

  const result = evaluatePasswordStrength(password);
  const trackBg = isDark ? "bg-zinc-800" : "bg-slate-200";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
          ความปลอดภัยรหัสผ่าน:
        </span>
        <span
          className="font-semibold"
          style={{ color: result.colorHex }}
        >
          {result.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((segment) => {
          const isActive = segment <= result.score;
          return (
            <div
              key={segment}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                isActive ? "" : trackBg
              }`}
              style={isActive ? { backgroundColor: result.colorHex } : undefined}
            />
          );
        })}
      </div>

      <p
        className={`text-[11px] leading-snug ${
          isDark ? "text-zinc-400" : "text-slate-600"
        }`}
      >
        {result.hint}
      </p>
    </div>
  );
}
