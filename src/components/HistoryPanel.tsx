"use client";

import {
  Download,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { calculateEcommerceMetrics, formatCurrency } from "@/lib/calculator";
import type { EcommerceCalculationRecord } from "@/types";

interface HistoryPanelProps {
  records: EcommerceCalculationRecord[];
  loading: boolean;
  deletingId: string | null;
  realtimeConnected: boolean;
  onRefresh: () => void;
  onExportCsv: () => void;
  onLoadRecord: (record: EcommerceCalculationRecord) => void;
  onDeleteRecord: (record: EcommerceCalculationRecord) => void;
}

const SURFACE_CARD_CLASS =
  "bg-[#050505] border border-emerald-500/25 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:shadow-[0_0_25px_-4px_rgba(16,185,129,0.3)]";

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
  return (
    <section className="border-t border-zinc-800/80 pt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              ประวัติที่บันทึกไว้ ({records.length})
            </h2>
            <span className="inline-flex items-center gap-1.5 border border-emerald-500/30 bg-[#050505] px-2.5 py-0.5 text-[11px] font-mono text-emerald-400">
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
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            กดเปิดดูเพื่อดึงตัวเลขและรูปสินค้ากลับมาแก้ไข หรือส่งออกทั้งหมดเป็นไฟล์ CSV
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 border border-emerald-500/25 bg-[#050505] px-3.5 py-2 text-xs font-medium text-zinc-200 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 border border-emerald-500/25 bg-[#050505] px-3.5 py-2 text-xs font-medium text-zinc-300 shadow-[0_0_20px_-6px_rgba(16,185,129,0.16)] transition-all duration-200 hover:border-emerald-400/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      {loading && records.length === 0 ? (
        <div
          className={`py-14 text-center space-y-2 ${SURFACE_CARD_CLASS}`}
        >
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-400" />
          <p className="text-sm text-zinc-400">
            กำลังโหลดรายการที่บันทึกไว้บน Cloud...
          </p>
        </div>
      ) : records.length === 0 ? (
        <div
          className={`py-14 px-6 text-center space-y-2 ${SURFACE_CARD_CLASS}`}
        >
          <p className="text-base font-semibold text-zinc-200">
            ยังไม่มีรายการที่บันทึกไว้
          </p>
          <p className="text-xs sm:text-sm text-zinc-500">
            คำนวณกำไรในแท็บ “คำนวณรายการใหม่” แล้วกดบันทึกข้อมูลลง Cloud เพื่อเก็บประวัติไว้ดูภายหลัง
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
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

            const isLoss = metrics.netProfitPerUnit < 0;

            return (
              <article
                key={item.id}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${SURFACE_CARD_CLASS}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-16 w-16 shrink-0 overflow-hidden border border-emerald-500/25 bg-black flex items-center justify-center">
                    {item.product_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-zinc-700" />
                    )}
                  </div>

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
                    className="border border-emerald-500/30 bg-black px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-all duration-200 hover:border-emerald-400 hover:text-emerald-400"
                  >
                    เปิดดู / แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(item)}
                    disabled={deletingId === item.id}
                    className="inline-flex items-center justify-center gap-1 border border-zinc-800 bg-black px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:border-rose-500/60 disabled:opacity-50"
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
