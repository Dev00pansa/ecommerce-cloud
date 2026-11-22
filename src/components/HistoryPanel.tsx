"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Download,
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
} from "@/lib/calculator";
import type {
  CsvExportColumnKey,
  EcommerceCalculationRecord,
  HistorySortOrder,
} from "@/types";

interface HistoryPanelProps {
  records: EcommerceCalculationRecord[];
  loading: boolean;
  deletingId: string | null;
  onRefresh: () => void;
  onExportCsv: (
    orderedSelectedRecords: EcommerceCalculationRecord[],
    selectedKeys: CsvExportColumnKey[]
  ) => void;
  onLoadRecord: (record: EcommerceCalculationRecord) => void;
  onDeleteRecord: (record: EcommerceCalculationRecord) => void;
}

const SORT_OPTIONS: readonly { value: HistorySortOrder; label: string }[] = [
  { value: "date_desc", label: "วันที่บันทึก: ใหม่ล่าสุด → เก่าสุด" },
  { value: "date_asc", label: "วันที่บันทึก: เก่าสุด → ใหม่ล่าสุด" },
  { value: "profit_desc", label: "กำไรสุทธิ: มากที่สุด → น้อยที่สุด" },
  { value: "profit_asc", label: "กำไรสุทธิ: น้อยที่สุด → มากที่สุด" },
];

