"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cloud, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizePlainText, translateSupabaseError } from "@/lib/auth";
import { useAppLanguage } from "@/lib/language";
import {
  MAX_CLOUD_RECORDS,
  calculateEcommerceMetrics,
  exportCalculationsToCsv,
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
  CsvExportColumnKey,
  EcommerceCalculationRecord,
  PlatformPreset,
} from "@/types";
import { CalculatorForm } from "@/components/CalculatorForm";
import { CalculationReport } from "@/components/CalculationReport";
import { HistoryPanel } from "@/components/HistoryPanel";
import { FloatingBackgroundDocs } from "@/components/FloatingBackgroundDocs";
import {
  DashboardToast,
  type DashboardToastData,
} from "@/components/DashboardToast";

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

const EMPTY_FORM_VALUES: CalculatorFormStrings = {
  productName: "",
  platform: "Shopee",
  costPrice: "",
  packagingCost: "",
  adsCost: "",
  platformFeePercent: "13",
  sellingPrice: "",
  fixedCost: "",
};

const RECORD_SELECT_COLUMNS =
  "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, product_image_url, created_at";

export function DashboardClient({
  userId,
  initialRecords,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language] = useAppLanguage();
  const isEn = language === "en";

  const topFormRef = useRef<HTMLDivElement | null>(null);
  const toastCounterRef = useRef(0);
  const activeTab: DashboardTab =
    searchParams.get("tab") === "history" ? "history" : "calculator";

  function handleSwitchTab(nextTab: DashboardTab) {
    router.replace(`/dashboard?tab=${nextTab}`, { scroll: false });
  }

  const [formValues, setFormValues] =
    useState<CalculatorFormStrings>(DEFAULT_FORM_VALUES);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] =
    useState<EcommerceCalculationRecord | null>(null);

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
  const [pendingDeleteRecord, setPendingDeleteRecord] =
    useState<EcommerceCalculationRecord | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [toast, setToast] = useState<DashboardToastData | null>(null);

  const isCloudFull = records.length >= MAX_CLOUD_RECORDS;

  const showToast = useCallback(
    (message: string, variant: "success" | "error" = "success") => {
      toastCounterRef.current += 1;
      setToast({
        id: toastCounterRef.current,
        message,
        variant,
      });
    },
    []
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (compressedImage?.previewUrl) {
        URL.revokeObjectURL(compressedImage.previewUrl);
      }
    };
  }, [compressedImage]);

  useEffect(() => {
    if (!pendingDeleteRecord) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingId) {
        setPendingDeleteRecord(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pendingDeleteRecord, deletingId]);

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

    const { data, error } = await supabase
      .from("ecommerce_calculations")
      .select(RECORD_SELECT_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      showToast(translateSupabaseError(error), "error");
    } else if (data) {
      setRecords(data as EcommerceCalculationRecord[]);
    }
    setRefreshing(false);
  }, [userId, showToast]);

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
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
  }

  function handleStartNewCalculation() {
    setEditingRecord(null);
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
    handleSwitchTab("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingRecord(null);
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
    showToast("ยกเลิกการแก้ไขรายการเดิมแล้ว", "success");
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

    const isEditing = editingRecord !== null;

    if (!isEditing && records.length >= MAX_CLOUD_RECORDS) {
      showToast(
        `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม`,
        "error"
      );
      return;
    }

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
          showToast(
            `อัปโหลดรูปสินค้าไม่สำเร็จ: ${translateSupabaseError(uploadError)}`,
            "error"
          );
          setSaving(false);
          return;
        }

        uploadedStoragePath = filePath;
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
      }

      if (isEditing && editingRecord) {
        const previousImageUrl = editingRecord.product_image_url;

        const { data, error } = await supabase
          .from("ecommerce_calculations")
          .update({
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
          .eq("id", editingRecord.id)
          .eq("user_id", userId)
          .select(RECORD_SELECT_COLUMNS)
          .single();

        if (error) {
          if (uploadedStoragePath) {
            await supabase.storage
              .from("product-images")
              .remove([uploadedStoragePath]);
          }
          showToast(translateSupabaseError(error), "error");
        } else if (data) {
          const updated = data as EcommerceCalculationRecord;

          if (previousImageUrl && previousImageUrl !== finalImageUrl) {
            const oldStoragePath = extractProductImageStoragePath(
              previousImageUrl,
              userId
            );
            if (oldStoragePath) {
              await supabase.storage
                .from("product-images")
                .remove([oldStoragePath]);
            }
          }

          setRecords((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
          setEditingRecord(null);
          setHasCalculated(false);
          handleRemoveImage();
          handleSwitchTab("history");
          window.scrollTo({ top: 0, behavior: "smooth" });
          showToast("บันทึกการแก้ไขเรียบร้อยแล้ว", "success");
        }
      } else {
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
          showToast(translateSupabaseError(error), "error");
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
          showToast(
            `บันทึก "${created.product_name}" ลง Cloud เรียบร้อยแล้ว`,
            "success"
          );
        }
      }
    } catch (err) {
      showToast(translateSupabaseError(err), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDeleteRecord() {
    const record = pendingDeleteRecord;
    const supabase = createClient();
    if (!record || !supabase || deletingId) return;

    setDeletingId(record.id);

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
        showToast(translateSupabaseError(error), "error");
      } else {
        if (storagePath) {
          await supabase.storage.from("product-images").remove([storagePath]);
        }
        setRecords((prev) => prev.filter((item) => item.id !== record.id));
        if (editingRecord?.id === record.id) {
          setEditingRecord(null);
        }
        setPendingDeleteRecord(null);
        showToast(`ลบรายการ "${record.product_name}" เรียบร้อยแล้ว`, "success");
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleLoadRecord(record: EcommerceCalculationRecord) {
    handleRemoveImage();
    setEditingRecord(record);
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
    handleSwitchTab("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function triggerCsvDownload(csvContent: string) {
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

  function handleExportReportCsv() {
    const csvContent = exportCalculationsToCsv([], undefined, numericInputs);
    triggerCsvDownload(csvContent);
  }

  function handleExportCloudCsv(
    orderedRecords: EcommerceCalculationRecord[],
    selectedKeys: CsvExportColumnKey[]
  ) {
    if (selectedKeys.length === 0 || orderedRecords.length === 0) return;
    const csvContent = exportCalculationsToCsv(orderedRecords, selectedKeys);
    triggerCsvDownload(csvContent);
  }

  const activePreviewUrl = compressedImage?.previewUrl ?? existingImageUrl;

  return (
    <div className="relative z-0 flex-1 flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.075) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="animate-dashboard-glow-a absolute inset-x-0 top-0 h-[560px]"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(16, 185, 129, 0.22), rgba(16, 185, 129, 0.08) 45%, transparent 78%)",
          }}
        />
        <div className="animate-dashboard-glow-b absolute -top-24 left-[8%] h-[420px] w-[42vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/20 via-emerald-500/8 to-transparent blur-3xl" />
        <div className="animate-dashboard-glow-a absolute -top-28 right-[8%] h-[440px] w-[40vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-400/18 via-emerald-500/8 to-transparent blur-3xl" />
        <FloatingBackgroundDocs />
      </div>

      <main
        className={`relative z-10 w-full max-w-6xl mx-auto flex-1 px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 space-y-8 ${
          activeTab === "history" ? "pb-28" : "pb-14"
        }`}
      >
        <div
          ref={topFormRef}
          className="scroll-mt-20 flex flex-col lg:flex-row lg:items-end justify-between gap-5"
        >
          {activeTab === "calculator" ? (
            <div className="space-y-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                KhumLab Profit Planner
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {isEn
                  ? "Step-by-Step Profit & Break-Even Planner"
                  : "คำนวณต้นทุนและกำไรสุทธิทีละขั้น"}
              </h1>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {isEn
                    ? `Cloud Storage (${records.length}/${MAX_CLOUD_RECORDS})`
                    : `คลาวด์เก็บข้อมูล (${records.length}/${MAX_CLOUD_RECORDS})`}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#050505] px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      realtimeConnected
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                  <span>{realtimeConnected ? "Cloud Synced" : "Cloud Ready"}</span>
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {isEn
                  ? `Store up to ${MAX_CLOUD_RECORDS} pricing plans. Open any item to edit or download your selected records as a single table file.`
                  : `บันทึกแผนคำนวณได้สูงสุด ${MAX_CLOUD_RECORDS} รายการ กดเปิดดูเพื่อแก้ไข หรือเลือกรายการที่ต้องการแล้วดาวน์โหลดรวมเป็นไฟล์ตารางเดียว (เปิดใน Excel / Google Sheets ได้ทันที)`}
              </p>
            </div>
          )}

          {activeTab === "history" ? (
            <button
              type="button"
              onClick={handleStartNewCalculation}
              className="inline-flex shrink-0 self-start lg:self-auto items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{isEn ? "New Calculation" : "คำนวณรายการใหม่"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSwitchTab("history")}
              className="inline-flex shrink-0 self-start lg:self-auto items-center gap-2 rounded-2xl border border-emerald-500/30 bg-[#050505] px-5 py-3 text-sm font-semibold text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.18)] transition-all duration-200 hover:border-emerald-400/60 hover:text-emerald-300 whitespace-nowrap"
            >
              <Cloud className="h-4 w-4 text-emerald-400" />
              <span>
                {isEn
                  ? `Cloud Storage (${records.length}/${MAX_CLOUD_RECORDS})`
                  : `คลาวด์เก็บข้อมูล (${records.length}/${MAX_CLOUD_RECORDS})`}
              </span>
            </button>
          )}
        </div>

        {activeTab === "calculator" ? (
          <div className="space-y-14">
            <CalculatorForm
              values={formValues}
              compressedImage={compressedImage}
              existingImageUrl={existingImageUrl}
              compressingImage={compressingImage}
              imageError={imageError}
              editingProductName={editingRecord?.product_name ?? null}
              onCancelEdit={handleCancelEdit}
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
                isCloudFull={isCloudFull}
                isEditing={Boolean(editingRecord)}
                onChangeDiscount={setDiscountPercent}
                onSaveToCloud={handleSaveToCloud}
                onExportCsv={handleExportReportCsv}
                onEditTop={handleEditTop}
              />
            )}
          </div>
        ) : (
          <HistoryPanel
            records={records}
            loading={refreshing}
            deletingId={deletingId}
            onRefresh={fetchHistory}
            onExportCsv={handleExportCloudCsv}
            onLoadRecord={handleLoadRecord}
            onDeleteRecord={(record) => setPendingDeleteRecord(record)}
          />
        )}
      </main>

      <DashboardToast toast={toast} onDismiss={dismissToast} />

      {pendingDeleteRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-record-confirm-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingId) {
              setPendingDeleteRecord(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-red-500/30 bg-[#050505] p-6 text-zinc-100 shadow-2xl">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent"
            />

            <div className="space-y-2.5">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2
                id="delete-record-confirm-title"
                className="pt-1 text-lg font-bold tracking-tight text-white"
              >
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
              </h2>
              <div className="rounded-xl border border-zinc-800/90 bg-black px-3.5 py-2.5 text-sm font-medium text-zinc-200 truncate">
                {pendingDeleteRecord.product_name}
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                ข้อมูลรายการนี้และรูปภาพสินค้าที่แนบไว้จะถูกลบออกจากคลาวด์อย่างถาวร และไม่สามารถกู้คืนได้
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDeleteRecord(null)}
                disabled={Boolean(deletingId)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRecord}
                disabled={Boolean(deletingId)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {deletingId === pendingDeleteRecord.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <span>
                  {deletingId === pendingDeleteRecord.id
                    ? "กำลังลบ..."
                    : "ยืนยันการลบ"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
