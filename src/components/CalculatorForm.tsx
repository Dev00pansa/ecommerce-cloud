"use client";

import {
  CloudUpload,
  Download,
  Loader2,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { PLATFORM_PRESETS } from "@/lib/calculator";
import type { CalculatorFormStrings, PlatformPreset } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface CalculatorFormProps {
  values: CalculatorFormStrings;
  onChangeField: (field: keyof CalculatorFormStrings, value: string) => void;
  onSelectPreset: (preset: PlatformPreset) => void;
  onReset: () => void;
  onSaveToCloud: () => void;
  onExportCsv: () => void;
  saving: boolean;
}

/**
 * ปรับข้อความตัวเลขจาก input ให้ไม่ติดลบและอนุญาตให้ลบจนช่องว่างได้ขณะพิมพ์
 */
function sanitizeNumericInput(raw: string): string {
  if (raw === "") return "";
  const cleaned = raw.replace(/-/g, "");
  return cleaned;
}

/**
 * ฟอร์มกรอกข้อมูลต้นทุนและราคาขาย E-Commerce (Sidebar ด้านซ้าย)
 */
export function CalculatorForm({
  values,
  onChangeField,
  onSelectPreset,
  onReset,
  onSaveToCloud,
  onExportCsv,
  saving,
}: CalculatorFormProps) {
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white";
  const inputClass = isDark
    ? "border-zinc-800 bg-[#000000] text-zinc-100 placeholder-zinc-600 focus:border-emerald-500"
    : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-600";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  return (
    <section
      className={`rounded-xl border p-5 space-y-5 transition-colors ${cardClass}`}
    >
      <div className="flex items-center justify-between gap-2 border-b pb-3 border-dashed border-zinc-800/40">
        <div>
          <h2 className="text-base font-bold tracking-tight">
            ข้อมูลต้นทุนและราคาขาย
          </h2>
          <p className={`text-xs ${mutedText}`}>
            เลือกแพลตฟอร์มหรือปรับแก้ตัวเลขได้ทันที
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isDark
              ? "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>รีเซ็ต</span>
        </button>
      </div>

      {/* ปุ่ม Preset แพลตฟอร์ม */}
      <div>
        <span className="block text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-2">
          Preset แพลตฟอร์ม
        </span>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_PRESETS.map((preset) => {
            const active =
              values.platform === preset.id &&
              Number(values.platformFeePercent || "0") === preset.feePercent;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition-colors ${
                  active
                    ? isDark
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                      : "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : isDark
                      ? "border-zinc-800 bg-[#0A0A0A] text-zinc-300 hover:border-zinc-700"
                      : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="text-xs font-semibold">{preset.label}</span>
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0 opacity-75" />
                </div>
                <span className={`text-[11px] mt-0.5 ${subtleText}`}>
                  {preset.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ช่องกรอกข้อมูลสินค้าและต้นทุน */}
      <div className="space-y-3.5">
        <div>
          <label
            htmlFor="calc-product-name"
            className="block text-xs font-medium mb-1"
          >
            ชื่อสินค้า / รุ่นสินค้า
          </label>
          <input
            id="calc-product-name"
            type="text"
            value={values.productName}
            onChange={(e) => onChangeField("productName", e.target.value)}
            placeholder="เช่น เสื้อยืด Oversize คอตตอน"
            maxLength={120}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="calc-cost-price"
              className="block text-xs font-medium mb-1"
            >
              ต้นทุนสินค้า/ชิ้น (บาท)
            </label>
            <input
              id="calc-cost-price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.costPrice}
              onChange={(e) =>
                onChangeField("costPrice", sanitizeNumericInput(e.target.value))
              }
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
            />
          </div>

          <div>
            <label
              htmlFor="calc-packaging-cost"
              className="block text-xs font-medium mb-1"
            >
              ค่าแพ็กของ/กล่อง (บาท)
            </label>
            <input
              id="calc-packaging-cost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.packagingCost}
              onChange={(e) =>
                onChangeField(
                  "packagingCost",
                  sanitizeNumericInput(e.target.value)
                )
              }
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
            />
          </div>

          <div>
            <label
              htmlFor="calc-ads-cost"
              className="block text-xs font-medium mb-1"
            >
              ค่าโฆษณา/ชิ้น (บาท)
            </label>
            <input
              id="calc-ads-cost"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.adsCost}
              onChange={(e) =>
                onChangeField("adsCost", sanitizeNumericInput(e.target.value))
              }
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
            />
          </div>

          <div>
            <label
              htmlFor="calc-platform-fee"
              className="block text-xs font-medium mb-1"
            >
              ค่าธรรมเนียมแพลตฟอร์ม (%)
            </label>
            <input
              id="calc-platform-fee"
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              value={values.platformFeePercent}
              onChange={(e) =>
                onChangeField(
                  "platformFeePercent",
                  sanitizeNumericInput(e.target.value)
                )
              }
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
            />
          </div>

          <div>
            <label
              htmlFor="calc-selling-price"
              className="block text-xs font-semibold text-emerald-500 mb-1"
            >
              ราคาขายที่ตั้งไว้ (บาท)
            </label>
            <input
              id="calc-selling-price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={values.sellingPrice}
              onChange={(e) =>
                onChangeField(
                  "sellingPrice",
                  sanitizeNumericInput(e.target.value)
                )
              }
              placeholder="0"
              className={`w-full rounded-lg border-2 border-emerald-500/70 px-3 py-2 text-sm font-mono font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                isDark
                  ? "bg-[#000000] text-emerald-400"
                  : "bg-emerald-50/40 text-emerald-900"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="calc-fixed-cost"
              className="block text-xs font-medium mb-1"
            >
              ต้นทุนคงที่รวม (บาท)
            </label>
            <input
              id="calc-fixed-cost"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={values.fixedCost}
              onChange={(e) =>
                onChangeField("fixedCost", sanitizeNumericInput(e.target.value))
              }
              placeholder="0"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputClass}`}
            />
          </div>
        </div>
      </div>

      {/* ปุ่มดำเนินการ Cloud และ Export */}
      <div className="pt-1 flex flex-col gap-2">
        <button
          type="button"
          onClick={onSaveToCloud}
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CloudUpload className="h-4 w-4" />
          )}
          <span>
            {saving ? "กำลังบันทึก..." : "บันทึกการคำนวณลง Cloud"}
          </span>
        </button>

        <button
          type="button"
          onClick={onExportCsv}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
            isDark
              ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Download className="h-3.5 w-3.5" />
          <span>ส่งออกไฟล์ CSV</span>
        </button>
      </div>
    </section>
  );
}
