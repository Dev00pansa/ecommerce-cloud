"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Cloud, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sanitizePlainText, translateSupabaseError } from "@/lib/auth";
import { useAppLanguage } from "@/lib/language";
import {
  MAX_CLOUD_RECORDS,
  MAX_MONETARY_VALUE,
  buildFinancialAnalysis,
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

type DashboardTab = "calculator" | "history" | "summary";

const SAVE_COOLDOWN_MS = 20_000;
const SAVE_COOLDOWN_STORAGE_KEY = "khumlab_save_cooldown_until";

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

function getStoredCooldownSeconds(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(SAVE_COOLDOWN_STORAGE_KEY);
    if (!raw) return 0;
    const until = Number(raw);
    if (!Number.isFinite(until)) return 0;
    const remainingMs = until - Date.now();
    if (remainingMs <= 0) {
      window.localStorage.removeItem(SAVE_COOLDOWN_STORAGE_KEY);
      return 0;
    }
    return Math.ceil(remainingMs / 1000);
  } catch {
    return 0;
  }
}

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
  const summaryEnteredRef = useRef(false);

  const [formValues, setFormValues] =
    useState<CalculatorFormStrings>(EMPTY_FORM_VALUES);
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [pendingExitTab, setPendingExitTab] = useState<
    "history" | "calculator" | null
  >(null);
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
  const [deleting, setDeleting] = useState(false);
  const [saveCooldownSeconds, setSaveCooldownSeconds] = useState<number>(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [toast, setToast] = useState<DashboardToastData | null>(null);

  const rawTab = searchParams.get("tab");
  const needsRedirectFromSummary =
    rawTab === "summary" && !hasCalculated && pendingExitTab === null;

  const activeTab: DashboardTab =
    pendingExitTab !== null
      ? pendingExitTab
      : rawTab === "summary" && hasCalculated
        ? "summary"
        : rawTab === "calculator" || needsRedirectFromSummary
          ? "calculator"
          : "history";

  const isCloudFull = records.length >= MAX_CLOUD_RECORDS;

  const handleSwitchTab = useCallback(
    (nextTab: DashboardTab) => {
      router.replace(`/dashboard?tab=${nextTab}`, { scroll: false });
    },
    [router]
  );

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
    if (needsRedirectFromSummary) {
      router.replace("/dashboard?tab=calculator", { scroll: false });
    }
  }, [needsRedirectFromSummary, router]);

  useEffect(() => {
    if (pendingExitTab !== null && rawTab === pendingExitTab) {
      summaryEnteredRef.current = false;
      const timerId = window.setTimeout(() => {
        setPendingExitTab(null);
        setHasCalculated(false);
      }, 0);
      return () => {
        window.clearTimeout(timerId);
      };
    }

    if (rawTab === "summary" && hasCalculated && pendingExitTab === null) {
      summaryEnteredRef.current = true;
      return;
    }

    if (
      rawTab !== "summary" &&
      pendingExitTab === null &&
      summaryEnteredRef.current
    ) {
      summaryEnteredRef.current = false;
      const timerId = window.setTimeout(() => {
        setHasCalculated(false);
      }, 0);
      return () => {
        window.clearTimeout(timerId);
      };
    }
  }, [rawTab, hasCalculated, pendingExitTab]);

  useEffect(() => {
    const syncCooldown = () => {
      setSaveCooldownSeconds(getStoredCooldownSeconds());
    };

    const initialTimer = window.setTimeout(syncCooldown, 0);
    const intervalId = window.setInterval(syncCooldown, 250);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalId);
    };
  }, []);

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
      costPrice: parseSafeNonNegativeNumber(
        formValues.costPrice,
        MAX_MONETARY_VALUE
      ),
      packagingCost: parseSafeNonNegativeNumber(
        formValues.packagingCost,
        MAX_MONETARY_VALUE
      ),
      adsCost: parseSafeNonNegativeNumber(
        formValues.adsCost,
        MAX_MONETARY_VALUE
      ),
      platformFeePercent: parseSafeNonNegativeNumber(
        formValues.platformFeePercent,
        100
      ),
      sellingPrice: parseSafeNonNegativeNumber(
        formValues.sellingPrice,
        MAX_MONETARY_VALUE
      ),
      fixedCost: parseSafeNonNegativeNumber(
        formValues.fixedCost,
        MAX_MONETARY_VALUE
      ),
    }),
    [formValues]
  );

  const isDuplicateProductName = useMemo(() => {
    const normalized = sanitizePlainText(formValues.productName, 120)
      .trim()
      .toLowerCase();
    if (!normalized) return false;
    return records.some(
      (item) =>
        item.id !== editingRecord?.id &&
        item.product_name.trim().toLowerCase() === normalized
    );
  }, [formValues.productName, records, editingRecord]);

  const metrics = useMemo(
    () => calculateEcommerceMetrics(numericInputs),
    [numericInputs]
  );

  const simulation = useMemo(
    () => simulatePromoDiscount(numericInputs, metrics, discountPercent),
    [numericInputs, metrics, discountPercent]
  );

  const analysis = useMemo(
    () => buildFinancialAnalysis(numericInputs, metrics, language),
    [numericInputs, metrics, language]
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
      showToast(translateSupabaseError(error, language), "error");
    } else if (data) {
      setRecords(data as EcommerceCalculationRecord[]);
    }
    setRefreshing(false);
  }, [userId, showToast, language]);

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
      const result = await compressProductImageFile(file, language);
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
          : isEn
            ? "Unable to process this image. Please choose another file."
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
    if (!numericInputs.productName.trim() || isDuplicateProductName) return;
    summaryEnteredRef.current = false;
    setPendingExitTab(null);
    setHasCalculated(true);
    handleSwitchTab("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBackToCalculator() {
    summaryEnteredRef.current = false;
    setPendingExitTab("calculator");
    handleSwitchTab("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    summaryEnteredRef.current = false;
    setPendingExitTab(null);
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
  }

  function handleStartNewCalculation() {
    summaryEnteredRef.current = false;
    setPendingExitTab(null);
    setEditingRecord(null);
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
    handleSwitchTab("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    summaryEnteredRef.current = false;
    setPendingExitTab(null);
    setEditingRecord(null);
    setFormValues(EMPTY_FORM_VALUES);
    setDiscountPercent(15);
    setHasCalculated(false);
    handleRemoveImage();
    showToast(
      isEn ? "Editing cancelled." : "ยกเลิกการแก้ไขรายการเดิมแล้ว",
      "success"
    );
  }

  async function handleSaveToCloud() {
    const supabase = createClient();
    if (!supabase || saving) return;

    const isEditing = editingRecord !== null;
    const safeProductName = sanitizePlainText(numericInputs.productName, 120);

    if (!safeProductName) {
      showToast(
        isEn
          ? "Please enter a product name before saving."
          : "กรุณาระบุชื่อสินค้าก่อนบันทึกข้อมูล",
        "error"
      );
      return;
    }

    if (isDuplicateProductName) {
      showToast(
        isEn
          ? "This product name already exists in Cloud. Please choose a unique name."
          : "ชื่อสินค้านี้มีอยู่ในคลาวด์แล้ว กรุณาตั้งชื่อใหม่ไม่ให้ซ้ำกัน",
        "error"
      );
      return;
    }

    if (!isEditing) {
      const activeCooldown = getStoredCooldownSeconds();
      if (activeCooldown > 0) {
        setSaveCooldownSeconds(activeCooldown);
        showToast(
          isEn
            ? `Please wait (${activeCooldown}s) before saving another record.`
            : `กรุณารอสักครู่ (${activeCooldown} วินาที) ก่อนบันทึกรายการใหม่`,
          "error"
        );
        return;
      }

      if (records.length >= MAX_CLOUD_RECORDS) {
        showToast(
          isEn
            ? `Cloud storage full (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} items). Delete older records before saving more.`
            : `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม`,
          "error"
        );
        return;
      }
    }

    setSaving(true);

    const safePlatform =
      sanitizePlainText(numericInputs.platform, 60) || "ขายตรง";

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
            isEn
              ? `Failed to upload product image: ${translateSupabaseError(uploadError, language)}`
              : `อัปโหลดรูปสินค้าไม่สำเร็จ: ${translateSupabaseError(uploadError, language)}`,
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
          showToast(translateSupabaseError(error, language), "error");
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
          summaryEnteredRef.current = false;
          setEditingRecord(null);
          setFormValues(EMPTY_FORM_VALUES);
          handleRemoveImage();
          setPendingExitTab("history");
          handleSwitchTab("history");
          window.scrollTo({ top: 0, behavior: "smooth" });
          showToast(
            isEn ? "Changes saved to Cloud." : "บันทึกการแก้ไขเรียบร้อยแล้ว",
            "success"
          );
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
          showToast(translateSupabaseError(error, language), "error");
        } else if (data) {
          const created = data as EcommerceCalculationRecord;
          setRecords((prev) =>
            prev.some((item) => item.id === created.id)
              ? prev
              : [created, ...prev]
          );

          try {
            window.localStorage.setItem(
              SAVE_COOLDOWN_STORAGE_KEY,
              String(Date.now() + SAVE_COOLDOWN_MS)
            );
          } catch {}
          setSaveCooldownSeconds(Math.ceil(SAVE_COOLDOWN_MS / 1000));

          summaryEnteredRef.current = false;
          setFormValues(EMPTY_FORM_VALUES);
          handleRemoveImage();
          setPendingExitTab("history");
          handleSwitchTab("history");
          window.scrollTo({ top: 0, behavior: "smooth" });
          showToast(
            isEn
              ? `Saved "${created.product_name}" to Cloud.`
              : `บันทึก "${created.product_name}" ลง Cloud เรียบร้อยแล้ว`,
            "success"
          );
        }
      }
    } catch (err) {
      showToast(translateSupabaseError(err, language), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDeleteSingle(
    record: EcommerceCalculationRecord
  ): Promise<boolean> {
    const supabase = createClient();
    if (!supabase || deleting) return false;

    setDeleting(true);

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
        showToast(translateSupabaseError(error, language), "error");
        return false;
      }

      if (storagePath) {
        await supabase.storage.from("product-images").remove([storagePath]);
      }

      setRecords((prev) => prev.filter((item) => item.id !== record.id));
      if (editingRecord?.id === record.id) {
        setEditingRecord(null);
      }
      showToast(
        isEn
          ? `Deleted "${record.product_name}".`
          : `ลบรายการ "${record.product_name}" เรียบร้อยแล้ว`,
        "success"
      );
      return true;
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmDeleteBulk(
    targetRecords: EcommerceCalculationRecord[]
  ): Promise<boolean> {
    const supabase = createClient();
    if (!supabase || deleting || targetRecords.length === 0) return false;

    setDeleting(true);

    try {
      const idsToDelete = targetRecords.map((item) => item.id);
      const idSet = new Set(idsToDelete);
      const storagePaths = targetRecords
        .map((item) =>
          extractProductImageStoragePath(item.product_image_url, userId)
        )
        .filter((path): path is string => Boolean(path));

      const { error } = await supabase
        .from("ecommerce_calculations")
        .delete()
        .in("id", idsToDelete)
        .eq("user_id", userId);

      if (error) {
        showToast(translateSupabaseError(error, language), "error");
        return false;
      }

      if (storagePaths.length > 0) {
        await supabase.storage.from("product-images").remove(storagePaths);
      }

      setRecords((prev) => prev.filter((item) => !idSet.has(item.id)));
      if (editingRecord && idSet.has(editingRecord.id)) {
        setEditingRecord(null);
      }
      showToast(
        isEn
          ? `Deleted ${idsToDelete.length} selected records.`
          : `ลบข้อมูลที่เลือกทั้งหมด ${idsToDelete.length} รายการเรียบร้อยแล้ว`,
        "success"
      );
      return true;
    } finally {
      setDeleting(false);
    }
  }

  function handleLoadRecord(record: EcommerceCalculationRecord) {
    summaryEnteredRef.current = false;
    setPendingExitTab(null);
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
    setHasCalculated(false);
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
    const csvContent = exportCalculationsToCsv(
      [],
      undefined,
      numericInputs,
      language
    );
    triggerCsvDownload(csvContent);
  }

  function handleExportCloudCsv(
    orderedRecords: EcommerceCalculationRecord[],
    selectedKeys: CsvExportColumnKey[]
  ) {
    if (selectedKeys.length === 0 || orderedRecords.length === 0) return;
    const csvContent = exportCalculationsToCsv(
      orderedRecords,
      selectedKeys,
      undefined,
      language
    );
    triggerCsvDownload(csvContent);
  }

  const activePreviewUrl = compressedImage?.previewUrl ?? existingImageUrl;

  return (
    <div className="relative z-0 flex-1 flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black light:bg-[#f8fafc]"
      >
        <div className="khumlab-dashboard-dots absolute inset-0" />
        <div
          className="animate-dashboard-glow-a absolute inset-x-0 top-0 h-[560px] light:opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(16, 185, 129, 0.22), rgba(16, 185, 129, 0.08) 45%, transparent 78%)",
          }}
        />
        <div className="animate-dashboard-glow-b absolute -top-24 left-[8%] h-[420px] w-[42vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-500/20 via-emerald-500/8 to-transparent light:from-emerald-500/[0.08] light:via-emerald-400/[0.03] blur-3xl" />
        <div className="animate-dashboard-glow-a absolute -top-28 right-[8%] h-[440px] w-[40vw] min-w-[280px] rounded-full bg-gradient-to-b from-emerald-400/18 via-emerald-500/8 to-transparent light:from-emerald-500/[0.07] light:via-emerald-400/[0.02] blur-3xl" />
        <FloatingBackgroundDocs />
      </div>

      <main
        className={`relative z-10 w-full max-w-[1440px] mx-auto flex-1 px-4 sm:px-8 lg:px-10 pt-10 sm:pt-12 space-y-8 ${
          activeTab === "history" ? "pb-28" : "pb-14"
        }`}
      >
        <div
          ref={topFormRef}
          className="scroll-mt-20 flex flex-col lg:flex-row lg:items-end justify-between gap-5"
        >
          {activeTab === "calculator" ? (
            <div className="space-y-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 light:text-emerald-700">
                KhumLab Profit Planner
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white light:text-slate-900">
                {isEn
                  ? "Step-by-Step Profit & Break-Even Planner"
                  : "คำนวณต้นทุนและกำไรสุทธิทีละขั้น"}
              </h1>
            </div>
          ) : activeTab === "summary" ? (
            <div className="space-y-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 light:text-emerald-700">
                KhumLab Analytics Report
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white light:text-slate-900">
                {isEn
                  ? "Profit Summary & Smart Pricing Analytics"
                  : "สรุปผลและวิเคราะห์กำไรเชิงลึก"}
              </h1>
            </div>
          ) : (
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white light:text-slate-900">
                  {isEn
                    ? `Cloud Storage (${records.length}/${MAX_CLOUD_RECORDS})`
                    : `คลาวด์เก็บข้อมูล (${records.length}/${MAX_CLOUD_RECORDS})`}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#050505] px-2.5 py-1 text-[11px] font-mono text-emerald-400 light:border-emerald-200 light:bg-white light:text-emerald-700 light:shadow-xs">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      realtimeConnected
                        ? "bg-emerald-400 light:bg-emerald-600 animate-pulse"
                        : "bg-amber-400 light:bg-amber-600"
                    }`}
                  />
                  <span>{realtimeConnected ? "Cloud Synced" : "Cloud Ready"}</span>
                </span>
              </div>
              <p className="text-sm text-zinc-400 light:text-slate-600 leading-relaxed">
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
              className="inline-flex shrink-0 self-start lg:self-auto items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 light:bg-emerald-600 light:text-white light:shadow-sm light:hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{isEn ? "New Calculation" : "คำนวณรายการใหม่"}</span>
            </button>
          ) : (
            <div
              aria-live="polite"
              className={`inline-flex shrink-0 self-start lg:self-auto items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm pointer-events-none select-none cursor-default whitespace-nowrap ${
                isCloudFull
                  ? "border-amber-500/40 bg-amber-500/10 font-semibold text-amber-300 light:border-amber-300 light:bg-amber-50 light:text-amber-800"
                  : "border-emerald-500/25 bg-emerald-500/[0.06] font-medium text-emerald-300/90 light:border-emerald-200 light:bg-emerald-50 light:text-emerald-800"
              }`}
            >
              {isCloudFull ? (
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 light:text-amber-600" />
              ) : (
                <Cloud className="h-4 w-4 shrink-0 text-emerald-400 light:text-emerald-600" />
              )}
              <span>
                {isCloudFull
                  ? isEn
                    ? `Cloud Storage Full (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS}) — Cannot save more`
                    : `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS}) — ไม่สามารถบันทึกเพิ่มได้`
                  : isEn
                    ? `Cloud Storage: ${records.length}/${MAX_CLOUD_RECORDS} items`
                    : `พื้นที่คลาวด์: ${records.length}/${MAX_CLOUD_RECORDS} รายการ`}
              </span>
            </div>
          )}
        </div>

        {activeTab === "calculator" ? (
          <CalculatorForm
            values={formValues}
            compressedImage={compressedImage}
            existingImageUrl={existingImageUrl}
            compressingImage={compressingImage}
            imageError={imageError}
            editingProductName={editingRecord?.product_name ?? null}
            isDuplicateProductName={isDuplicateProductName}
            onCancelEdit={handleCancelEdit}
            onChangeField={handleChangeField}
            onSelectPreset={handleSelectPreset}
            onSelectImageFile={handleSelectImageFile}
            onRemoveImage={handleRemoveImage}
            onCalculate={handleCalculate}
            onReset={handleReset}
          />
        ) : activeTab === "summary" ? (
          <CalculationReport
            inputs={numericInputs}
            metrics={metrics}
            simulation={simulation}
            analysis={analysis}
            discountPercent={discountPercent}
            previewImageUrl={activePreviewUrl}
            saving={saving}
            isCloudFull={isCloudFull}
            isEditing={Boolean(editingRecord)}
            saveCooldownSeconds={saveCooldownSeconds}
            onChangeDiscount={setDiscountPercent}
            onSaveToCloud={handleSaveToCloud}
            onExportCsv={handleExportReportCsv}
            onBackToCalculator={handleBackToCalculator}
          />
        ) : (
          <HistoryPanel
            records={records}
            loading={refreshing}
            deleting={deleting}
            onRefresh={fetchHistory}
            onExportCsv={handleExportCloudCsv}
            onLoadRecord={handleLoadRecord}
            onConfirmDeleteSingle={handleConfirmDeleteSingle}
            onConfirmDeleteBulk={handleConfirmDeleteBulk}
          />
        )}
      </main>

      <DashboardToast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
