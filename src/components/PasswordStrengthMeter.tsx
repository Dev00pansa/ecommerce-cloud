"use client";

import { evaluatePasswordStrength } from "@/lib/auth";
import { useAppLanguage } from "@/lib/language";
import { useTheme } from "@/components/ThemeProvider";
import type { AppLanguage } from "@/types";

interface PasswordStrengthMeterProps {
  password: string;
  language?: AppLanguage;
}

export function PasswordStrengthMeter({
  password,
  language,
}: PasswordStrengthMeterProps) {
  const { isDark } = useTheme();
  const [appLanguage] = useAppLanguage();
  const activeLanguage = language ?? appLanguage;
  const isEn = activeLanguage === "en";

  if (!password) {
    return null;
  }

  const result = evaluatePasswordStrength(password, activeLanguage);
  const trackBg = isDark ? "bg-zinc-800" : "bg-slate-200";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
          {isEn ? "Password Strength:" : "ความปลอดภัยรหัสผ่าน:"}
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
