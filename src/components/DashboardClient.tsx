"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizePlainText, translateSupabaseError } from "@/lib/auth";
import {
  buildCsvExportContent,
  calculateEcommerceMetrics,
  parseSafeNonNegativeNumber,
  simulatePromoDiscount,
} from "@/lib/calculator";
import {
  compressProductImageFile,
  extractProductImageStoragePath,
} from "@/lib/image-compression";
import type {
  CalculatorFormStrings,
  CalculatorInputValues,
  CompressedProductImage,
  EcommerceCalculationRecord,
  PlatformPreset,
} from "@/types";
import { CalculatorForm } from "@/components/CalculatorForm";
import { CalculationReport } from "@/components/CalculationReport";
import { HistoryPanel } from "@/components/HistoryPanel";

interface DashboardClientProps {
  userId: string;
  initialRecords: EcommerceCalculationRecord[];
}

type DashboardTab = "calculator" | "history";

const DEFAULT_FORM_VALUES: CalculatorFormStrings = {
  productName: "เสื้อยืดคอกลมสีดำ รุ่นพรีเมียม",
  platform: "Shopee",
  costPrice: "120",
  packagingCost: "15",
  adsCost: "35",
  platformFeePercent: "13",
  sellingPrice: "290",
  fixedCost: "15000",
};

const RECORD_SELECT_COLUMNS =
  "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, product_image_url, created_at";

