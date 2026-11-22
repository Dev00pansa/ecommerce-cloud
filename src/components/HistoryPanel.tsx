"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Download,
  Image as ImageIcon,
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
  realtimeConnected: boolean;
  onRefresh: () => void;
  onExportCsv: (
    orderedRecords: EcommerceCalculationRecord[],
    selectedKeys: CsvExportColumnKey[]
  ) => void;
  onLoadRecord: (record: EcommerceCalculationRecord) => void;
  onDeleteRecord: (record: EcommerceCalculationRecord) => void;
}

const SURFACE_CARD_CLASS =
  "rounded-2xl bg-[#050505] border border-emerald-500/25 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_0_25px_-4px_rgba(16,185,129,0.3)]";

export function HistoryPanel({
  records,
  loading,
  deletingId,
  realtimeConnected,
  onRefresh,
  onExportCsv,
  onLoadRecord,
  onDeleteRecord,
}: HistoryPanelProps) {
  const [sortOrder, setSortOrder] = useState<HistorySortOrder>("date_desc");
  const [selectedExportKeys, setSelectedExportKeys] = useState<
    CsvExportColumnKey[]
  >(DEFAULT_CSV_EXPORT_KEYS);

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

  const isCloudFull = records.length >= MAX_CLOUD_RECORDS;
  const hasNoExportSelection = selectedExportKeys.length === 0;

  function toggleExportColumn(key: CsvExportColumnKey) {
    setSelectedExportKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <section className="border-t border-zinc-800/80 pt-8 space-y-5">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            คลาวด์เก็บข้อมูล ({records.length}/{MAX_CLOUD_RECORDS})
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-[#050505] px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
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
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          บันทึกแผนคำนวณได้สูงสุด {MAX_CLOUD_RECORDS} รายการ กดเปิดดูเพื่อแก้ไข หรือดาวน์โหลดข้อมูลทั้งหมดรวมเป็นไฟล์ตารางเดียว (เปิดใน Excel / Google Sheets ได้ทันที)
        </p>
      </div>

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

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() =>
            onExportCsv(
              enrichedSortedRecords.map((entry) => entry.item),
              selectedExportKeys
            )
          }
          disabled={hasNoExportSelection || records.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-[#050505] px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.22)] transition-all duration-200 hover:border-emerald-400 hover:text-white hover:shadow-[0_0_25px_-4px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Download className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>ส่งออกทั้งหมดในไฟล์เดียว</span>
        </button>

        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <ArrowUpDown
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-400"
          />
          <select
            aria-label="จัดเรียงลำดับรายการ"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as HistorySortOrder)}
            className="w-full appearance-none rounded-xl border border-emerald-500/25 bg-[#050505] pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 focus:border-emerald-400 focus:outline-none cursor-pointer"
          >
            <option value="date_desc" className="bg-[#050505] text-zinc-100">
              วันที่บันทึก: ใหม่ล่าสุด → เก่าสุด
            </option>
            <option value="date_asc" className="bg-[#050505] text-zinc-100">
              วันที่บันทึก: เก่าสุด → ใหม่ล่าสุด
            </option>
            <option value="profit_desc" className="bg-[#050505] text-zinc-100">
              กำไรสุทธิ: มากที่สุด → น้อยที่สุด
            </option>
            <option value="profit_asc" className="bg-[#050505] text-zinc-100">
              กำไรสุทธิ: น้อยที่สุด → มากที่สุด
            </option>
          </select>
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

      <div className="rounded-2xl bg-[#050505] border border-emerald-500/20 p-4 shadow-[0_0_20px_-6px_rgba(16,185,129,0.14)] space-y-3.5">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CSV_EXPORT_COLUMNS.map((column) => {
            const checked = selectedExportKeys.includes(column.key);
            return (
              <label
                key={column.key}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs cursor-pointer select-none transition-colors ${
                  checked
                    ? "border-emerald-500/40 bg-emerald-950/20 text-zinc-100"
                    : "border-zinc-800/80 bg-black/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleExportColumn(column.key)}
                  className="h-3.5 w-3.5 shrink-0 rounded-md accent-emerald-500 cursor-pointer"
                />
                <span className="truncate">{column.label}</span>
              </label>
            );
          })}
        </div>

        {hasNoExportSelection && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>กรุณาติ๊กเลือกข้อมูลอย่างน้อย 1 หัวข้อก่อนส่งออกไฟล์</span>
          </p>
        )}
      </div>

      {loading && records.length === 0 ? (
        <div className={`py-14 text-center space-y-2 ${SURFACE_CARD_CLASS}`}>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
          <p className="text-sm text-zinc-400">
            กำลังโหลดรายการที่บันทึกไว้บน Cloud...
          </p>
        </div>
      ) : enrichedSortedRecords.length === 0 ? (
        <div
          className={`py-14 px-6 text-center space-y-2 ${SURFACE_CARD_CLASS}`}
        >
          <p className="text-base font-semibold text-zinc-200">
            ยังไม่มีรายการที่บันทึกไว้
          </p>
          <p className="text-xs sm:text-sm text-zinc-500">
            คำนวณกำไรในแท็บ “คำนวณรายการใหม่” แล้วกดบันทึกข้อมูลลง Cloud เพื่อเก็บไว้ดูและส่งออกเป็นไฟล์ตารางภายหลัง
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {enrichedSortedRecords.map(({ item, metrics }) => {
            const isLoss = metrics.netProfitPerUnit < 0;

            return (
              <article
                key={item.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${SURFACE_CARD_CLASS}`}
              >
                <div className="flex items-center gap-4 min-w-0">
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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadRecord(item)}
                    className="rounded-xl border border-emerald-500/30 bg-black px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-400"
                  >
                    เปิดดู / แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(item)}
                    disabled={deletingId === item.id}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-800 bg-black px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 disabled:opacity-50"
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
    </section>
  );
}
