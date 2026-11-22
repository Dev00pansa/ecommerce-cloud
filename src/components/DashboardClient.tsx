"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, CheckCircle2, History, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateSupabaseError } from "@/lib/auth";
import {
  buildCsvExportContent,
  calculateEcommerceMetrics,
  parseSafeNonNegativeNumber,
  simulatePromoDiscount,
} from "@/lib/calculator";
import type {
  CalculatorFormStrings,
  CalculatorInputValues,
  EcommerceCalculationRecord,
  PlatformPreset,
} from "@/types";
import { useTheme } from "@/components/ThemeProvider";
import { CalculatorForm } from "@/components/CalculatorForm";
import { KpiCards } from "@/components/KpiCards";
import { PromoSimulator } from "@/components/PromoSimulator";
import { PriceBreakdownChart } from "@/components/PriceBreakdownChart";
import { HistoryPanel } from "@/components/HistoryPanel";

interface DashboardClientProps {
  userId: string;
  username: string;
  email: string;
  initialRecords: EcommerceCalculationRecord[];
}

type DashboardTab = "calculator" | "history";

const DEFAULT_FORM_VALUES: CalculatorFormStrings = {
  productName: "เสื้อยืด Oversize คอตตอนพรีเมียม",
  platform: "Shopee",
  costPrice: "120",
  packagingCost: "15",
  adsCost: "35",
  platformFeePercent: "13",
  sellingPrice: "290",
  fixedCost: "15000",
};

/**
 * หน้า Dashboard หลัก (/dashboard) รวมเครื่องมือคำนวณราคาและประวัติการบันทึกบน Cloud
 */
export function DashboardClient({
  userId,
  username,
  email,
  initialRecords,
}: DashboardClientProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<DashboardTab>("calculator");

  const [formValues, setFormValues] =
    useState<CalculatorFormStrings>(DEFAULT_FORM_VALUES);
  const [discountPercent, setDiscountPercent] = useState<number>(15);

  const [records, setRecords] =
    useState<EcommerceCalculationRecord[]>(initialRecords);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);

  // แปลงค่าข้อความในฟอร์มเป็นตัวเลขปลอดภัยก่อนเข้าสูตร Pure Functions
  const numericInputs: CalculatorInputValues = useMemo(
    () => ({
      productName: formValues.productName,
      platform: formValues.platform,
      costPrice: parseSafeNonNegativeNumber(formValues.costPrice),
      packagingCost: parseSafeNonNegativeNumber(formValues.packagingCost),
      adsCost: parseSafeNonNegativeNumber(formValues.adsCost),
      platformFeePercent: parseSafeNonNegativeNumber(
        formValues.platformFeePercent,
        100
      ),
      sellingPrice: parseSafeNonNegativeNumber(formValues.sellingPrice),
      fixedCost: parseSafeNonNegativeNumber(formValues.fixedCost),
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
      .select(
        "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, created_at"
      )
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

  function handleReset() {
    setFormValues(DEFAULT_FORM_VALUES);
    setDiscountPercent(15);
    setDbError(null);
    setDbSuccess(null);
  }

  async function handleSaveToCloud() {
    const supabase = createClient();
    if (!supabase || saving) return;

    setDbError(null);
    setDbSuccess(null);
    setSaving(true);

    const trimmedName =
      numericInputs.productName.trim() || "สินค้าไม่ระบุชื่อ";

    const { data, error } = await supabase
      .from("ecommerce_calculations")
      .insert({
        user_id: userId,
        product_name: trimmedName,
        platform: numericInputs.platform.trim() || "ทั่วไป",
        cost_price: numericInputs.costPrice,
        packaging_cost: numericInputs.packagingCost,
        ads_cost: numericInputs.adsCost,
        platform_fee_percent: numericInputs.platformFeePercent,
        selling_price: numericInputs.sellingPrice,
        fixed_cost: numericInputs.fixedCost,
      })
      .select(
        "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, created_at"
      )
      .single();

    if (error) {
      setDbError(translateSupabaseError(error));
    } else if (data) {
      const created = data as EcommerceCalculationRecord;
      setRecords((prev) =>
        prev.some((item) => item.id === created.id) ? prev : [created, ...prev]
      );
      setDbSuccess(`บันทึก "${created.product_name}" ลง Cloud เรียบร้อยแล้ว`);
    }

    setSaving(false);
  }

  async function handleDeleteRecord(id: string) {
    const supabase = createClient();
    if (!supabase || deletingId) return;

    setDeletingId(id);
    setDbError(null);
    setDbSuccess(null);

    const { error } = await supabase
      .from("ecommerce_calculations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      setDbError(translateSupabaseError(error));
    } else {
      setRecords((prev) => prev.filter((item) => item.id !== id));
    }

    setDeletingId(null);
  }

  function handleLoadRecord(record: EcommerceCalculationRecord) {
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
    setActiveTab("calculator");
    setDbSuccess(`โหลดข้อมูล "${record.product_name}" กลับมาคำนวณต่อแล้ว`);
  }

  function handleExportCsv() {
    const csvContent = buildCsvExportContent(records, numericInputs);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecom-marginlab-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";

  return (
    <main className="w-full max-w-[1440px] mx-auto flex-1 px-6 py-6 md:px-12 lg:px-16 sm:py-8 space-y-6">
      {/* หัวข้อ Dashboard + แท็บสลับ คำนวณราคา / ประวัติที่บันทึกไว้ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            E-Commerce Profit & Break-Even Workspace
          </h1>
          <p className={`text-xs sm:text-sm ${mutedText}`}>
            ผู้ใช้งาน: <span className="font-mono text-emerald-500">@{username}</span> ({email})
          </p>
        </div>

        <div
          className={`inline-flex self-start rounded-lg border p-1 ${
            isDark
              ? "border-zinc-800 bg-[#050505]"
              : "border-slate-200 bg-white"
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "calculator"
                ? "bg-emerald-500 text-slate-950"
                : mutedText
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>คำนวณราคา</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-emerald-500 text-slate-950"
                : mutedText
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>ประวัติที่บันทึกไว้ ({records.length})</span>
          </button>
        </div>
      </div>

      {dbError && (
        <div
          role="alert"
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs sm:text-sm ${
            isDark
              ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{dbError}</span>
        </div>
      )}

      {dbSuccess && (
        <div
          role="status"
          className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-xs sm:text-sm ${
            isDark
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-emerald-300 bg-emerald-50 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
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
        /* items-start ช่วยให้ฟอร์มฝั่งซ้ายกระชับตามความสูงจริง ไม่มีช่องว่างโล่งด้านล่าง */
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <CalculatorForm
              values={formValues}
              onChangeField={handleChangeField}
              onSelectPreset={handleSelectPreset}
              onReset={handleReset}
              onSaveToCloud={handleSaveToCloud}
              onExportCsv={handleExportCsv}
              saving={saving}
            />
          </div>

          <div className="lg:col-span-7 space-y-5">
            <KpiCards
              metrics={metrics}
              sellingPrice={numericInputs.sellingPrice}
              platformFeePercent={numericInputs.platformFeePercent}
              fixedCost={numericInputs.fixedCost}
            />

            <PromoSimulator
              discountPercent={discountPercent}
              onChangeDiscount={setDiscountPercent}
              simulation={simulation}
            />

            <PriceBreakdownChart
              costPrice={numericInputs.costPrice}
              sellingPrice={numericInputs.sellingPrice}
              metrics={metrics}
            />
          </div>
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
