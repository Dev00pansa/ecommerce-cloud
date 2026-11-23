"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  RotateCcw,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { MAX_MONETARY_VALUE, PLATFORM_PRESETS } from "@/lib/calculator";
import { formatFileSizeKb } from "@/lib/image-compression";
import { useAppLanguage } from "@/lib/language";
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
  editingProductName?: string | null;
  isDuplicateProductName?: boolean;
  onCancelEdit?: () => void;
  onChangeField: (field: keyof CalculatorFormStrings, value: string) => void;
  onSelectPreset: (preset: PlatformPreset) => void;
  onSelectImageFile: (file: File) => void;
  onRemoveImage: () => void;
  onCalculate: () => void;
  onReset: () => void;
}

type MonetaryField =
  | "costPrice"
  | "packagingCost"
  | "adsCost"
  | "sellingPrice"
  | "fixedCost";

function sanitizeBoundedDecimal(
  raw: string,
  maxValue: number
): { value: string; clamped: boolean } {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { value: "", clamped: false };
  }

  const cleaned = trimmed.replace(/[^0-9.]/g, "");
  if (cleaned === "") {
    return { value: "0", clamped: false };
  }

  const dotIndex = cleaned.indexOf(".");
  let normalized = cleaned;
  if (dotIndex !== -1) {
    const intPart = cleaned.slice(0, dotIndex) || "0";
    const decPart = cleaned.slice(dotIndex + 1).replace(/\./g, "").slice(0, 2);
    normalized = `${intPart}.${decPart}`;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { value: "0", clamped: false };
  }

  if (parsed > maxValue) {
    return { value: String(maxValue), clamped: true };
  }

  return { value: normalized, clamped: false };
}

const INPUT_SURFACE_CLASS =
  "w-full rounded-xl bg-black/80 border border-emerald-500/25 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 focus:border-emerald-400 focus:shadow-[0_0_25px_-4px_rgba(16,185,129,0.3)] focus:outline-none light:bg-white light:border-slate-300 light:text-slate-900 light:placeholder-slate-400 light:shadow-xs light:hover:border-emerald-500 light:focus:border-emerald-600 light:focus:ring-2 light:focus:ring-emerald-600/20 light:focus:shadow-none";

const BOX_SURFACE_CLASS =
  "rounded-2xl bg-black/75 border border-emerald-500/20 shadow-[0_0_20px_-6px_rgba(16,185,129,0.14)] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_0_25px_-4px_rgba(16,185,129,0.28)] light:bg-slate-50/75 light:border-slate-200 light:shadow-none light:hover:border-emerald-500 light:hover:bg-emerald-50/40 light:hover:shadow-xs";

const GLASS_CARD_CLASS =
  "rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-slate-200 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]";

const CARD_HEADER_BAND_CLASS =
  "bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-6 py-4 flex items-center gap-3.5 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80";

const GLOWING_ICON_BADGE_CLASS =
  "w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none";