export function DashboardClient({
  userId,
  initialRecords,
}: DashboardClientProps) {
  const topFormRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("calculator");

  const [formValues, setFormValues] =
    useState<CalculatorFormStrings>(DEFAULT_FORM_VALUES);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  const [compressedImage, setCompressedImage] =
    useState<CompressedProductImage | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [compressingImage, setCompressingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [records, setRecords] =
    useState<EcommerceCalculationRecord[]>(initialRecords);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (compressedImage?.previewUrl) {
        URL.revokeObjectURL(compressedImage.previewUrl);
      }
    };
  }, [compressedImage]);

  const numericInputs: CalculatorInputValues = useMemo(
    () => ({
      productName: sanitizePlainText(formValues.productName, 120),
      platform: sanitizePlainText(formValues.platform, 60) || "Shopee",
      costPrice: parseSafeNonNegativeNumber(formValues.costPrice, 10_000_000),
      packagingCost: parseSafeNonNegativeNumber(
        formValues.packagingCost,
        1_000_000
      ),
      adsCost: parseSafeNonNegativeNumber(formValues.adsCost, 1_000_000),
      platformFeePercent: parseSafeNonNegativeNumber(
        formValues.platformFeePercent,
        100
      ),
      sellingPrice: parseSafeNonNegativeNumber(
        formValues.sellingPrice,
        10_000_000
      ),
      fixedCost: parseSafeNonNegativeNumber(formValues.fixedCost, 100_000_000),
    }),
    [formValues]
  );

  const metrics = useMemo(
    () => calculateEcommerceMetrics(numericInputs),
    [numericInputs]
  );

  const simulation = useMemo(
    () => simulatePromoDiscount(numericInputs, metrics, discountPercent),
    [numericInputs, metrics, discountPercent]
  );

  const fetchHistory = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;

    setRefreshing(true);
    setDbError(null);

    const { data, error } = await supabase
      .from("ecommerce_calculations")
      .select(RECORD_SELECT_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setDbError(translateSupabaseError(error));
    } else if (data) {
      setRecords(data as EcommerceCalculationRecord[]);
    }
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`ecommerce_calculations_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ecommerce_calculations",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const inserted = payload.new as EcommerceCalculationRecord;
            setRecords((prev) =>
              prev.some((item) => item.id === inserted.id)
                ? prev
                : [inserted, ...prev]
            );
          } else if (payload.eventType === "DELETE") {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) {
              setRecords((prev) =>
                prev.filter((item) => item.id !== removedId)
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as EcommerceCalculationRecord;
            setRecords((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      setRealtimeConnected(false);
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  function handleChangeField(
    field: keyof CalculatorFormStrings,
    value: string
  ) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectPreset(preset: PlatformPreset) {
    setFormValues((prev) => ({
      ...prev,
      platform: preset.id,
      platformFeePercent: String(preset.feePercent),
    }));
  }

  async function handleSelectImageFile(file: File) {
    setImageError(null);
    setCompressingImage(true);

    try {
      const result = await compressProductImageFile(file);
      setCompressedImage((prev) => {
        if (prev?.previewUrl) {
          URL.revokeObjectURL(prev.previewUrl);
        }
        return result;
      });
      setExistingImageUrl(null);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "ไม่สามารถประมวลผลรูปภาพนี้ได้ กรุณาเลือกรูปอื่น";
      setImageError(msg);
    } finally {
      setCompressingImage(false);
    }
  }

  function handleRemoveImage() {
    setCompressedImage((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
    setExistingImageUrl(null);
    setImageError(null);
  }

  function handleCalculate() {
    setHasCalculated(true);
    setDbError(null);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const reportEl = document.getElementById("calculation-report");
        if (reportEl) {
          reportEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 60);
    });
  }

  function handleReset() {
    setFormValues({
      productName: "",
      platform: "Shopee",
      costPrice: "",
      packagingCost: "",
      adsCost: "",
      platformFeePercent: "13",
      sellingPrice: "",
      fixedCost: "",
    });
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
    setDbError(null);
    setDbSuccess(null);
  }

  function handleEditTop() {
    if (topFormRef.current) {
      topFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSaveToCloud() {
    const supabase = createClient();
    if (!supabase || saving) return;

    setDbError(null);
    setDbSuccess(null);
    setSaving(true);

    const safeProductName =
      sanitizePlainText(numericInputs.productName, 120) || "สินค้าไม่ระบุชื่อ";
    const safePlatform =
      sanitizePlainText(numericInputs.platform, 60) || "ทั่วไป";

    let finalImageUrl: string | null = existingImageUrl;
    let uploadedStoragePath: string | null = null;

    try {
      if (compressedImage) {
        const randomSuffix = Math.random().toString(36).slice(2, 9);
        const filePath = `${userId}/${Date.now()}-${randomSuffix}.${compressedImage.extension}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, compressedImage.blob, {
            contentType: compressedImage.mimeType,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setDbError(`อัปโหลดรูปสินค้าไม่สำเร็จ: ${translateSupabaseError(uploadError)}`);
          setSaving(false);
          return;
        }

        uploadedStoragePath = filePath;
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const { data, error } = await supabase
        .from("ecommerce_calculations")
        .insert({
          user_id: userId,
          product_name: safeProductName,
          platform: safePlatform,
          cost_price: numericInputs.costPrice,
          packaging_cost: numericInputs.packagingCost,
          ads_cost: numericInputs.adsCost,
          platform_fee_percent: numericInputs.platformFeePercent,
          selling_price: numericInputs.sellingPrice,
          fixed_cost: numericInputs.fixedCost,
          product_image_url: finalImageUrl,
        })
        .select(RECORD_SELECT_COLUMNS)
        .single();

      if (error) {
        if (uploadedStoragePath) {
          await supabase.storage
            .from("product-images")
            .remove([uploadedStoragePath]);
        }
        setDbError(translateSupabaseError(error));
      } else if (data) {
        const created = data as EcommerceCalculationRecord;
        setRecords((prev) =>
          prev.some((item) => item.id === created.id)
            ? prev
            : [created, ...prev]
        );
        if (created.product_image_url) {
          setExistingImageUrl(created.product_image_url);
          setCompressedImage((prev) => {
            if (prev?.previewUrl) {
              URL.revokeObjectURL(prev.previewUrl);
            }
            return null;
          });
        }
        setDbSuccess(`บันทึก "${created.product_name}" ลง Cloud เรียบร้อยแล้ว`);
      }
    } catch (err) {
      setDbError(translateSupabaseError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecord(record: EcommerceCalculationRecord) {
    const supabase = createClient();
    if (!supabase || deletingId) return;

    setDeletingId(record.id);
    setDbError(null);
    setDbSuccess(null);

    try {
      const storagePath = extractProductImageStoragePath(
        record.product_image_url,
        userId
      );

      const { error } = await supabase
        .from("ecommerce_calculations")
        .delete()
        .eq("id", record.id)
        .eq("user_id", userId);

      if (error) {
        setDbError(translateSupabaseError(error));
      } else {
        if (storagePath) {
          await supabase.storage.from("product-images").remove([storagePath]);
        }
        setRecords((prev) => prev.filter((item) => item.id !== record.id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleLoadRecord(record: EcommerceCalculationRecord) {
    handleRemoveImage();
    setFormValues({
      productName: record.product_name,
      platform: record.platform,
      costPrice: String(record.cost_price),
      packagingCost: String(record.packaging_cost),
      adsCost: String(record.ads_cost),
      platformFeePercent: String(record.platform_fee_percent),
      sellingPrice: String(record.selling_price),
      fixedCost: String(record.fixed_cost),
    });
    setExistingImageUrl(record.product_image_url ?? null);
    setHasCalculated(true);
    setActiveTab("calculator");
    setDbSuccess(`โหลดข้อมูล "${record.product_name}" กลับมาเรียบร้อยแล้ว`);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const reportEl = document.getElementById("calculation-report");
        if (reportEl) {
          reportEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 80);
    });
  }

  function handleExportCsv() {
    const csvContent = buildCsvExportContent(records, numericInputs);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `khumlab-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const activePreviewUrl = compressedImage?.previewUrl ?? existingImageUrl;

  return (
    <main className="w-full max-w-3xl mx-auto flex-1 px-6 py-10 sm:py-12 space-y-8">
      <div
        ref={topFormRef}
        className="scroll-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            KhumLab Profit Planner
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            คำนวณต้นทุนและกำไรสุทธิทีละขั้น
          </h1>
        </div>

        <div className="inline-flex self-start border border-zinc-800 bg-black p-1">
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "calculator"
                ? "bg-emerald-500 text-slate-950"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            คำนวณรายการใหม่
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-emerald-500 text-slate-950"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            ประวัติที่บันทึกไว้ ({records.length})
          </button>
        </div>
      </div>

      {dbError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 border border-rose-500/40 bg-rose-950/30 px-4 py-3 text-xs sm:text-sm text-rose-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{dbError}</span>
        </div>
      )}

      {dbSuccess && (
        <div
          role="status"
          className="flex items-center justify-between gap-2.5 border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs sm:text-sm text-emerald-300"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{dbSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setDbSuccess(null)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            ปิด
          </button>
        </div>
      )}

      {activeTab === "calculator" ? (
        <div className="space-y-14">
          <CalculatorForm
            values={formValues}
            compressedImage={compressedImage}
            existingImageUrl={existingImageUrl}
            compressingImage={compressingImage}
            imageError={imageError}
            onChangeField={handleChangeField}
            onSelectPreset={handleSelectPreset}
            onSelectImageFile={handleSelectImageFile}
            onRemoveImage={handleRemoveImage}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />

          {hasCalculated && (
            <CalculationReport
              inputs={numericInputs}
              metrics={metrics}
              simulation={simulation}
              discountPercent={discountPercent}
              previewImageUrl={activePreviewUrl}
              saving={saving}
              onChangeDiscount={setDiscountPercent}
              onSaveToCloud={handleSaveToCloud}
              onExportCsv={handleExportCsv}
              onEditTop={handleEditTop}
            />
          )}
        </div>
      ) : (
        <HistoryPanel
          records={records}
          loading={refreshing}
          deletingId={deletingId}
          realtimeConnected={realtimeConnected}
          onRefresh={fetchHistory}
          onExportCsv={handleExportCsv}
          onLoadRecord={handleLoadRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      )}
    </main>
  );
}
