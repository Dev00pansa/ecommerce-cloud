"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Database,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  ListChecks,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  ALL_CSV_EXPORT_KEYS,
  CSV_EXPORT_COLUMNS,
  DEFAULT_CSV_EXPORT_KEYS,
  MAX_CLOUD_RECORDS,
  calculateEcommerceMetrics,
  formatCurrency,
  formatPlatformDisplayName,
} from "@/lib/calculator";
import { useAppLanguage } from "@/lib/language";
import type {
  CsvExportColumnKey,
  EcommerceCalculationRecord,
  HistorySortOrder,
} from "@/types";

interface HistoryPanelProps {
  records: EcommerceCalculationRecord[];
  loading: boolean;
  deleting: boolean;
  onRefresh: () => void;
  onExportCsv: (
    orderedSelectedRecords: EcommerceCalculationRecord[],
    selectedKeys: CsvExportColumnKey[]
  ) => void;
  onLoadRecord: (record: EcommerceCalculationRecord) => void;
  onConfirmDeleteSingle: (
    record: EcommerceCalculationRecord
  ) => Promise<boolean>;
  onConfirmDeleteBulk: (
    targetRecords: EcommerceCalculationRecord[]
  ) => Promise<boolean>;
}

type DeleteModalTarget =
  | { mode: "single"; record: EcommerceCalculationRecord }
  | { mode: "bulk"; records: EcommerceCalculationRecord[] };

const SORT_OPTIONS: readonly {
  value: HistorySortOrder;
  labelTh: string;
  labelEn: string;
}[] = [
  {
    value: "date_desc",
    labelTh: "วันที่บันทึก: ใหม่ล่าสุด → เก่าสุด",
    labelEn: "Date Saved: Newest → Oldest",
  },
  {
    value: "date_asc",
    labelTh: "วันที่บันทึก: เก่าสุด → ใหม่ล่าสุด",
    labelEn: "Date Saved: Oldest → Newest",
  },
  {
    value: "profit_desc",
    labelTh: "กำไรสุทธิ: มากที่สุด → น้อยที่สุด",
    labelEn: "Net Profit: Highest → Lowest",
  },
  {
    value: "profit_asc",
    labelTh: "กำไรสุทธิ: น้อยที่สุด → มากที่สุด",
    labelEn: "Net Profit: Lowest → Highest",
  },
];

