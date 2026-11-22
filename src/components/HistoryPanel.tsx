"use client";

import {
  Calculator,
  Download,
  Layers,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { calculateEcommerceMetrics, formatCurrency } from "@/lib/calculator";
import type { EcommerceCalculationRecord } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface HistoryPanelProps {
  records: EcommerceCalculationRecord[];
  loading: boolean;
  deletingId: string | null;
  realtimeConnected: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  onLoadRecord: (record: EcommerceCalculationRecord) => void;
  onDeleteRecord: (id: string) => void;
}

/**
 * แผงแสดงประวัติการคำนวณบน Supabase Cloud พร้อมปุ่มโหลดกลับมาแก้ไข, ลบ และ Export CSV
 */
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
  const { isDark } = useTheme();

  const cardClass = isDark
    ? "border-zinc-800 bg-[#050505]"
    : "border-slate-200 bg-white";
  const subBoxClass = isDark
    ? "border-zinc-800/80 bg-[#0A0A0A]"
    : "border-slate-200 bg-slate-50/70";
  const mutedText = isDark ? "text-zinc-400" : "text-slate-600";
  const subtleText = isDark ? "text-zinc-500" : "text-slate-500";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold tracking-tight">
            ประวัติที่บันทึกไว้บน Cloud ({records.length})
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${
              isDark
                ? "border-zinc-800 bg-zinc-950 text-emerald-400"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                realtimeConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span>{realtimeConnected ? "Realtime Sync" : "Cloud Connected"}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isDark
                ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>ส่งออกไฟล์ CSV</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              isDark
                ? "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div className={`rounded-xl border p-10 text-center ${cardClass}`}>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-500 mb-2" />
          <p className={`text-sm ${mutedText}`}>
            กำลังดึงประวัติที่บันทึกไว้บน Cloud...
          </p>
        </div>
      ) : records.length === 0 ? (
        <div
          className={`rounded-xl border border-dashed p-10 text-center space-y-2 ${cardClass}`}
        >
          <Layers className="mx-auto h-7 w-7 text-emerald-500/70" />
          <p className="text-sm font-semibold">
            ยังไม่มีรายการที่บันทึกไว้บน Cloud
          </p>
          <p className={`text-xs ${mutedText}`}>
            ลองคำนวณราคาสินค้าแล้วกด “บันทึกการคำนวณลง Cloud” เพื่อเก็บข้อมูลไว้เปรียบเทียบภายหลัง
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {records.map((item) => {
            const metrics = calculateEcommerceMetrics({
              productName: item.product_name,
              platform: item.platform,
              costPrice: Number(item.cost_price) || 0,
              packagingCost: Number(item.packaging_cost) || 0,
              adsCost: Number(item.ads_cost) || 0,
              platformFeePercent: Number(item.platform_fee_percent) || 0,
              sellingPrice: Number(item.selling_price) || 0,
              fixedCost: Number(item.fixed_cost) || 0,
            });

            return (
              <article
                key={item.id}
                className={`rounded-xl border p-4 transition-colors hover:border-emerald-500/40 ${cardClass}`}
              >
                <div className="flex items-start justify-between gap-2.5 mb-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                          isDark
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {item.platform} ({Number(item.platform_fee_percent)}%)
                      </span>
                      <span className={`text-[11px] ${subtleText}`}>
                        {new Date(item.created_at).toLocaleString("th-TH")}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold truncate">
                      {item.product_name}
                    </h3>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-xs font-bold tabular-nums ${
                      metrics.netProfitPerUnit >= 0
                        ? isDark
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-emerald-50 text-emerald-700"
                        : isDark
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                    {formatCurrency(Math.abs(metrics.netProfitPerUnit))}
                  </span>
                </div>

                <div
                  className={`grid grid-cols-3 gap-2 rounded-lg border p-2.5 text-xs font-mono tabular-nums mb-3.5 ${subBoxClass}`}
                >
                  <div>
                    <span className={`block font-sans text-[11px] ${subtleText}`}>
                      ราคาขาย
                    </span>
                    <span className="font-semibold">
                      ฿{formatCurrency(Number(item.selling_price) || 0)}
                    </span>
                  </div>
                  <div>
                    <span className={`block font-sans text-[11px] ${subtleText}`}>
                      ต้นทุนรวม/ชิ้น
                    </span>
                    <span className="font-semibold">
                      ฿{formatCurrency(metrics.totalCostPerUnit)}
                    </span>
                  </div>
                  <div>
                    <span className={`block font-sans text-[11px] ${subtleText}`}>
                      Margin / คุ้มทุน
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(metrics.netMarginPercent, 1)}% (
                      {metrics.breakEvenUnits !== null
                        ? `${metrics.breakEvenUnits} ชิ้น`
                        : "ไม่คุ้มทุน"}
                      )
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLoadRecord(item)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                      isDark
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950"
                        : "border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-slate-950"
                    }`}
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>โหลดตัวเลขกลับมาคำนวณต่อ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(item.id)}
                    disabled={deletingId === item.id}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isDark
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                    }`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
