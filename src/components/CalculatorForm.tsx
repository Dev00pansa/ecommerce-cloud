"use client";

import { useRef, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
  ArrowDown,
  ImagePlus,
  Loader2,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { PLATFORM_PRESETS } from "@/lib/calculator";
import { formatFileSizeKb } from "@/lib/image-compression";
import type {
  CalculatorFormStrings,
  CompressedProductImage,
  PlatformPreset,
} from "@/types";

interface CalculatorFormProps {
  values: CalculatorFormStrings;
  compressedImage: CompressedProductImage | null;
  existingImageUrl: string | null;
  compressingImage: boolean;
  imageError: string | null;
  onChangeField: (field: keyof CalculatorFormStrings, value: string) => void;
  onSelectPreset: (preset: PlatformPreset) => void;
  onSelectImageFile: (file: File) => void;
  onRemoveImage: () => void;
  onCalculate: () => void;
  onReset: () => void;
}

function sanitizeNumericInput(raw: string): string {
  if (raw === "") return "";
  return raw.replace(/[^0-9.]/g, "");
}

export function CalculatorForm({
  values,
  compressedImage,
  existingImageUrl,
  compressingImage,
  imageError,
  onChangeField,
  onSelectPreset,
  onSelectImageFile,
  onRemoveImage,
  onCalculate,
  onReset,
}: CalculatorFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCalculate();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onSelectImageFile(file);
    }
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onSelectImageFile(file);
    }
  }

  const activePreviewUrl = compressedImage?.previewUrl ?? existingImageUrl;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-12">
      <section className="border-t border-zinc-800/90 pt-8 space-y-5">
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            STEP 01
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            คุณขายสินค้านี้ที่ไหน?
          </h2>
          <p className="text-sm text-zinc-400">
            กดเลือกช่องทางขายเพื่อให้ระบบตั้งค่าธรรมเนียม (GP) อัตโนมัติ หรือปรับแก้ตัวเลขเปอร์เซ็นต์เองได้ตามจริง
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLATFORM_PRESETS.map((preset) => {
            const active =
              values.platform === preset.id &&
              Number(values.platformFeePercent || "0") === preset.feePercent;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`flex items-center justify-between border px-4 py-4 text-left transition-colors ${
                  active
                    ? "border-emerald-400 bg-emerald-950/30 text-white"
                    : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <div>
                  <span className="block text-base font-semibold">
                    {preset.label}
                  </span>
                  <span className="block text-xs text-zinc-500 mt-0.5">
                    {preset.badge}
                  </span>
                </div>
                <span
                  className={`font-mono text-sm font-semibold px-2.5 py-1 border ${
                    active
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-zinc-800 bg-black text-zinc-400"
                  }`}
                >
                  GP {preset.feePercent}%
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-900 pt-4">
          <div>
            <label
              htmlFor="calc-platform-fee"
              className="block text-sm font-medium text-zinc-200"
            >
              ปรับแก้ค่าธรรมเนียมแพลตฟอร์ม (%)
            </label>
            <p className="text-xs text-zinc-500">
              หากร้านของคุณโดนหักค่าธรรมเนียมต่างจากค่ามาตรฐาน สามารถพิมพ์แก้ตัวเลขช่องนี้ได้เลย
            </p>
          </div>
          <div className="w-full sm:w-44">
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
              className="w-full border border-zinc-800 bg-black px-3.5 py-2.5 text-base font-mono tabular-nums text-zinc-100 focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/90 pt-8 space-y-5">
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            STEP 02
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            สินค้าที่คุณจะขายคืออะไร?
          </h2>
          <p className="text-sm text-zinc-400">
            ตั้งชื่อสินค้าและแนบรูปสินค้า 1 รูป (ไม่บังคับ) เพื่อใช้ดูคู่กับรายงานและประวัติที่บันทึกไว้
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="calc-product-name"
            className="block text-sm font-medium text-zinc-200"
          >
            ชื่อสินค้า หรือ รุ่นสินค้า
          </label>
          <input
            id="calc-product-name"
            type="text"
            value={values.productName}
            onChange={(e) => onChangeField("productName", e.target.value)}
            placeholder="เช่น เสื้อยืดคอกลมสีดำ รุ่นพรีเมียม"
            maxLength={120}
            className="w-full border border-zinc-800 bg-black px-4 py-3 text-base text-zinc-100 placeholder-zinc-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-200">
              รูปภาพสินค้า (จำกัด 1 รูป — ระบบย่อและบีบอัดขนาดอัตโนมัติ)
            </span>
            {compressedImage && (
              <span className="font-mono text-xs text-emerald-400">
                บีบอัดแล้ว {formatFileSizeKb(compressedImage.sizeBytes)}
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {activePreviewUrl ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden border border-zinc-800 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activePreviewUrl}
                    alt="ตัวอย่างรูปสินค้า"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-100">
                    แนบรูปภาพสินค้าเรียบร้อยแล้ว
                  </p>
                  <p className="text-xs text-zinc-400">
                    {compressedImage
                      ? `ไฟล์ภาพพร้อมบันทึก (${formatFileSizeKb(compressedImage.sizeBytes)})`
                      : "รูปภาพที่โหลดมาจากข้อมูลบน Cloud"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={compressingImage}
                  className="border border-zinc-700 bg-black px-3.5 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-emerald-400 hover:text-emerald-400 disabled:opacity-50"
                >
                  เปลี่ยนรูป
                </button>
                <button
                  type="button"
                  onClick={onRemoveImage}
                  disabled={compressingImage}
                  className="inline-flex items-center gap-1 border border-zinc-800 bg-black px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>ลบรูป</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => {
                if (!compressingImage) {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center justify-between gap-4 border border-dashed border-zinc-800 bg-zinc-950/40 px-5 py-5 cursor-pointer transition-colors hover:border-emerald-500/60"
            >
              <div className="flex items-center gap-3.5">
                {compressingImage ? (
                  <Loader2 className="h-5 w-5 text-emerald-400 animate-spin shrink-0" />
                ) : (
                  <ImagePlus className="h-5 w-5 text-zinc-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {compressingImage
                      ? "กำลังย่อและบีบอัดรูปภาพอัตโนมัติ..."
                      : "กดที่นี่เพื่อเลือกรูปสินค้า 1 รูป (หรือลากไฟล์มาวาง)"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    รองรับไฟล์ .jpg, .png, .webp (ย่อขนาดอัตโนมัติไม่เกิน 120 KB เพื่อประหยัดพื้นที่ Cloud)
                  </p>
                </div>
              </div>
              <span className="shrink-0 border border-zinc-800 bg-black px-3 py-1.5 text-xs font-medium text-zinc-300">
                เลือกรูป
              </span>
            </div>
          )}

          {imageError && (
            <p className="text-xs font-medium text-rose-400">{imageError}</p>
          )}
        </div>
      </section>

      <section className="border-t border-zinc-800/90 pt-8 space-y-6">
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            STEP 03
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            กรอกต้นทุนและราคาขาย
          </h2>
          <p className="text-sm text-zinc-400">
            กรอกตัวเลขตามความจริง ช่องไหนไม่มีค่าใช้จ่ายให้ใส่เลข 0 ได้เลย
          </p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-900 pb-5">
            <div className="sm:col-span-7">
              <label
                htmlFor="calc-cost-price"
                className="block text-base font-semibold text-zinc-100"
              >
                1. ต้นทุนสินค้าต่อชิ้น (บาท)
              </label>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                ราคาทุนที่คุณรับสินค้ามา หรือต้นทุนผลิตต่อ 1 ชิ้น
              </p>
            </div>
            <div className="sm:col-span-5">
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
                className="w-full border border-zinc-800 bg-black px-4 py-3 text-lg font-mono tabular-nums text-zinc-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-900 pb-5">
            <div className="sm:col-span-7">
              <label
                htmlFor="calc-packaging-cost"
                className="block text-base font-semibold text-zinc-100"
              >
                2. ค่ากล่องและค่าแพ็กต่อชิ้น (บาท)
              </label>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                รวมค่ากล่องพัสดุ บับเบิลกันกระแทก เทปกาว และใบปะหน้าต่อ 1 ชิ้น
              </p>
            </div>
            <div className="sm:col-span-5">
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
                className="w-full border border-zinc-800 bg-black px-4 py-3 text-lg font-mono tabular-nums text-zinc-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-900 pb-5">
            <div className="sm:col-span-7">
              <label
                htmlFor="calc-ads-cost"
                className="block text-base font-semibold text-zinc-100"
              >
                3. ค่าโฆษณาเฉลี่ยต่อชิ้น (บาท)
              </label>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                ค่าแอดเฉลี่ยเพื่อให้ขายสินค้าได้ 1 ชิ้น (ถ้าไม่ได้ยิงแอดให้ใส่ 0)
              </p>
            </div>
            <div className="sm:col-span-5">
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
                className="w-full border border-zinc-800 bg-black px-4 py-3 text-lg font-mono tabular-nums text-zinc-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-900 pb-5">
            <div className="sm:col-span-7">
              <label
                htmlFor="calc-selling-price"
                className="block text-base font-bold text-emerald-400"
              >
                4. ราคาที่จะตั้งขายต่อชิ้น (บาท)
              </label>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                ราคาขายหน้าร้านที่คุณตั้งใจจะขายให้ลูกค้า
              </p>
            </div>
            <div className="sm:col-span-5">
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
                className="w-full border-2 border-emerald-500/80 bg-black px-4 py-3 text-lg font-mono font-bold tabular-nums text-emerald-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 pb-2">
            <div className="sm:col-span-7">
              <label
                htmlFor="calc-fixed-cost"
                className="block text-base font-semibold text-zinc-100"
              >
                5. ต้นทุนคงที่ต่อเดือน (บาท) — ถ้ามี
              </label>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                เช่น ค่าเช่าที่ ค่าไฟ ค่าจ้างพนักงาน เพื่อคำนวณว่าต้องขายกี่ชิ้นจึงจะคุ้มทุน (ถ้าไม่มีใส่ 0)
              </p>
            </div>
            <div className="sm:col-span-5">
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
                className="w-full border border-zinc-800 bg-black px-4 py-3 text-lg font-mono tabular-nums text-zinc-100 focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2.5 bg-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            <span>ประมวลผลและสรุปกำไร</span>
            <ArrowDown className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 border border-zinc-800 bg-black px-4 py-3.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>ล้างค่า</span>
          </button>
        </div>
      </section>
    </form>
  );
}