export function CalculatorForm({
  values,
  compressedImage,
  existingImageUrl,
  compressingImage,
  imageError,
  editingProductName = null,
  isDuplicateProductName = false,
  onCancelEdit,
  onChangeField,
  onSelectPreset,
  onSelectImageFile,
  onRemoveImage,
  onCalculate,
  onReset,
}: CalculatorFormProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const [attemptedEmptyName, setAttemptedEmptyName] = useState(false);
  const [clampedFields, setClampedFields] = useState<
    Partial<Record<MonetaryField, boolean>>
  >({});

  const isEmptyNameError =
    attemptedEmptyName && values.productName.trim().length === 0;
  const productNameErrorMessage = isEmptyNameError
    ? isEn
      ? "Please enter a product name before calculating."
      : "กรุณาระบุชื่อสินค้าก่อนประมวลผล"
    : isDuplicateProductName
      ? isEn
        ? "This product name already exists in Cloud. Please enter a unique name."
        : "ชื่อสินค้านี้มีอยู่ในคลาวด์แล้ว กรุณาตั้งชื่อใหม่ไม่ให้ซ้ำกัน"
      : null;

  const maxLimitWarningText = isEn
    ? "Maximum allowed value is 299,999 THB."
    : "กรอกได้สูงสุดไม่เกิน 299,999 บาท";

  function handleFieldKeyDown(
    index: number,
    event: ReactKeyboardEvent<HTMLInputElement>
  ) {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();

    const lastFieldIndex = 6;
    if (index < lastFieldIndex) {
      const nextInput = inputRefs.current[index + 1];
      if (!nextInput) return;
      nextInput.focus();
      nextInput.scrollIntoView({ behavior: "smooth", block: "center" });
      if (nextInput.type === "number") {
        try {
          nextInput.select();
        } catch {}
      }
      return;
    }

    event.currentTarget.blur();
    submitButtonRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function focusProductNameField() {
    const el = inputRefs.current[1];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      el.focus();
    }, 220);
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (values.productName.trim().length === 0) {
      setAttemptedEmptyName(true);
      focusProductNameField();
      return;
    }

    if (isDuplicateProductName) {
      focusProductNameField();
      return;
    }

    setAttemptedEmptyName(false);
    onCalculate();
  }

  function handleMonetaryChange(field: MonetaryField, raw: string) {
    const { value, clamped } = sanitizeBoundedDecimal(raw, MAX_MONETARY_VALUE);
    onChangeField(field, value);
    setClampedFields((prev) =>
      prev[field] === clamped ? prev : { ...prev, [field]: clamped }
    );
  }

  function handleFeePercentChange(raw: string) {
    const { value } = sanitizeBoundedDecimal(raw, 100);
    onChangeField("platformFeePercent", value);
  }

  function handleResetClick() {
    setAttemptedEmptyName(false);
    setClampedFields({});
    onReset();
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
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="space-y-6 sm:space-y-8"
    >
      {editingProductName && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/40 bg-[#060807]/90 backdrop-blur-md px-5 py-4 shadow-[0_0_24px_-6px_rgba(16,185,129,0.25)] light:border-emerald-300 light:bg-emerald-50 light:shadow-xs">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <span className="mt-0.5 sm:mt-0 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 light:bg-emerald-100 light:text-emerald-700">
              <Pencil className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white light:text-slate-900 truncate">
                {isEn
                  ? `Editing Record: ${editingProductName}`
                  : `กำลังแก้ไขรายการ: ${editingProductName}`}
              </p>
              <p className="text-xs text-zinc-400 light:text-slate-600 mt-0.5">
                {isEn
                  ? "Saving will update this existing Cloud record without creating a duplicate."
                  : "เมื่อกดบันทึก ระบบจะอัปเดตทับข้อมูลเดิมในคลาวด์โดยไม่สร้างรายการซ้ำ"}
              </p>
            </div>
          </div>

          {onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex shrink-0 self-start sm:self-center items-center gap-1.5 rounded-xl border border-zinc-800 bg-black px-3.5 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-slate-400 light:hover:text-slate-900"
            >
              <X className="h-3.5 w-3.5" />
              <span>{isEn ? "Cancel Edit" : "ยกเลิกการแก้ไข"}</span>
            </button>
          )}
        </div>
      )}

      <section className={GLASS_CARD_CLASS}>
        <div className={CARD_HEADER_BAND_CLASS}>
          <div className={GLOWING_ICON_BADGE_CLASS}>
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 light:text-emerald-700">
                STEP 01
              </span>
              <span className="text-zinc-700 light:text-slate-300">•</span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white light:text-slate-900">
                {isEn ? "Where do you sell this product?" : "คุณขายสินค้านี้ที่ไหน?"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
              {isEn
                ? "Pick a marketplace preset to auto-fill GP fees, or customize the percentage below."
                : "กดเลือกช่องทางขายเพื่อให้ระบบตั้งค่าธรรมเนียม (GP) อัตโนมัติ หรือปรับแก้ตัวเลขเปอร์เซ็นต์เองได้ตามจริง"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {PLATFORM_PRESETS.map((preset) => {
              const active =
                values.platform === preset.id &&
                Number(values.platformFeePercent || "0") === preset.feePercent;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left transition-all duration-200 ${
                    active
                      ? "bg-black/90 border border-emerald-400/80 text-white shadow-[0_0_26px_-4px_rgba(16,185,129,0.34),inset_0_0_24px_-12px_rgba(16,185,129,0.3)] light:bg-emerald-50/80 light:border-emerald-600 light:text-slate-900 light:shadow-xs"
                      : `${BOX_SURFACE_CLASS} text-zinc-300 hover:text-white light:text-slate-700 light:hover:text-slate-900`
                  }`}
                >
                  <div>
                    <span className="block text-base font-semibold">
                      {isEn ? preset.labelEn : preset.label}
                    </span>
                    <span className="block text-xs text-zinc-500 light:text-slate-500 mt-0.5">
                      {preset.badge}
                    </span>
                  </div>
                  <span
                    className={`rounded-xl font-mono text-sm font-semibold px-2.5 py-1 border ${
                      active
                        ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300 light:border-emerald-300 light:bg-emerald-100 light:text-emerald-800"
                        : "border-emerald-500/20 bg-black text-zinc-400 light:border-slate-200 light:bg-white light:text-slate-600"
                    }`}
                  >
                    GP {preset.feePercent}%
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800/70 light:border-slate-200 pt-5">
            <div>
              <label
                htmlFor="calc-platform-fee"
                className="block text-sm font-medium text-zinc-200 light:text-slate-800"
              >
                {isEn
                  ? "Custom Platform Fee (%)"
                  : "ปรับแก้ค่าธรรมเนียมแพลตฟอร์ม (%)"}
              </label>
              <p className="text-xs text-zinc-500 light:text-slate-500">
                {isEn
                  ? "If your store pays a different GP rate, edit the percentage here directly."
                  : "หากร้านของคุณโดนหักค่าธรรมเนียมต่างจากค่ามาตรฐาน สามารถพิมพ์แก้ตัวเลขช่องนี้ได้เลย"}
              </p>
            </div>
            <div className="w-full sm:w-44">
              <input
                ref={(el) => {
                  inputRefs.current[0] = el;
                }}
                id="calc-platform-fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                inputMode="decimal"
                value={values.platformFeePercent}
                onChange={(e) => handleFeePercentChange(e.target.value)}
                onKeyDown={(e) => handleFieldKeyDown(0, e)}
                placeholder="0"
                className={`${INPUT_SURFACE_CLASS} px-3.5 py-2.5 text-base font-mono tabular-nums text-zinc-100`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={GLASS_CARD_CLASS}>
        <div className={CARD_HEADER_BAND_CLASS}>
          <div className={GLOWING_ICON_BADGE_CLASS}>
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 light:text-emerald-700">
                STEP 02
              </span>
              <span className="text-zinc-700 light:text-slate-300">•</span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white light:text-slate-900">
                {isEn
                  ? "What product are you selling?"
                  : "สินค้าที่คุณจะขายคืออะไร?"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
              {isEn
                ? "Enter a unique product name or SKU (required) and optionally attach 1 product photo."
                : "ระบุชื่อสินค้าหรือรุ่นสินค้า (บังคับกรอก) และแนบรูปสินค้าได้ 1 รูป"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="calc-product-name"
              className="block text-sm font-medium text-zinc-200 light:text-slate-800"
            >
              {isEn ? "Product Name or SKU" : "ชื่อสินค้า หรือ รุ่นสินค้า"}
              <span
                className="ml-1 text-emerald-400 light:text-emerald-600"
                aria-hidden="true"
              >
                *
              </span>
            </label>
            <input
              ref={(el) => {
                inputRefs.current[1] = el;
              }}
              id="calc-product-name"
              type="text"
              required
              aria-invalid={Boolean(productNameErrorMessage)}
              value={values.productName}
              onChange={(e) => {
                onChangeField("productName", e.target.value);
                if (attemptedEmptyName && e.target.value.trim().length > 0) {
                  setAttemptedEmptyName(false);
                }
              }}
              onKeyDown={(e) => handleFieldKeyDown(1, e)}
              placeholder={
                isEn
                  ? "e.g. Premium Black Crewneck T-Shirt"
                  : "เช่น เสื้อยืดคอกลมสีดำ รุ่นพรีเมียม"
              }
              maxLength={120}
              className={`w-full rounded-xl bg-black/80 px-4 py-3 text-base text-zinc-100 placeholder-zinc-600 transition-all duration-200 focus:outline-none light:bg-white light:text-slate-900 light:placeholder-slate-400 ${
                productNameErrorMessage
                  ? "border border-rose-500/80 shadow-[0_0_20px_-6px_rgba(244,63,94,0.35)] focus:border-rose-400 light:border-rose-500 light:shadow-none"
                  : "border border-emerald-500/25 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] hover:border-emerald-400/50 focus:border-emerald-400 focus:shadow-[0_0_25px_-4px_rgba(16,185,129,0.3)] light:border-slate-300 light:shadow-xs light:hover:border-emerald-500 light:focus:border-emerald-600 light:focus:ring-2 light:focus:ring-emerald-600/20 light:focus:shadow-none"
              }`}
            />
            {productNameErrorMessage && (
              <p
                role="alert"
                className="flex items-center gap-1.5 text-xs font-medium text-rose-400 light:text-rose-600"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{productNameErrorMessage}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200 light:text-slate-800">
                {isEn
                  ? "Product Photo (1 image max — auto-resized & compressed)"
                  : "รูปภาพสินค้า (จำกัด 1 รูป — ระบบย่อและบีบอัดขนาดอัตโนมัติ)"}
              </span>
              {compressedImage && (
                <span className="font-mono text-xs text-emerald-400 light:text-emerald-700">
                  {isEn ? "Compressed" : "บีบอัดแล้ว"}{" "}
                  {formatFileSizeKb(compressedImage.sizeBytes)}
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
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 ${BOX_SURFACE_CLASS}`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-emerald-500/30 bg-black light:border-slate-200 light:bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activePreviewUrl}
                      alt={isEn ? "Product image preview" : "ตัวอย่างรูปสินค้า"}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-100 light:text-slate-900">
                      {isEn
                        ? "Product photo attached"
                        : "แนบรูปภาพสินค้าเรียบร้อยแล้ว"}
                    </p>
                    <p className="text-xs text-zinc-400 light:text-slate-600">
                      {compressedImage
                        ? isEn
                          ? `Ready to save (${formatFileSizeKb(compressedImage.sizeBytes)})`
                          : `ไฟล์ภาพพร้อมบันทึก (${formatFileSizeKb(compressedImage.sizeBytes)})`
                        : isEn
                          ? "Loaded from saved Cloud storage"
                          : "รูปภาพที่โหลดมาจากข้อมูลบน Cloud"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={compressingImage}
                    className="rounded-xl border border-emerald-500/30 bg-black px-3.5 py-2 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-400 light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:text-emerald-700 disabled:opacity-50"
                  >
                    {isEn ? "Change Photo" : "เปลี่ยนรูป"}
                  </button>
                  <button
                    type="button"
                    onClick={onRemoveImage}
                    disabled={compressingImage}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 light:border-slate-300 light:bg-white light:text-rose-600 light:hover:border-rose-400 light:hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{isEn ? "Remove" : "ลบรูป"}</span>
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
                className={`flex items-center justify-between gap-4 px-5 py-5 cursor-pointer ${BOX_SURFACE_CLASS}`}
              >
                <div className="flex items-center gap-3.5">
                  {compressingImage ? (
                    <Loader2 className="h-5 w-5 text-emerald-400 light:text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <ImagePlus className="h-5 w-5 text-emerald-400/80 light:text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-200 light:text-slate-800">
                      {compressingImage
                        ? isEn
                          ? "Compressing and optimizing photo..."
                          : "กำลังย่อและบีบอัดรูปภาพอัตโนมัติ..."
                        : isEn
                          ? "Click to choose 1 product photo (or drag & drop here)"
                          : "กดที่นี่เพื่อเลือกรูปสินค้า 1 รูป (หรือลากไฟล์มาวาง)"}
                    </p>
                    <p className="text-xs text-zinc-500 light:text-slate-500 mt-0.5">
                      {isEn
                        ? "Supports .jpg, .png, .webp (auto-compressed under 120 KB to save Cloud space)"
                        : "รองรับไฟล์ .jpg, .png, .webp (ย่อขนาดอัตโนมัติไม่เกิน 120 KB เพื่อประหยัดพื้นที่ Cloud)"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-xl border border-emerald-500/30 bg-black px-3 py-1.5 text-xs font-medium text-emerald-300 light:border-emerald-300 light:bg-emerald-50 light:text-emerald-700">
                  {isEn ? "Browse" : "เลือกรูป"}
                </span>
              </div>
            )}

            {imageError && (
              <p className="text-xs font-medium text-rose-400 light:text-rose-600">
                {imageError}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={GLASS_CARD_CLASS}>
        <div className={CARD_HEADER_BAND_CLASS}>
          <div className={GLOWING_ICON_BADGE_CLASS}>
            <Calculator className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 light:text-emerald-700">
                STEP 03
              </span>
              <span className="text-zinc-700 light:text-slate-300">•</span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white light:text-slate-900">
                {isEn
                  ? "Enter Unit Costs & Selling Price"
                  : "กรอกต้นทุนและราคาขาย"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
              {isEn
                ? "Enter your actual figures. Leave 0 for any unused expense (up to 299,999 THB per field)."
                : "กรอกตัวเลขตามความจริง ช่องไหนไม่มีค่าใช้จ่ายให้ใส่เลข 0 ได้เลย (สูงสุดไม่เกิน 299,999 บาทต่อช่อง)"}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-800/60 light:border-slate-200 pb-5">
              <div className="sm:col-span-7">
                <label
                  htmlFor="calc-cost-price"
                  className="block text-base font-semibold text-zinc-100 light:text-slate-900"
                >
                  {isEn
                    ? "1. Base Product Cost per Unit (THB)"
                    : "1. ต้นทุนสินค้าต่อชิ้น (บาท)"}
                </label>
                <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Wholesale purchase price or manufacturing cost for 1 unit."
                    : "ราคาทุนที่คุณรับสินค้ามา หรือต้นทุนผลิตต่อ 1 ชิ้น"}
                </p>
              </div>
              <div className="sm:col-span-5 space-y-1.5">
                <input
                  ref={(el) => {
                    inputRefs.current[2] = el;
                  }}
                  id="calc-cost-price"
                  type="number"
                  min="0"
                  max={MAX_MONETARY_VALUE}
                  step="0.01"
                  inputMode="decimal"
                  value={values.costPrice}
                  onChange={(e) =>
                    handleMonetaryChange("costPrice", e.target.value)
                  }
                  onKeyDown={(e) => handleFieldKeyDown(2, e)}
                  placeholder="0"
                  className={`${INPUT_SURFACE_CLASS} px-4 py-3 text-lg font-mono tabular-nums text-zinc-100`}
                />
                {clampedFields.costPrice && (
                  <p className="text-[11px] font-medium text-amber-400 light:text-amber-700">
                    {maxLimitWarningText}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-800/60 light:border-slate-200 pb-5">
              <div className="sm:col-span-7">
                <label
                  htmlFor="calc-packaging-cost"
                  className="block text-base font-semibold text-zinc-100 light:text-slate-900"
                >
                  {isEn
                    ? "2. Packaging & Fulfillment Cost per Unit (THB)"
                    : "2. ค่ากล่องและค่าแพ็กต่อชิ้น (บาท)"}
                </label>
                <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Boxes, bubble wrap, tape, poly mailers, and shipping labels per unit."
                    : "รวมค่ากล่องพัสดุ บับเบิลกันกระแทก เทปกาว และใบปะหน้าต่อ 1 ชิ้น"}
                </p>
              </div>
              <div className="sm:col-span-5 space-y-1.5">
                <input
                  ref={(el) => {
                    inputRefs.current[3] = el;
                  }}
                  id="calc-packaging-cost"
                  type="number"
                  min="0"
                  max={MAX_MONETARY_VALUE}
                  step="0.01"
                  inputMode="decimal"
                  value={values.packagingCost}
                  onChange={(e) =>
                    handleMonetaryChange("packagingCost", e.target.value)
                  }
                  onKeyDown={(e) => handleFieldKeyDown(3, e)}
                  placeholder="0"
                  className={`${INPUT_SURFACE_CLASS} px-4 py-3 text-lg font-mono tabular-nums text-zinc-100`}
                />
                {clampedFields.packagingCost && (
                  <p className="text-[11px] font-medium text-amber-400 light:text-amber-700">
                    {maxLimitWarningText}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-800/60 light:border-slate-200 pb-5">
              <div className="sm:col-span-7">
                <label
                  htmlFor="calc-ads-cost"
                  className="block text-base font-semibold text-zinc-100 light:text-slate-900"
                >
                  {isEn
                    ? "3. Average Ad Spend per Unit / CPA (THB)"
                    : "3. ค่าโฆษณาเฉลี่ยต่อชิ้น (บาท)"}
                </label>
                <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Average ad spend needed to convert 1 unit (enter 0 if organic)."
                    : "ค่าแอดเฉลี่ยเพื่อให้ขายสินค้าได้ 1 ชิ้น (ถ้าไม่ได้ยิงแอดให้ใส่ 0)"}
                </p>
              </div>
              <div className="sm:col-span-5 space-y-1.5">
                <input
                  ref={(el) => {
                    inputRefs.current[4] = el;
                  }}
                  id="calc-ads-cost"
                  type="number"
                  min="0"
                  max={MAX_MONETARY_VALUE}
                  step="0.01"
                  inputMode="decimal"
                  value={values.adsCost}
                  onChange={(e) =>
                    handleMonetaryChange("adsCost", e.target.value)
                  }
                  onKeyDown={(e) => handleFieldKeyDown(4, e)}
                  placeholder="0"
                  className={`${INPUT_SURFACE_CLASS} px-4 py-3 text-lg font-mono tabular-nums text-zinc-100`}
                />
                {clampedFields.adsCost && (
                  <p className="text-[11px] font-medium text-amber-400 light:text-amber-700">
                    {maxLimitWarningText}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 border-b border-zinc-800/60 light:border-slate-200 pb-5">
              <div className="sm:col-span-7">
                <label
                  htmlFor="calc-selling-price"
                  className="block text-base font-bold text-emerald-400 light:text-emerald-700"
                >
                  {isEn
                    ? "4. Planned Selling Price per Unit (THB)"
                    : "4. ราคาที่จะตั้งขายต่อชิ้น (บาท)"}
                </label>
                <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Storefront retail price you plan to charge customers."
                    : "ราคาขายหน้าร้านที่คุณตั้งใจจะขายให้ลูกค้า"}
                </p>
              </div>
              <div className="sm:col-span-5 space-y-1.5">
                <input
                  ref={(el) => {
                    inputRefs.current[5] = el;
                  }}
                  id="calc-selling-price"
                  type="number"
                  min="0"
                  max={MAX_MONETARY_VALUE}
                  step="0.01"
                  inputMode="decimal"
                  value={values.sellingPrice}
                  onChange={(e) =>
                    handleMonetaryChange("sellingPrice", e.target.value)
                  }
                  onKeyDown={(e) => handleFieldKeyDown(5, e)}
                  placeholder="0"
                  className="w-full rounded-xl bg-black/85 border-2 border-emerald-500/65 px-4 py-3 text-lg font-mono font-bold tabular-nums text-emerald-400 shadow-[0_0_24px_-6px_rgba(16,185,129,0.28)] transition-all duration-200 hover:border-emerald-400 focus:border-emerald-400 focus:shadow-[0_0_28px_-4px_rgba(16,185,129,0.42)] focus:outline-none light:bg-emerald-50/40 light:border-emerald-600 light:text-emerald-800 light:shadow-xs light:hover:border-emerald-700 light:focus:border-emerald-700 light:focus:ring-2 light:focus:ring-emerald-600/20 light:focus:shadow-none"
                />
                {clampedFields.sellingPrice && (
                  <p className="text-[11px] font-medium text-amber-400 light:text-amber-700">
                    {maxLimitWarningText}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 items-start gap-2 sm:gap-6 pb-2">
              <div className="sm:col-span-7">
                <label
                  htmlFor="calc-fixed-cost"
                  className="block text-base font-semibold text-zinc-100 light:text-slate-900"
                >
                  {isEn
                    ? "5. Monthly Fixed Costs (THB) — Optional"
                    : "5. ต้นทุนคงที่ต่อเดือน (บาท) — ถ้ามี"}
                </label>
                <p className="text-xs sm:text-sm text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Rent, utilities, salaries, or software subscriptions to compute break-even volume (enter 0 if none)."
                    : "เช่น ค่าเช่าที่ ค่าไฟ ค่าจ้างพนักงาน เพื่อคำนวณว่าต้องขายกี่ชิ้นจึงจะคุ้มทุน (ถ้าไม่มีใส่ 0)"}
                </p>
              </div>
              <div className="sm:col-span-5 space-y-1.5">
                <input
                  ref={(el) => {
                    inputRefs.current[6] = el;
                  }}
                  id="calc-fixed-cost"
                  type="number"
                  min="0"
                  max={MAX_MONETARY_VALUE}
                  step="0.01"
                  inputMode="decimal"
                  value={values.fixedCost}
                  onChange={(e) =>
                    handleMonetaryChange("fixedCost", e.target.value)
                  }
                  onKeyDown={(e) => handleFieldKeyDown(6, e)}
                  placeholder="0"
                  className={`${INPUT_SURFACE_CLASS} px-4 py-3 text-lg font-mono tabular-nums text-zinc-100`}
                />
                {clampedFields.fixedCost && (
                  <p className="text-[11px] font-medium text-amber-400 light:text-amber-700">
                    {maxLimitWarningText}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-zinc-800/70 light:border-slate-200">
            <button
              type="button"
              onClick={handleResetClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black/80 border border-emerald-500/25 px-4 py-3.5 text-sm font-medium text-zinc-400 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-zinc-100 light:bg-white light:border-slate-300 light:text-slate-600 light:shadow-xs light:hover:border-slate-400 light:hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isEn ? "Reset" : "ล้างค่า"}</span>
            </button>

            <button
              ref={submitButtonRef}
              type="submit"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.45)] transition-all duration-200 hover:bg-emerald-400 light:bg-emerald-600 light:text-white light:shadow-sm light:hover:bg-emerald-700"
            >
              <span>
                {isEn ? "Calculate & Analyze Profit" : "ประมวลผลและสรุปกำไร"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </form>
  );
}