export function HistoryPanel({
  records,
  loading,
  deleting,
  onRefresh,
  onExportCsv,
  onLoadRecord,
  onConfirmDeleteSingle,
  onConfirmDeleteBulk,
}: HistoryPanelProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const locale = isEn ? "en-US" : "th-TH";

  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const [sortOrder, setSortOrder] = useState<HistorySortOrder>("date_desc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedExportKeys, setSelectedExportKeys] = useState<
    CsvExportColumnKey[]
  >(DEFAULT_CSV_EXPORT_KEYS);
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DeleteModalTarget | null>(
    null
  );

  useEffect(() => {
    if (!sortDropdownOpen) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sortDropdownOpen]);

  useEffect(() => {
    if (!deleteTarget) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
        setDeleteTarget(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteTarget, deleting]);

  const enrichedSortedRecords = useMemo(() => {
    const withMetrics = records.map((item) => ({
      item,
      metrics: calculateEcommerceMetrics({
        productName: item.product_name,
        platform: item.platform,
        costPrice: Number(item.cost_price) || 0,
        packagingCost: Number(item.packaging_cost) || 0,
        adsCost: Number(item.ads_cost) || 0,
        platformFeePercent: Number(item.platform_fee_percent) || 0,
        sellingPrice: Number(item.selling_price) || 0,
        fixedCost: Number(item.fixed_cost) || 0,
      }),
      createdTime: new Date(item.created_at).getTime() || 0,
    }));

    withMetrics.sort((a, b) => {
      switch (sortOrder) {
        case "date_asc":
          return a.createdTime - b.createdTime;
        case "profit_desc":
          return b.metrics.netProfitPerUnit - a.metrics.netProfitPerUnit;
        case "profit_asc":
          return a.metrics.netProfitPerUnit - b.metrics.netProfitPerUnit;
        case "date_desc":
        default:
          return b.createdTime - a.createdTime;
      }
    });

    return withMetrics;
  }, [records, sortOrder]);

  const selectedIdSet = useMemo(
    () => new Set(selectedRecordIds),
    [selectedRecordIds]
  );

  const selectedSortedRecords = useMemo(
    () =>
      enrichedSortedRecords
        .filter((entry) => selectedIdSet.has(entry.item.id))
        .map((entry) => entry.item),
    [enrichedSortedRecords, selectedIdSet]
  );

  const selectedCount = selectedSortedRecords.length;
  const isCloudFull = records.length >= MAX_CLOUD_RECORDS;
  const hasNoExportColumns = selectedExportKeys.length === 0;
  const hasNoSelectedRecords = selectedCount === 0;
  const canBulkDelete = selectedCount > 2;
  const showBulkDeleteHint = selectedCount >= 1 && selectedCount <= 2;
  const isAllRecordsSelected =
    records.length > 0 && selectedCount === records.length;

  const activeSortOption =
    SORT_OPTIONS.find((opt) => opt.value === sortOrder) ?? SORT_OPTIONS[0];
  const currentSortLabel = isEn
    ? activeSortOption.labelEn
    : activeSortOption.labelTh;

  function toggleExportColumn(key: CsvExportColumnKey) {
    setSelectedExportKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleRecordSelection(recordId: string) {
    setSelectedRecordIds((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  }

  function handleToggleSelectAllRecords() {
    if (isAllRecordsSelected) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(records.map((r) => r.id));
    }
  }

  function handleRefreshClick() {
    setSelectedRecordIds([]);
    onRefresh();
  }

  async function handleConfirmModalDelete() {
    if (!deleteTarget || deleting) return;

    if (deleteTarget.mode === "single") {
      const targetId = deleteTarget.record.id;
      const ok = await onConfirmDeleteSingle(deleteTarget.record);
      if (ok) {
        setSelectedRecordIds((prev) => prev.filter((id) => id !== targetId));
        setDeleteTarget(null);
      }
      return;
    }

    const deletedIds = new Set(deleteTarget.records.map((item) => item.id));
    const ok = await onConfirmDeleteBulk(deleteTarget.records);
    if (ok) {
      setSelectedRecordIds((prev) => prev.filter((id) => !deletedIds.has(id)));
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <section className="space-y-6">
        {isCloudFull && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-2xl border border-amber-500/45 bg-[#060807]/90 backdrop-blur-md px-4 py-3 text-xs sm:text-sm text-amber-300 shadow-[0_0_20px_-6px_rgba(245,158,11,0.25)] light:border-amber-300 light:bg-amber-50 light:text-amber-800 light:shadow-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 light:text-amber-600" />
            <span>
              {isEn
                ? `Cloud storage is full (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} items). Delete older records before saving more.`
                : `พื้นที่คลาวด์เต็ม (${MAX_CLOUD_RECORDS}/${MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม`}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div ref={sortDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              aria-expanded={sortDropdownOpen}
              aria-haspopup="listbox"
              className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-[#060807]/85 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.18)] transition-all duration-200 hover:border-emerald-400/60 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:shadow-xs light:hover:border-emerald-600 light:hover:text-slate-900 focus:outline-none"
            >
              <ArrowUpDown className="h-4 w-4 shrink-0 text-emerald-400 light:text-emerald-600" />
              <span>{currentSortLabel}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  sortDropdownOpen
                    ? "rotate-180 text-emerald-400 light:text-emerald-600"
                    : "text-zinc-500 light:text-slate-400"
                }`}
              />
            </button>

            <div
              role="listbox"
              className={`absolute left-0 mt-2.5 w-72 origin-top-left z-30 overflow-hidden rounded-2xl bg-[#050505] border border-emerald-500/30 shadow-[0_14px_40px_rgba(0,0,0,0.9),0_0_24px_-6px_rgba(16,185,129,0.25)] light:bg-white light:border-slate-200 light:shadow-[0_14px_36px_rgba(15,23,42,0.12)] transition-all duration-200 ease-out ${
                sortDropdownOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 light:via-emerald-500/40 to-transparent"
              />
              <div className="p-1.5 space-y-0.5">
                {SORT_OPTIONS.map((option) => {
                  const active = option.value === sortOrder;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSortOrder(option.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-xs sm:text-sm transition-colors ${
                        active
                          ? "bg-emerald-500/15 text-emerald-300 font-semibold light:bg-emerald-50 light:text-emerald-700"
                          : "text-zinc-300 hover:bg-emerald-500/10 hover:text-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900"
                      }`}
                    >
                      <span>{isEn ? option.labelEn : option.labelTh}</span>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-400 light:text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshClick}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-[#060807]/85 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:shadow-xs light:hover:border-emerald-600 light:hover:text-emerald-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>{isEn ? "Refresh" : "รีเฟรช"}</span>
          </button>
        </div>

        <div
          aria-disabled={hasNoSelectedRecords}
          className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
            hasNoSelectedRecords
              ? "bg-[#0d0d0f] border-zinc-800 pointer-events-none select-none shadow-none light:bg-slate-200/90 light:border-slate-300"
              : "bg-[#060807]/85 backdrop-blur-md border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-emerald-600/20 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]"
          }`}
        >
          <div
            className={`px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b ${
              hasNoSelectedRecords
                ? "bg-[#121215] border-zinc-800 light:bg-slate-200 light:border-slate-300"
                : "bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-emerald-500/15 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${
                  hasNoSelectedRecords
                    ? "bg-[#19191e] border-zinc-800 text-zinc-500 light:bg-slate-300/70 light:border-slate-300 light:text-slate-500"
                    : "bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border-emerald-400/35 text-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none"
                }`}
              >
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className={`text-sm sm:text-base font-bold ${
                      hasNoSelectedRecords
                        ? "text-zinc-500 light:text-slate-500"
                        : "text-white light:text-slate-900"
                    }`}
                  >
                    {isEn
                      ? "Select Columns for CSV Export"
                      : "เลือกหัวข้อข้อมูลที่ต้องการส่งออกลงไฟล์"}
                  </h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium ${
                      hasNoSelectedRecords
                        ? "border-zinc-800 bg-[#18181c] text-zinc-500 light:border-slate-300 light:bg-slate-100 light:text-slate-500"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 light:border-emerald-300 light:bg-emerald-100 light:text-emerald-800"
                    }`}
                  >
                    {isEn
                      ? `${selectedExportKeys.length}/${CSV_EXPORT_COLUMNS.length} selected`
                      : `เลือกอยู่ ${selectedExportKeys.length}/${CSV_EXPORT_COLUMNS.length} หัวข้อ`}
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    hasNoSelectedRecords
                      ? "text-zinc-600 light:text-slate-500"
                      : "text-zinc-400 light:text-slate-600"
                  }`}
                >
                  {hasNoSelectedRecords
                    ? isEn
                      ? "Select at least one product below to customize CSV export columns."
                      : "กรุณาเลือกรายการสินค้าด้านล่างก่อน เพื่อเปิดใช้งานการเลือกคอลัมน์ส่งออก"
                    : isEn
                      ? "Customize which data columns appear in your Excel / Google Sheets file."
                      : "กำหนดคอลัมน์ข้อมูลที่ต้องการนำไปเปิดใช้งานต่อใน Excel หรือ Google Sheets"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={hasNoSelectedRecords}
                onClick={() => setSelectedExportKeys(ALL_CSV_EXPORT_KEYS)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  hasNoSelectedRecords
                    ? "border-zinc-800 bg-[#18181c] text-zinc-600 light:border-slate-300 light:bg-slate-100 light:text-slate-400"
                    : "border-zinc-800 bg-black/80 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-300 light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:text-emerald-700"
                }`}
              >
                {isEn ? "Select All" : "เลือกทั้งหมด"}
              </button>
              <button
                type="button"
                disabled={hasNoSelectedRecords}
                onClick={() => setSelectedExportKeys(DEFAULT_CSV_EXPORT_KEYS)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  hasNoSelectedRecords
                    ? "border-zinc-800 bg-[#18181c] text-zinc-600 light:border-slate-300 light:bg-slate-100 light:text-slate-400"
                    : "border-zinc-800 bg-black/80 text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-300 light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:text-emerald-700"
                }`}
              >
                {isEn ? "Essentials Only" : "เฉพาะค่าสำคัญ"}
              </button>
              <button
                type="button"
                disabled={hasNoSelectedRecords}
                onClick={() => setSelectedExportKeys([])}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  hasNoSelectedRecords
                    ? "border-zinc-800 bg-[#18181c] text-zinc-600 light:border-slate-300 light:bg-slate-100 light:text-slate-400"
                    : "border-zinc-800 bg-black/80 text-zinc-400 hover:border-rose-500/50 hover:text-rose-300 light:border-slate-300 light:bg-white light:text-slate-600 light:hover:border-rose-400 light:hover:text-rose-600"
                }`}
              >
                {isEn ? "Clear All" : "ล้างทั้งหมด"}
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CSV_EXPORT_COLUMNS.map((column) => {
                const checked = selectedExportKeys.includes(column.key);
                return (
                  <button
                    key={column.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={hasNoSelectedRecords}
                    onClick={() => toggleExportColumn(column.key)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs select-none transition-all duration-150 focus:outline-none ${
                      hasNoSelectedRecords
                        ? "border-zinc-800/90 bg-[#141417] text-zinc-500 light:border-slate-300 light:bg-slate-100 light:text-slate-500"
                        : checked
                          ? "border-emerald-500/45 bg-emerald-950/30 text-zinc-100 light:border-emerald-500/50 light:bg-emerald-50 light:text-emerald-950 light:font-medium"
                          : "border-zinc-800/90 bg-black/75 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 light:border-slate-200 light:bg-slate-50 light:text-slate-600 light:hover:border-slate-300 light:hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                        hasNoSelectedRecords
                          ? checked
                            ? "border-zinc-700 bg-[#1c1c21] text-zinc-500 light:border-slate-300 light:bg-slate-200 light:text-slate-500"
                            : "border-zinc-800 bg-[#0d0d0f] text-transparent light:border-slate-300 light:bg-slate-200/70"
                          : checked
                            ? "border-emerald-400 bg-emerald-500/20 text-emerald-400 light:border-emerald-600 light:bg-emerald-600 light:text-white"
                            : "border-zinc-700 bg-black text-transparent light:border-slate-300 light:bg-white"
                      }`}
                    >
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </span>
                    <span className="truncate">
                      {isEn ? column.labelEn : column.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {!hasNoSelectedRecords && hasNoExportColumns && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-amber-400 light:text-amber-700">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isEn
                    ? "Please select at least 1 column before exporting."
                    : "กรุณาติ๊กเลือกข้อมูลอย่างน้อย 1 หัวข้อก่อนส่งออกไฟล์"}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-[#060807]/85 backdrop-blur-md border border-emerald-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.75)] light:bg-white light:border-slate-200 light:shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-emerald-950/60 via-[#0a100e] to-[#070908] border-b border-emerald-500/15 px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 light:from-emerald-50 light:via-teal-50/70 light:to-slate-50 light:border-emerald-200/80">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border border-emerald-400/35 text-emerald-400 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.2)] light:from-emerald-100 light:to-emerald-50 light:border-emerald-300 light:text-emerald-700 light:shadow-none">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-white light:text-slate-900">
                  {isEn ? "Saved Pricing Plans" : "รายการคำนวณที่บันทึกไว้บนคลาวด์"}
                </h2>
                <p className="text-xs text-zinc-400 light:text-slate-600 mt-0.5">
                  {isEn
                    ? "Check items to export as CSV or delete in bulk, or click View / Edit to revise."
                    : "ติ๊กเลือกรายการเพื่อส่งออกไฟล์ตารางหรือลบพร้อมกัน หรือกดเปิดดูเพื่อแก้ไขตัวเลข"}
                </p>
              </div>
            </div>

            {records.length > 0 && (
              <span className="rounded-full border border-emerald-500/25 bg-black/60 px-3 py-1 font-mono text-xs text-zinc-300 light:border-emerald-200 light:bg-white light:text-slate-600">
                {isEn ? "Selected " : "เลือกสำหรับดาวน์โหลด "}
                <strong className="text-emerald-400 light:text-emerald-700">
                  {selectedCount}/{records.length}
                </strong>
                {isEn ? " items" : " รายการ"}
              </span>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {records.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/70 light:border-slate-200">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllRecords}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isAllRecordsSelected
                        ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-300 hover:border-emerald-400 light:border-emerald-500 light:bg-emerald-50 light:text-emerald-700"
                        : "border-zinc-800 bg-black/80 text-zinc-300 hover:border-emerald-500/40 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:hover:border-emerald-600 light:hover:text-emerald-700"
                    }`}
                  >
                    <ListChecks className="h-4 w-4 text-emerald-400 light:text-emerald-600 shrink-0" />
                    <span>
                      {isAllRecordsSelected
                        ? isEn
                          ? "Deselect All"
                          : "ยกเลิกเลือกทั้งหมด"
                        : isEn
                          ? "Select All"
                          : "เลือกทั้งหมด"}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!canBulkDelete || deleting}
                    onClick={() =>
                      setDeleteTarget({
                        mode: "bulk",
                        records: selectedSortedRecords,
                      })
                    }
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      canBulkDelete
                        ? "bg-red-500/15 hover:bg-red-500/25 border-red-500/40 text-red-400 shadow-[0_0_16px_-6px_rgba(239,68,68,0.35)] light:bg-rose-50 light:hover:bg-rose-100 light:border-rose-300 light:text-rose-700 light:shadow-none"
                        : "bg-zinc-900/70 border-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed light:bg-slate-100 light:border-slate-200 light:text-slate-400"
                    }`}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    <span>
                      {isEn
                        ? `Delete Selected (${selectedCount})`
                        : `ลบรายการที่เลือก (${selectedCount})`}
                    </span>
                  </button>

                  {showBulkDeleteHint && (
                    <span className="text-xs text-zinc-500 light:text-slate-500">
                      {isEn
                        ? "(Select more than 2 items to bulk delete)"
                        : "(เลือกมากกว่า 2 รายการเพื่อลบพร้อมกัน)"}
                    </span>
                  )}
                </div>
              </div>
            )}

            {loading && records.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400 light:text-emerald-600" />
                <p className="text-sm text-zinc-400 light:text-slate-600">
                  {isEn
                    ? "Loading your saved Cloud records..."
                    : "กำลังโหลดรายการที่บันทึกไว้บน Cloud..."}
                </p>
              </div>
            ) : enrichedSortedRecords.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <p className="text-base font-semibold text-zinc-200 light:text-slate-800">
                  {isEn ? "No Saved Records Yet" : "ยังไม่มีรายการที่บันทึกไว้"}
                </p>
                <p className="text-xs sm:text-sm text-zinc-500 light:text-slate-500">
                  {isEn
                    ? 'Click "+ New Calculation" above to analyze a product and save it to Cloud for editing or CSV export.'
                    : "กดปุ่ม “+ คำนวณรายการใหม่” ด้านบน แล้วบันทึกข้อมูลลง Cloud เพื่อเก็บไว้ดูและส่งออกเป็นไฟล์ตารางภายหลัง"}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {enrichedSortedRecords.map(({ item, metrics }) => {
                  const isLoss = metrics.netProfitPerUnit < 0;
                  const isSelected = selectedIdSet.has(item.id);
                  const displayPlatform = formatPlatformDisplayName(
                    item.platform,
                    language
                  );

                  return (
                    <article
                      key={item.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-black/70 border transition-all duration-200 ${
                        isSelected
                          ? "border-emerald-500/45 shadow-[0_0_24px_-6px_rgba(16,185,129,0.22)] hover:border-emerald-400/70 light:bg-emerald-50/55 light:border-emerald-500/60 light:shadow-xs"
                          : "border-zinc-800/90 hover:border-emerald-500/30 light:bg-slate-50/75 light:border-slate-200 light:hover:border-emerald-400"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleRecordSelection(item.id)}
                          aria-pressed={isSelected}
                          aria-label={
                            isSelected
                              ? isEn
                                ? `Deselect ${item.product_name}`
                                : `ยกเลิกเลือก ${item.product_name}`
                              : isEn
                                ? `Select ${item.product_name} for export`
                                : `เลือก ${item.product_name} สำหรับดาวน์โหลด`
                          }
                          className={`h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-200 focus:outline-none ${
                            isSelected
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] light:bg-emerald-600 light:border-emerald-600 light:text-white light:shadow-none"
                              : "bg-black border-zinc-800 text-zinc-700 hover:border-zinc-600 hover:text-zinc-400 light:bg-white light:border-slate-300 light:text-slate-300 light:hover:border-emerald-500 light:hover:text-emerald-600"
                          }`}
                        >
                          <Check
                            className={`h-4 w-4 transition-transform duration-150 ${
                              isSelected
                                ? "scale-100 opacity-100"
                                : "scale-75 opacity-35"
                            }`}
                          />
                        </button>

                        {item.product_image_url ? (
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-500/25 bg-black light:border-slate-200 light:bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 select-none light:bg-slate-100 light:border-slate-200">
                            <ImageIcon className="h-5 w-5 text-zinc-500 light:text-slate-400" />
                            <span className="text-[10px] font-medium tracking-tight text-zinc-500 light:text-slate-500 leading-none">
                              {isEn ? "No Image" : "ไม่มีรูปภาพ"}
                            </span>
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 light:text-slate-500">
                            <span className="font-medium text-purple-400 light:text-purple-700">
                              {displayPlatform} (GP{" "}
                              {Number(item.platform_fee_percent)}%)
                            </span>
                            <span className="text-zinc-700 light:text-slate-300">
                              |
                            </span>
                            <span className="text-cyan-400/90 light:text-cyan-700 font-medium">
                              {isEn ? "Price" : "ราคาขาย"} ฿
                              {formatCurrency(Number(item.selling_price) || 0)}
                            </span>
                            <span className="text-zinc-700 light:text-slate-300">
                              |
                            </span>
                            <span className="text-zinc-500 light:text-slate-500">
                              {new Date(item.created_at).toLocaleString(locale)}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-semibold text-zinc-100 light:text-slate-900 truncate">
                            {item.product_name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono tabular-nums">
                            <span
                              className={`font-bold ${
                                isLoss
                                  ? "text-rose-400 light:text-rose-600"
                                  : "text-emerald-400 light:text-emerald-700"
                              }`}
                            >
                              {isEn ? "Net Profit" : "กำไรสุทธิ"}{" "}
                              {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                              {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                              {isEn ? "/unit" : "/ชิ้น"}
                            </span>
                            <span className="text-zinc-500 light:text-slate-500">
                              (Margin {formatCurrency(metrics.netMarginPercent, 1)}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                        <button
                          type="button"
                          onClick={() => onLoadRecord(item)}
                          className="rounded-xl border border-emerald-500/30 bg-[#050505] px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-400 light:border-slate-300 light:bg-white light:text-slate-800 light:hover:border-emerald-600 light:hover:bg-emerald-50 light:hover:text-emerald-700"
                        >
                          {isEn ? "View / Edit" : "เปิดดู / แก้ไข"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ mode: "single", record: item })
                          }
                          disabled={deleting}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 light:border-slate-300 light:bg-white light:text-rose-600 light:hover:border-rose-400 light:hover:bg-rose-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{isEn ? "Delete" : "ลบ"}</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {records.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() =>
              onExportCsv(selectedSortedRecords, selectedExportKeys)
            }
            disabled={hasNoExportColumns || hasNoSelectedRecords}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(16,185,129,0.4)] transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 light:bg-emerald-600 light:text-white light:hover:bg-emerald-700 light:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:border disabled:border-zinc-800 disabled:bg-[#09090B] disabled:text-zinc-400 disabled:shadow-none light:disabled:border-slate-300 light:disabled:bg-slate-200 light:disabled:text-slate-500"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>
              {hasNoExportColumns
                ? isEn
                  ? "Select at least 1 column to export"
                  : "เลือกอย่างน้อย 1 หัวข้อก่อนดาวน์โหลด"
                : hasNoSelectedRecords
                  ? isEn
                    ? "Select products before downloading"
                    : "เลือกรายการสินค้าก่อนดาวน์โหลด"
                  : isEn
                    ? `Download CSV (${selectedCount} ${selectedCount === 1 ? "item" : "items"})`
                    : `ดาวน์โหลดตาราง (${selectedCount} รายการ)`}
            </span>
          </button>
        </div>
      )}

      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 light:bg-slate-900/45 backdrop-blur-md p-4"
        >
          <div className="animate-enter relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/25 bg-[#070707] p-6 sm:p-7 text-zinc-100 shadow-[0_24px_60px_rgba(0,0,0,0.95),0_0_30px_-8px_rgba(239,68,68,0.2)] light:border-slate-200 light:bg-white light:text-slate-900 light:shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/60 to-transparent"
            />

            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-red-400 light:border-rose-200 light:bg-rose-50 light:text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <h2
                id="delete-confirm-modal-title"
                className="text-lg font-semibold tracking-tight text-white light:text-slate-900"
              >
                {deleteTarget.mode === "bulk"
                  ? isEn
                    ? "Delete all selected records?"
                    : "ยืนยันการลบข้อมูลที่เลือกทั้งหมด?"
                  : isEn
                    ? "Delete this record?"
                    : "ยืนยันการลบรายการนี้?"}
              </h2>
            </div>

            <div className="mt-5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-sm font-medium text-zinc-100 light:border-rose-200 light:bg-rose-50 light:text-slate-900">
              {deleteTarget.mode === "bulk" ? (
                <span>
                  {isEn ? "All " : "รายการที่เลือกทั้งหมด "}
                  <strong className="font-mono text-red-300 light:text-rose-700">
                    {deleteTarget.records.length}
                  </strong>
                  {isEn
                    ? " selected items (including attached product images)"
                    : " รายการ (รวมรูปภาพสินค้าที่แนบไว้)"}
                </span>
              ) : (
                <span className="block truncate">
                  {deleteTarget.record.product_name}
                </span>
              )}
            </div>

            <p className="mt-3.5 text-xs text-zinc-400 light:text-slate-600 leading-relaxed">
              {isEn
                ? "These records and any attached product images will be permanently removed from Cloud storage and cannot be recovered."
                : "ข้อมูลและรูปภาพที่แนบไว้จะถูกลบออกจากคลาวด์อย่างถาวร และไม่สามารถกู้คืนได้ในภายหลัง"}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white light:border-slate-300 light:bg-white light:text-slate-700 light:hover:bg-slate-100 light:hover:text-slate-900 disabled:opacity-50"
              >
                {isEn ? "Cancel" : "ยกเลิก"}
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmModalDelete()}
                disabled={deleting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all hover:bg-red-600 light:bg-rose-600 light:hover:bg-rose-700 light:shadow-sm disabled:opacity-60"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {deleting
                    ? isEn
                      ? "Deleting..."
                      : "กำลังลบ..."
                    : isEn
                      ? "Confirm Delete"
                      : "ยืนยันการลบ"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