export function HistoryPanel({
  records,
  loading,
  deletingId,
  onRefresh,
  onExportCsv,
  onLoadRecord,
  onDeleteRecord,
}: HistoryPanelProps) {
  const sortDropdownRef = useRef<HTMLDivElement | null>(null);
  const [sortOrder, setSortOrder] = useState<HistorySortOrder>("date_desc");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedExportKeys, setSelectedExportKeys] = useState<
    CsvExportColumnKey[]
  >(DEFAULT_CSV_EXPORT_KEYS);
  const [excludedRecordIds, setExcludedRecordIds] = useState<string[]>([]);

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

  const excludedIdSet = useMemo(
    () => new Set(excludedRecordIds),
    [excludedRecordIds]
  );

  const selectedSortedRecords = useMemo(
    () =>
      enrichedSortedRecords
        .filter((entry) => !excludedIdSet.has(entry.item.id))
        .map((entry) => entry.item),
    [enrichedSortedRecords, excludedIdSet]
  );

  const isCloudFull = records.length >= MAX_CLOUD_RECORDS;
  const hasNoExportColumns = selectedExportKeys.length === 0;
  const hasNoSelectedRecords = selectedSortedRecords.length === 0;
  const isAllRecordsSelected =
    records.length > 0 && selectedSortedRecords.length === records.length;

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOrder)?.label ??
    SORT_OPTIONS[0].label;

  function toggleExportColumn(key: CsvExportColumnKey) {
    setSelectedExportKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleRecordSelection(recordId: string) {
    setExcludedRecordIds((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  }

  function handleToggleSelectAllRecords() {
    if (isAllRecordsSelected) {
      setExcludedRecordIds(records.map((r) => r.id));
    } else {
      setExcludedRecordIds([]);
    }
  }

  return (
    <>
      <section className="space-y-5">
        {isCloudFull && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-2xl border border-amber-500/45 bg-[#050505] px-4 py-3 text-xs sm:text-sm text-amber-300 shadow-[0_0_20px_-6px_rgba(245,158,11,0.25)]"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              พื้นที่คลาวด์เต็ม ({MAX_CLOUD_RECORDS}/{MAX_CLOUD_RECORDS} รายการ) กรุณาลบรายการเก่าออกก่อนบันทึกเพิ่ม
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
              className="inline-flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-[#050505] px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.18)] transition-all duration-200 hover:border-emerald-400/60 hover:text-white focus:outline-none"
            >
              <ArrowUpDown className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{currentSortLabel}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  sortDropdownOpen
                    ? "rotate-180 text-emerald-400"
                    : "text-zinc-500"
                }`}
              />
            </button>

            <div
              role="listbox"
              className={`absolute left-0 mt-2.5 w-72 origin-top-left z-30 overflow-hidden rounded-2xl bg-[#050505] border border-emerald-500/30 shadow-[0_14px_40px_rgba(0,0,0,0.9),0_0_24px_-6px_rgba(16,185,129,0.25)] transition-all duration-200 ease-out ${
                sortDropdownOpen
                  ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/75 to-transparent"
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
                          ? "bg-emerald-500/15 text-emerald-300 font-semibold"
                          : "text-zinc-300 hover:bg-emerald-500/10 hover:text-white"
                      }`}
                    >
                      <span>{option.label}</span>
                      {active && (
                        <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-[#050505] px-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>รีเฟรช</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#050505] border border-emerald-500/20 p-4 sm:p-5 shadow-[0_0_20px_-6px_rgba(16,185,129,0.14)] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-zinc-100">
                เลือกหัวข้อข้อมูลที่ต้องการส่งออกลงไฟล์
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-400">
                เลือกอยู่ {selectedExportKeys.length}/{CSV_EXPORT_COLUMNS.length} หัวข้อ
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedExportKeys(ALL_CSV_EXPORT_KEYS)}
                className="rounded-lg border border-zinc-800 bg-black px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
              >
                เลือกทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setSelectedExportKeys(DEFAULT_CSV_EXPORT_KEYS)}
                className="rounded-lg border border-zinc-800 bg-black px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
              >
                เฉพาะค่าสำคัญ
              </button>
              <button
                type="button"
                onClick={() => setSelectedExportKeys([])}
                className="rounded-lg border border-zinc-800 bg-black px-2.5 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:border-rose-500/50 hover:text-rose-300"
              >
                ล้างทั้งหมด
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CSV_EXPORT_COLUMNS.map((column) => {
              const checked = selectedExportKeys.includes(column.key);
              return (
                <button
                  key={column.key}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleExportColumn(column.key)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs select-none transition-all duration-150 focus:outline-none ${
                    checked
                      ? "border-emerald-500/45 bg-emerald-950/25 text-zinc-100"
                      : "border-zinc-800/90 bg-black/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      checked
                        ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                        : "border-zinc-700 bg-black text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  </span>
                  <span className="truncate">{column.label}</span>
                </button>
              );
            })}
          </div>

          {hasNoExportColumns && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>กรุณาติ๊กเลือกข้อมูลอย่างน้อย 1 หัวข้อก่อนส่งออกไฟล์</span>
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-[#050505]/90 p-5 sm:p-6 shadow-[0_0_24px_-8px_rgba(16,185,129,0.16)] space-y-4">
          {records.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/70">
              <button
                type="button"
                onClick={handleToggleSelectAllRecords}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isAllRecordsSelected
                    ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-300 hover:border-emerald-400"
                    : "border-zinc-800 bg-black text-zinc-300 hover:border-emerald-500/40 hover:text-white"
                }`}
              >
                <ListChecks className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  {isAllRecordsSelected ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
                </span>
              </button>

              <span className="font-mono text-xs text-zinc-400">
                เลือกรายการสำหรับดาวน์โหลด{" "}
                <strong className="text-emerald-400">
                  {selectedSortedRecords.length}/{records.length}
                </strong>{" "}
                รายการ
              </span>
            </div>
          )}

          {loading && records.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
              <p className="text-sm text-zinc-400">
                กำลังโหลดรายการที่บันทึกไว้บน Cloud...
              </p>
            </div>
          ) : enrichedSortedRecords.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <p className="text-base font-semibold text-zinc-200">
                ยังไม่มีรายการที่บันทึกไว้
              </p>
              <p className="text-xs sm:text-sm text-zinc-500">
                กดปุ่ม “+ คำนวณรายการใหม่” ด้านบน แล้วบันทึกข้อมูลลง Cloud เพื่อเก็บไว้ดูและส่งออกเป็นไฟล์ตารางภายหลัง
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {enrichedSortedRecords.map(({ item, metrics }) => {
                const isLoss = metrics.netProfitPerUnit < 0;
                const isSelected = !excludedIdSet.has(item.id);

                return (
                  <article
                    key={item.id}
                    className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-black/80 border transition-all duration-200 ${
                      isSelected
                        ? "border-emerald-500/35 shadow-[0_0_24px_-6px_rgba(16,185,129,0.2)] hover:border-emerald-400/60"
                        : "border-zinc-800/90 opacity-75 hover:opacity-100 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleRecordSelection(item.id)}
                        aria-pressed={isSelected}
                        aria-label={
                          isSelected
                            ? `ยกเลิกเลือก ${item.product_name}`
                            : `เลือก ${item.product_name} สำหรับดาวน์โหลด`
                        }
                        className={`h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center transition-all duration-200 focus:outline-none ${
                          isSelected
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            : "bg-black border-zinc-800 text-zinc-700 hover:border-zinc-600 hover:text-zinc-400"
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
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-500/25 bg-black">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1 select-none">
                          <ImageIcon className="h-5 w-5 text-zinc-500" />
                          <span className="text-[10px] font-medium tracking-tight text-zinc-500 leading-none">
                            ไม่มีรูปภาพ
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="font-medium text-emerald-400">
                            {item.platform} (GP {Number(item.platform_fee_percent)}%)
                          </span>
                          <span className="text-zinc-700">|</span>
                          <span>
                            ราคาขาย ฿{formatCurrency(Number(item.selling_price) || 0)}
                          </span>
                          <span className="text-zinc-700">|</span>
                          <span className="text-zinc-500">
                            {new Date(item.created_at).toLocaleString("th-TH")}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-semibold text-zinc-100 truncate">
                          {item.product_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono tabular-nums">
                          <span
                            className={`font-bold ${
                              isLoss ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            กำไรสุทธิ {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                            {formatCurrency(Math.abs(metrics.netProfitPerUnit))}/ชิ้น
                          </span>
                          <span className="text-zinc-500">
                            (Margin {formatCurrency(metrics.netMarginPercent, 1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                      <button
                        type="button"
                        onClick={() => onLoadRecord(item)}
                        className="rounded-xl border border-emerald-500/30 bg-[#050505] px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-400"
                      >
                        เปิดดู / แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(item)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-[#050505] px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 disabled:opacity-50"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        <span>{deletingId === item.id ? "กำลังลบ..." : "ลบ"}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
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
            className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(16,185,129,0.4)] transition-all duration-200 hover:bg-emerald-400 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:border disabled:border-zinc-800 disabled:bg-[#09090B] disabled:text-zinc-400 disabled:shadow-none"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>
              {hasNoExportColumns
                ? "เลือกอย่างน้อย 1 หัวข้อก่อนดาวน์โหลด"
                : hasNoSelectedRecords
                  ? "เลือกรายการสินค้าก่อนดาวน์โหลด"
                  : `ดาวน์โหลดตาราง (${selectedSortedRecords.length} รายการ)`}
            </span>
          </button>
        </div>
      )}
    </>
  );
}
