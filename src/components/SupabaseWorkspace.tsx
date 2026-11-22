"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  Cloud,
  CloudUpload,
  Coins,
  Download,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Package,
  Percent,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Sun,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  supabase,
  supabaseConfigStatus,
  type EcommerceCalculation,
} from "@/lib/supabaseClient";
import { translateSupabaseError } from "@/lib/authErrors";

type AuthMode = "login" | "signup";
type ThemeMode = "default" | "white" | "black";

type PlatformPreset = {
  id: string;
  label: string;
  badge: string;
  feePercent: number;
};

const PLATFORM_PRESETS: PlatformPreset[] = [
  { id: "Shopee", label: "Shopee (13%)", badge: "Marketplace", feePercent: 13 },
  { id: "TikTok Shop", label: "TikTok Shop (12%)", badge: "Social Commerce", feePercent: 12 },
  { id: "Lazada", label: "Lazada (12%)", badge: "Marketplace", feePercent: 12 },
  { id: "ขายผ่านเพจ/แชต", label: "ขายผ่านเพจ/แชต (0%)", badge: "Direct Sales", feePercent: 0 },
];

const THEME_STORAGE_KEY = "ecom_theme_mode";
const THEME_EVENT_NAME = "ecom-theme-change";

function subscribeTheme(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(THEME_EVENT_NAME, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(THEME_EVENT_NAME, handler);
  };
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "default";
  }
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "white" || saved === "black" || saved === "default") {
    return saved;
  }
  return "default";
}

function getThemeServerSnapshot(): ThemeMode {
  return "default";
}

function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString("th-TH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function parseSafeNumber(raw: string): number {
  const num = Number(raw);
  return Number.isFinite(num) && num >= 0 ? num : 0;
}

export default function SupabaseWorkspace() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );
  const isDark = theme === "black";

  const selectTheme = useCallback((next: ThemeMode) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_EVENT_NAME));
  }, []);

  // Auth & Modal state
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(Boolean(supabase));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Calculator state (usable immediately without logging in)
  const [productName, setProductName] = useState("เสื้อยืด Oversize คอตตอนพรีเมียม");
  const [platform, setPlatform] = useState("Shopee");
  const [costPriceInput, setCostPriceInput] = useState("120");
  const [packagingCostInput, setPackagingCostInput] = useState("15");
  const [adsCostInput, setAdsCostInput] = useState("35");
  const [platformFeeInput, setPlatformFeeInput] = useState("13");
  const [sellingPriceInput, setSellingPriceInput] = useState("290");
  const [fixedCostInput, setFixedCostInput] = useState("15000");
  const [discountPercent, setDiscountPercent] = useState(15);

  // Cloud history state
  const [calculations, setCalculations] = useState<EcommerceCalculation[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbSuccess, setDbSuccess] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const historyLoading =
    refreshing || Boolean(user && loadedUserId !== user.id);

  const costPrice = parseSafeNumber(costPriceInput);
  const packagingCost = parseSafeNumber(packagingCostInput);
  const adsCost = parseSafeNumber(adsCostInput);
  const platformFeePercent = Math.min(100, parseSafeNumber(platformFeeInput));
  const sellingPrice = parseSafeNumber(sellingPriceInput);
  const fixedCost = parseSafeNumber(fixedCostInput);

  // Real-time financial metrics
  const metrics = useMemo(() => {
    const platformFeeBath = sellingPrice * (platformFeePercent / 100);
    const totalCostPerUnit =
      costPrice + packagingCost + adsCost + platformFeeBath;
    const netProfitPerUnit = sellingPrice - totalCostPerUnit;
    const netMarginPercent =
      sellingPrice > 0 ? (netProfitPerUnit / sellingPrice) * 100 : 0;

    const canBreakEven = netProfitPerUnit > 0;
    const breakEvenUnits = canBreakEven
      ? Math.ceil(fixedCost / netProfitPerUnit)
      : null;
    const breakEvenRevenue =
      breakEvenUnits !== null ? breakEvenUnits * sellingPrice : null;

    // Promo Discount Simulator (0% - 50%)
    const discountedPrice = sellingPrice * (1 - discountPercent / 100);
    const discountedPlatformFee = discountedPrice * (platformFeePercent / 100);
    const discountedTotalCost =
      costPrice + packagingCost + adsCost + discountedPlatformFee;
    const discountedProfitPerUnit = discountedPrice - discountedTotalCost;
    const discountedMarginPercent =
      discountedPrice > 0
        ? (discountedProfitPerUnit / discountedPrice) * 100
        : 0;

    // Baseline comparison: to achieve the same total profit as selling 100 units at regular price
    const baselineUnits = 100;
    const baselineTotalProfit =
      netProfitPerUnit > 0 ? netProfitPerUnit * baselineUnits : 0;
    const requiredUnitsForSameProfit =
      netProfitPerUnit > 0 && discountedProfitPerUnit > 0
        ? Math.ceil(baselineTotalProfit / discountedProfitPerUnit)
        : null;
    const volumeMultiplier =
      netProfitPerUnit > 0 && discountedProfitPerUnit > 0
        ? netProfitPerUnit / discountedProfitPerUnit
        : null;
    const discountedBreakEvenUnits =
      discountedProfitPerUnit > 0
        ? Math.ceil(fixedCost / discountedProfitPerUnit)
        : null;

    // Breakdown chart percentages (relative to sellingPrice or totalCost if sellingPrice is smaller)
    const chartBase = Math.max(sellingPrice, totalCostPerUnit, 1);
    const productCostShare = (costPrice / chartBase) * 100;
    const packAdsCost = packagingCost + adsCost;
    const packAdsShare = (packAdsCost / chartBase) * 100;
    const feeShare = (platformFeeBath / chartBase) * 100;
    const profitShare =
      netProfitPerUnit > 0 ? (netProfitPerUnit / chartBase) * 100 : 0;

    return {
      platformFeeBath,
      totalCostPerUnit,
      netProfitPerUnit,
      netMarginPercent,
      canBreakEven,
      breakEvenUnits,
      breakEvenRevenue,
      discountedPrice,
      discountedPlatformFee,
      discountedTotalCost,
      discountedProfitPerUnit,
      discountedMarginPercent,
      baselineUnits,
      baselineTotalProfit,
      requiredUnitsForSameProfit,
      volumeMultiplier,
      discountedBreakEvenUnits,
      packAdsCost,
      productCostShare,
      packAdsShare,
      feeShare,
      profitShare,
    };
  }, [
    costPrice,
    packagingCost,
    adsCost,
    platformFeePercent,
    sellingPrice,
    fixedCost,
    discountPercent,
  ]);

  const fetchCalculations = useCallback(async (userId: string) => {
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
    } else {
      setCalculations((data as EcommerceCalculation[]) ?? []);
    }
    setLoadedUserId(userId);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setAuthError(translateSupabaseError(error));
        }
        setUser(data.session?.user ?? null);
        setAuthChecking(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setAuthError(translateSupabaseError(err));
        setAuthChecking(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setAuthChecking(false);
      if (nextUser) {
        setAuthModalOpen(false);
      } else {
        setCalculations([]);
        setLoadedUserId(null);
        setRealtimeConnected(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user) return;

    let active = true;

    supabase
      .from("ecommerce_calculations")
      .select(
        "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setDbError(translateSupabaseError(error));
        } else {
          setDbError(null);
          setCalculations((data as EcommerceCalculation[]) ?? []);
        }
        setLoadedUserId(user.id);
      });

    const channel = supabase
      .channel(`ecommerce_calculations_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ecommerce_calculations",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const inserted = payload.new as EcommerceCalculation;
            setCalculations((prev) =>
              prev.some((item) => item.id === inserted.id)
                ? prev
                : [inserted, ...prev]
            );
          } else if (payload.eventType === "DELETE") {
            const removedId = (payload.old as { id?: string }).id;
            if (removedId) {
              setCalculations((prev) =>
                prev.filter((item) => item.id !== removedId)
              );
            }
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as EcommerceCalculation;
            setCalculations((prev) =>
              prev.map((item) => (item.id === updated.id ? updated : item))
            );
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      active = false;
      setRealtimeConnected(false);
      supabase?.removeChannel(channel);
    };
  }, [user]);

  function handleSelectPreset(preset: PlatformPreset) {
    setPlatform(preset.id);
    setPlatformFeeInput(String(preset.feePercent));
  }

  function handleResetDefaults() {
    setProductName("เสื้อยืด Oversize คอตตอนพรีเมียม");
    setPlatform("Shopee");
    setCostPriceInput("120");
    setPackagingCostInput("15");
    setAdsCostInput("35");
    setPlatformFeeInput("13");
    setSellingPriceInput("290");
    setFixedCostInput("15000");
    setDiscountPercent(15);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || authLoading) return;

    setAuthError(null);
    setAuthNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setAuthError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (password.length < 6) {
      setAuthError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setAuthLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setAuthError(translateSupabaseError(error));
          return;
        }
        if (data.user && data.user.identities?.length === 0) {
          setAuthError("อีเมลนี้ถูกสมัครใช้งานแล้ว กรุณาเข้าสู่ระบบแทน");
          return;
        }
        if (data.session) {
          setAuthModalOpen(false);
          setPassword("");
        } else {
          setAuthNotice(
            "สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมล หรือเข้าสู่ระบบได้ทันทีหากปิด Confirm email แล้ว"
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (error) {
          setAuthError(translateSupabaseError(error));
          return;
        }
        setAuthModalOpen(false);
        setPassword("");
      }
    } catch (err) {
      setAuthError(translateSupabaseError(err));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (!supabase || logoutLoading) return;
    setLogoutLoading(true);
    setDbError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setDbError(translateSupabaseError(error));
    }
    setLogoutLoading(false);
  }

  async function handleSaveToCloud() {
    setDbError(null);
    setDbSuccess(null);

    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!supabase || saving) return;

    const trimmedName = productName.trim() || "สินค้าไม่ระบุชื่อ";
    setSaving(true);

    const { data, error } = await supabase
      .from("ecommerce_calculations")
      .insert({
        user_id: user.id,
        product_name: trimmedName,
        platform: platform.trim() || "ทั่วไป",
        cost_price: costPrice,
        packaging_cost: packagingCost,
        ads_cost: adsCost,
        platform_fee_percent: platformFeePercent,
        selling_price: sellingPrice,
        fixed_cost: fixedCost,
      })
      .select(
        "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, created_at"
      )
      .single();

    if (error) {
      setDbError(translateSupabaseError(error));
    } else if (data) {
      const created = data as EcommerceCalculation;
      setCalculations((prev) =>
        prev.some((item) => item.id === created.id) ? prev : [created, ...prev]
      );
      setDbSuccess(`บันทึก "${created.product_name}" ลง Cloud เรียบร้อยแล้ว`);
    }
    setSaving(false);
  }

  async function handleDeleteCalculation(id: string) {
    if (!supabase || !user || deletingId) return;
    setDeletingId(id);
    setDbError(null);
    setDbSuccess(null);

    const { error } = await supabase
      .from("ecommerce_calculations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      setDbError(translateSupabaseError(error));
    } else {
      setCalculations((prev) => prev.filter((item) => item.id !== id));
    }
    setDeletingId(null);
  }

  function handleLoadCalculation(item: EcommerceCalculation) {
    setProductName(item.product_name);
    setPlatform(item.platform);
    setCostPriceInput(String(item.cost_price));
    setPackagingCostInput(String(item.packaging_cost));
    setAdsCostInput(String(item.ads_cost));
    setPlatformFeeInput(String(item.platform_fee_percent));
    setSellingPriceInput(String(item.selling_price));
    setFixedCostInput(String(item.fixed_cost));
    setDbSuccess(`โหลดข้อมูล "${item.product_name}" กลับมาที่เครื่องมือคำนวณแล้ว`);

    const calcEl = document.getElementById("calculator");
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleExportCsv() {
    const rowsToExport: Array<{
      product_name: string;
      platform: string;
      cost_price: number;
      packaging_cost: number;
      ads_cost: number;
      platform_fee_percent: number;
      selling_price: number;
      fixed_cost: number;
      created_at: string;
    }> =
      calculations.length > 0
        ? calculations.map((c) => ({
            product_name: c.product_name,
            platform: c.platform,
            cost_price: Number(c.cost_price),
            packaging_cost: Number(c.packaging_cost),
            ads_cost: Number(c.ads_cost),
            platform_fee_percent: Number(c.platform_fee_percent),
            selling_price: Number(c.selling_price),
            fixed_cost: Number(c.fixed_cost),
            created_at: new Date(c.created_at).toLocaleString("th-TH"),
          }))
        : [
            {
              product_name: productName.trim() || "สินค้าปัจจุบัน",
              platform,
              cost_price: costPrice,
              packaging_cost: packagingCost,
              ads_cost: adsCost,
              platform_fee_percent: platformFeePercent,
              selling_price: sellingPrice,
              fixed_cost: fixedCost,
              created_at: new Date().toLocaleString("th-TH"),
            },
          ];

    const headers = [
      "ชื่อสินค้า",
      "แพลตฟอร์ม",
      "ต้นทุนสินค้า (บาท)",
      "ค่าแพ็ก (บาท)",
      "ค่าแอด (บาท)",
      "ค่าธรรมเนียม (%)",
      "ค่าธรรมเนียม (บาท)",
      "ต้นทุนรวมต่อชิ้น (บาท)",
      "ราคาขาย (บาท)",
      "กำไรสุทธิต่อชิ้น (บาท)",
      "Net Margin (%)",
      "ต้นทุนคงที่รวม (บาท)",
      "จุดคุ้มทุน (ชิ้น)",
      "วันที่บันทึก",
    ];

    const csvLines = [
      headers.join(","),
      ...rowsToExport.map((row) => {
        const feeBaht = row.selling_price * (row.platform_fee_percent / 100);
        const totalCost =
          row.cost_price + row.packaging_cost + row.ads_cost + feeBaht;
        const netProfit = row.selling_price - totalCost;
        const margin =
          row.selling_price > 0 ? (netProfit / row.selling_price) * 100 : 0;
        const breakEven =
          netProfit > 0
            ? String(Math.ceil(row.fixed_cost / netProfit))
            : "ไม่สามารถคืนทุนได้";

        const escapeCell = (val: string | number) =>
          `"${String(val).replace(/"/g, '""')}"`;

        return [
          escapeCell(row.product_name),
          escapeCell(row.platform),
          row.cost_price.toFixed(2),
          row.packaging_cost.toFixed(2),
          row.ads_cost.toFixed(2),
          row.platform_fee_percent.toFixed(2),
          feeBaht.toFixed(2),
          totalCost.toFixed(2),
          row.selling_price.toFixed(2),
          netProfit.toFixed(2),
          margin.toFixed(2),
          row.fixed_cost.toFixed(2),
          escapeCell(breakEven),
          escapeCell(row.created_at),
        ].join(",");
      }),
    ];

    const blob = new Blob(["\uFEFF" + csvLines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ecommerce-calculations-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Dynamic 3-Theme classes: Default (#F1F5F9), Pure White (#FFFFFF), Pure Black (#000000)
  const pageBg =
    theme === "black"
      ? "bg-[#000000] text-zinc-100"
      : theme === "white"
        ? "bg-[#FFFFFF] text-slate-950"
        : "bg-[#F1F5F9] text-slate-900";
  const navBg =
    theme === "black"
      ? "bg-[#000000]/90 border-zinc-800"
      : theme === "white"
        ? "bg-[#FFFFFF]/95 border-slate-200"
        : "bg-[#FFFFFF]/90 border-slate-200";
  const cardBg =
    theme === "black"
      ? "bg-[#050505] border-zinc-800/90"
      : theme === "white"
        ? "bg-[#FFFFFF] border-slate-200 shadow-none"
        : "bg-[#FFFFFF] border-slate-200/90 shadow-sm";
  const subCardBg =
    theme === "black"
      ? "bg-[#0A0A0A] border-zinc-800/80"
      : theme === "white"
        ? "bg-[#FFFFFF] border-slate-200"
        : "bg-[#F8FAFC] border-slate-200";
  const inputBg =
    theme === "black"
      ? "bg-[#000000] border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500"
      : "bg-[#FFFFFF] border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600";
  const mutedText = theme === "black" ? "text-zinc-400" : "text-slate-600";
  const subtleText = theme === "black" ? "text-zinc-500" : "text-slate-500";

  // SVG Donut chart calculations
  const donutRadius = 64;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const segments = [
    {
      key: "product",
      label: "ต้นทุนสินค้า",
      amount: costPrice,
      percent: metrics.productCostShare,
      color: "#3b82f6", // blue-500
      dotClass: "bg-blue-500",
    },
    {
      key: "packAds",
      label: "ค่าแพ็กและค่าแอด",
      amount: metrics.packAdsCost,
      percent: metrics.packAdsShare,
      color: "#f59e0b", // amber-500
      dotClass: "bg-amber-500",
    },
    {
      key: "fee",
      label: "ค่าธรรมเนียมแพลตฟอร์ม",
      amount: metrics.platformFeeBath,
      percent: metrics.feeShare,
      color: "#a855f7", // purple-500
      dotClass: "bg-purple-500",
    },
    {
      key: "profit",
      label: "กำไรสุทธิ",
      amount: Math.max(0, metrics.netProfitPerUnit),
      percent: metrics.profitShare,
      color: "#10b981", // emerald-500
      dotClass: "bg-emerald-500",
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${pageBg}`}>
      {/* 1. Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${navBg}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Left: Brand Logo */}
          <a
            href="#intro"
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm transition-transform group-hover:scale-105">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight block leading-none">
                E-Com MarginLab
              </span>
              <span className={`text-[11px] font-medium ${subtleText}`}>
                Digital for E-Commerce
              </span>
            </div>
          </a>

          {/* Center: Smooth Scroll Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { href: "#intro", label: "แนะนำการใช้งาน" },
              { href: "#how-to", label: "วิธีการใช้" },
              { href: "#calculator", label: "เครื่องมือคำนวณ" },
              { href: "#history", label: "ประวัติบน Cloud" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isDark
                    ? "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: 3-Theme Switcher & Login/User Action */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div
              role="group"
              aria-label="เลือกโหมดสี 3 รูปแบบ"
              className={`inline-flex items-center rounded-xl border p-1 ${
                isDark
                  ? "border-zinc-800 bg-zinc-950"
                  : "border-slate-200 bg-slate-100/80"
              }`}
            >
              {(
                [
                  { id: "default", label: "ปกติ", title: "โหมดปกติ (Default #F1F5F9)", Icon: Monitor },
                  { id: "white", label: "ขาว", title: "โหมดสีขาว (Pure White #FFFFFF)", Icon: Sun },
                  { id: "black", label: "ดำ", title: "โหมดสีดำ (Pure Black #000000)", Icon: Moon },
                ] as const
              ).map(({ id, label, title, Icon }) => {
                const active = theme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectTheme(id)}
                    aria-pressed={active}
                    title={title}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? id === "black"
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "bg-white text-slate-950 shadow-sm"
                        : isDark
                          ? "text-zinc-400 hover:text-zinc-200"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </div>

            {authChecking ? (
              <div
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs ${
                  isDark
                    ? "border-zinc-800 bg-zinc-950 text-zinc-400"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">กำลังตรวจสอบ...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span
                  className={`hidden lg:inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium max-w-[200px] truncate ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-emerald-400"
                      : "border-slate-200 bg-slate-100 text-emerald-700"
                  }`}
                  title={user.email ?? ""}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    isDark
                      ? "border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{logoutLoading ? "กำลังออก..." : "ออกจากระบบ"}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthNotice(null);
                  setAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-400 active:scale-[0.99]"
              >
                <LogIn className="h-4 w-4" />
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Quick Anchor Bar */}
        <div
          className={`flex md:hidden items-center justify-around border-t px-2 py-2 text-xs font-medium ${
            isDark
              ? "border-zinc-900 bg-[#000000] text-zinc-400"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <a href="#intro" className="px-2 py-1 hover:text-emerald-500">
            แนะนำ
          </a>
          <a href="#how-to" className="px-2 py-1 hover:text-emerald-500">
            วิธีใช้
          </a>
          <a href="#calculator" className="px-2 py-1 hover:text-emerald-500">
            คำนวณ
          </a>
          <a href="#history" className="px-2 py-1 hover:text-emerald-500">
            ประวัติ Cloud
          </a>
        </div>
      </header>

      {/* Missing Env Banner (non-crashing fallback) */}
      {!supabaseConfigStatus.isConfigured && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs sm:text-sm text-amber-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>
              {supabaseConfigStatus.errorMessage} — เครื่องมือคำนวณยังใช้งานได้ตามปกติ แต่ระบบบันทึก Cloud จะปิดไว้ชั่วคราว
            </span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* SECTION 1: #intro (Hero Section) */}
        <section id="intro" className="scroll-mt-24 pt-2 sm:pt-6">
          <div
            className={`relative overflow-hidden rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors ${cardBg}`}
          >
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-500">
                <Sparkles className="h-3.5 w-3.5" />
                <span>โครงงานวิชา ดิจิทัลฟอร์อีคอมเมิร์ซ (Digital for E-Commerce)</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                หยุดปัญหา{" "}
                <span className="text-emerald-500">“ขายดีแต่ขาดทุน”</span>{" "}
                ด้วยการคำนวณต้นทุนจริงและจุดคุ้มทุนก่อนตั้งราคาขาย
              </h1>

              <p className={`text-sm sm:text-base leading-relaxed ${mutedText}`}>
                พ่อค้าแม่ค้าออนไลน์จำนวนมากตั้งราคาขายจากต้นทุนสินค้าเพียงอย่างเดียว แต่ลืมหัก{" "}
                <strong className={isDark ? "text-zinc-200" : "text-slate-900"}>
                  ค่า GP แพลตฟอร์ม (12%–13%), ค่าโฆษณาต่อชิ้น, ค่ากล่องและบับเบิลกันกระแทก รวมถึงโปรโมชันลดราคา
                </strong>{" "}
                ทำให้ยิ่งยิงแอดขายดีเท่าไหร่ เงินสดในร้านกลับยิ่งติดลบ เว็บแอปนี้จึงช่วยให้คุณจำลองโครงสร้างราคาและหาจุดคุ้มทุนได้แม่นยำในหน้าเดียว
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
                >
                  <Calculator className="h-4 w-4" />
                  <span>เริ่มคำนวณทันที</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#how-to"
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3.5 text-sm font-semibold transition-all ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>ดูวิธีการใช้งาน</span>
                </a>
              </div>
            </div>

            {/* Pain points vs Benefits grid */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Percent,
                  title: "รู้ทันค่า GP แพลตฟอร์ม",
                  desc: "มี Preset ค่าธรรมเนียม Shopee, TikTok Shop, Lazada และขายตรงผ่านเพจ คำนวณหักจากราคาขายจริงอัตโนมัติ",
                },
                {
                  icon: Sliders,
                  title: "จำลองจัดโปรลดราคา 0–50%",
                  desc: "เห็นทันทีว่าถ้าจัดแคมเปญ Flash Sale ลดราคาลง กำไรต่อชิ้นจะเหลือเท่าไหร่ และต้องขายเพิ่มกี่ชิ้นถึงจะคุ้ม",
                },
                {
                  icon: Cloud,
                  title: "บันทึกแผนราคาบน Cloud",
                  desc: "ผูกบัญชีกับ Supabase Cloud ดึงข้อมูลสินค้าเดิมกลับมาปรับราคาหรือส่งออกเป็นไฟล์ Excel (CSV) ได้ทุกที่",
                },
              ].map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 ${subCardBg}`}
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold mb-1.5">
                      {feature.title}
                    </h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2: #how-to (Step-by-Step Guide) */}
        <section id="how-to" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Quick Start Guide
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                วิธีการใช้งาน 4 ขั้นตอน (เข้าใจใน 10 วินาที)
              </h2>
            </div>
            <p className={`text-xs sm:text-sm ${mutedText}`}>
              ใช้งานเครื่องมือคำนวณได้ทันทีโดยไม่ต้องสมัครสมาชิกก่อน
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                icon: Store,
                title: "เลือกแพลตฟอร์ม & กรอกต้นทุน",
                desc: "กดปุ่ม Preset แพลตฟอร์มที่ขาย แล้วกรอกต้นทุนสินค้า ค่าแพ็ก ค่าแอด และราคาขายที่ตั้งไว้",
              },
              {
                step: "02",
                icon: Target,
                title: "ตรวจกำไรสุทธิ & จุดคุ้มทุน",
                desc: "ระบบคำนวณกำไรต่อชิ้น Net Margin % และจำนวนชิ้นขั้นต่ำที่ต้องขายเพื่อคืนทุนคงที่แบบ Real-time",
              },
              {
                step: "03",
                icon: Sliders,
                title: "เลื่อนแถบจำลองโปรโมชัน",
                desc: "ทดลองเลื่อนส่วนลด 0%–50% เพื่อดูว่าหลังลดราคาแล้วยังมีกำไรเหลือหรือไม่ และต้องขายกี่ชิ้น",
              },
              {
                step: "04",
                icon: CloudUpload,
                title: "ล็อกอินเพื่อบันทึกขึ้น Cloud",
                desc: "กดเข้าสู่ระบบที่มุมขวาบนเพื่อบันทึกข้อมูลสินค้าเก็บไว้บน Cloud หรือกด Export CSV ไปใช้งานต่อ",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={`group relative rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/50 ${cardBg}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold mb-1.5">
                    {item.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: #calculator (E-Commerce Calculator) */}
        <section id="calculator" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                Real-Time Profit & Break-Even Engine
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                เครื่องมือคำนวณต้นทุน ตั้งราคาขาย และจุดคุ้มทุน
              </h2>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className={`inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
                isDark
                  ? "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>รีเซ็ตค่าตัวอย่าง</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Inputs (5 cols on lg) */}
            <div className={`lg:col-span-5 rounded-3xl border p-6 space-y-5 ${cardBg}`}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-2">
                  เลือก Preset แพลตฟอร์มขายสินค้า
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORM_PRESETS.map((preset) => {
                    const active =
                      platform === preset.id &&
                      Number(platformFeeInput) === preset.feePercent;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          active
                            ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                            : isDark
                              ? "border-zinc-800 bg-[#0A0A0A] text-zinc-300 hover:border-zinc-700"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs sm:text-sm font-semibold">
                            {preset.label}
                          </span>
                          <ShoppingBag className="h-3.5 w-3.5 shrink-0 opacity-75" />
                        </div>
                        <span className={`text-[11px] mt-0.5 ${subtleText}`}>
                          {preset.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="productName"
                    className="block text-xs sm:text-sm font-medium mb-1.5"
                  >
                    ชื่อสินค้า / รุ่นสินค้า
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="เช่น เสื้อยืด Oversize, เซรั่มบำรุงผิว..."
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="costPrice"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                    >
                      ต้นทุนสินค้าต่อชิ้น (บาท)
                    </label>
                    <input
                      id="costPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={costPriceInput}
                      onChange={(e) => setCostPriceInput(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="packagingCost"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                    >
                      ค่าแพ็กของ/กล่องต่อชิ้น (บาท)
                    </label>
                    <input
                      id="packagingCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={packagingCostInput}
                      onChange={(e) => setPackagingCostInput(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="adsCost"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                    >
                      ค่าโฆษณาเฉลี่ยต่อชิ้น (บาท)
                    </label>
                    <input
                      id="adsCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={adsCostInput}
                      onChange={(e) => setAdsCostInput(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="platformFee"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                    >
                      ค่าธรรมเนียมแพลตฟอร์ม (%)
                    </label>
                    <input
                      id="platformFee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={platformFeeInput}
                      onChange={(e) => setPlatformFeeInput(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label
                      htmlFor="sellingPrice"
                      className="block text-xs sm:text-sm font-semibold text-emerald-500 mb-1.5"
                    >
                      ราคาขายที่ตั้งไว้ (บาท)
                    </label>
                    <input
                      id="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={sellingPriceInput}
                      onChange={(e) => setSellingPriceInput(e.target.value)}
                      className={`w-full rounded-xl border-2 border-emerald-500/60 px-3.5 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        isDark
                          ? "bg-[#000000] text-emerald-400"
                          : "bg-emerald-50/40 text-emerald-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fixedCost"
                      className="block text-xs sm:text-sm font-medium mb-1.5"
                    >
                      ต้นทุนคงที่รวม / ค่าสต็อก (บาท)
                    </label>
                    <input
                      id="fixedCost"
                      type="number"
                      min="0"
                      step="1"
                      value={fixedCostInput}
                      onChange={(e) => setFixedCostInput(e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Action to Save to Cloud directly from Calculator */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveToCloud}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CloudUpload className="h-4 w-4" />
                  )}
                  <span>
                    {saving
                      ? "กำลังบันทึก..."
                      : user
                        ? "บันทึกการคำนวณลง Cloud"
                        : "เข้าสู่ระบบเพื่อบันทึกข้อมูล"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Right Column: KPI Cards + Simulator + Visual Breakdown Chart (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Loss Alert Banner when netProfitPerUnit < 0 */}
              {metrics.netProfitPerUnit < 0 && (
                <div
                  role="alert"
                  className={`flex items-center gap-3 rounded-2xl border-2 border-rose-500 px-5 py-4 shadow-lg ${
                    isDark
                      ? "bg-rose-500/15 text-rose-300"
                      : "bg-rose-50 text-rose-800"
                  }`}
                >
                  <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500" />
                  <div>
                    <p
                      className={`text-sm sm:text-base font-bold ${
                        isDark ? "text-rose-400" : "text-rose-700"
                      }`}
                    >
                      ขาดทุน! ควรปรับราคาขายเพิ่ม
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${
                        isDark ? "text-rose-300/90" : "text-rose-700"
                      }`}
                    >
                      ราคาขายปัจจุบัน ({formatNumber(sellingPrice)} บาท) ต่ำกว่าต้นทุนรวมต่อชิ้น (
                      {formatNumber(metrics.totalCostPerUnit)} บาท) ทำให้ขาดทุนชิ้นละ{" "}
                      {formatNumber(Math.abs(metrics.netProfitPerUnit))} บาท
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Real-Time KPI Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* 1. Total Cost per Unit */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${mutedText}`}>
                      ต้นทุนรวมต่อชิ้น (บาท)
                    </span>
                    <Package className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold font-mono">
                    ฿{formatNumber(metrics.totalCostPerUnit)}
                  </p>
                  <p className={`mt-1.5 text-xs ${subtleText}`}>
                    รวมค่า GP แพลตฟอร์ม ฿{formatNumber(metrics.platformFeeBath)} ({platformFeePercent}
                    %)
                  </p>
                </div>

                {/* 2. Net Profit per Unit */}
                <div
                  className={`rounded-2xl border p-5 ${
                    metrics.netProfitPerUnit < 0
                      ? "border-rose-500/60 bg-rose-500/10"
                      : cardBg
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${mutedText}`}>
                      กำไรสุทธิต่อชิ้น (บาท)
                    </span>
                    {metrics.netProfitPerUnit >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <p
                    className={`text-2xl sm:text-3xl font-bold font-mono ${
                      metrics.netProfitPerUnit > 0
                        ? "text-emerald-500"
                        : metrics.netProfitPerUnit < 0
                          ? "text-rose-500"
                          : ""
                    }`}
                  >
                    {metrics.netProfitPerUnit >= 0 ? "+" : "-"}฿
                    {formatNumber(Math.abs(metrics.netProfitPerUnit))}
                  </p>
                  <p className={`mt-1.5 text-xs ${subtleText}`}>
                    {metrics.netProfitPerUnit < 0
                      ? "ขาดทุน! ควรปรับราคาขายเพิ่ม"
                      : "หักต้นทุนสินค้า ค่าแพ็ก ค่าแอด และ GP แล้ว"}
                  </p>
                </div>

                {/* 3. Net Margin % */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${mutedText}`}>
                      อัตรากำไรสุทธิ (Net Margin %)
                    </span>
                    <Coins className="h-4 w-4 text-amber-400" />
                  </div>
                  <p
                    className={`text-2xl sm:text-3xl font-bold font-mono ${
                      metrics.netMarginPercent >= 20
                        ? "text-emerald-500"
                        : metrics.netMarginPercent > 0
                          ? "text-amber-400"
                          : "text-rose-500"
                    }`}
                  >
                    {formatNumber(metrics.netMarginPercent, 1)}%
                  </p>
                  <p className={`mt-1.5 text-xs ${subtleText}`}>
                    {metrics.netMarginPercent >= 20
                      ? "อยู่ในเกณฑ์ดี (แนะนำ >= 20%)"
                      : metrics.netMarginPercent > 0
                        ? "กำไรค่อนข้างบาง ระวังการจัดโปรลดราคา"
                        : "ไม่มีกำไรสุทธิ"}
                  </p>
                </div>

                {/* 4. Break-Even Point */}
                <div className={`rounded-2xl border p-5 ${cardBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${mutedText}`}>
                      จุดคุ้มทุน (Break-Even Point)
                    </span>
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                  {metrics.canBreakEven && metrics.breakEvenUnits !== null ? (
                    <>
                      <p className="text-2xl sm:text-3xl font-bold font-mono">
                        {metrics.breakEvenUnits.toLocaleString("th-TH")}{" "}
                        <span className="text-base font-sans font-medium">ชิ้น</span>
                      </p>
                      <p className={`mt-1.5 text-xs ${subtleText}`}>
                        ยอดขายคืนทุน ฿{formatNumber(metrics.breakEvenRevenue ?? 0, 0)} (จากทุนคงที่ ฿
                        {formatNumber(fixedCost, 0)})
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg sm:text-xl font-bold text-rose-500">
                        ไม่สามารถคืนทุนได้
                      </p>
                      <p className={`mt-1.5 text-xs ${subtleText}`}>
                        กำไรต่อชิ้น &le; 0 บาท กรุณาเพิ่มราคาขายหรือลดต้นทุน
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Promo Discount Simulator (0% - 50%) */}
              <div className={`rounded-3xl border p-6 space-y-4 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-base sm:text-lg font-bold">
                      ตัวจำลองการจัดโปรโมชัน (Promo Discount Simulator)
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center self-start sm:self-auto rounded-xl border px-3 py-1 font-mono text-xs sm:text-sm font-bold ${
                      isDark
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                        : "border-emerald-600/30 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    ลดราคา {discountPercent}%
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    aria-label="แถบเลื่อนส่วนลดโปรโมชัน"
                    className="w-full accent-emerald-500 cursor-pointer h-2 rounded-lg"
                  />
                  <div className={`flex justify-between text-[11px] font-mono ${subtleText}`}>
                    <span>0% (ราคาปกติ)</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                    <span>40%</span>
                    <span>50% (ลดครึ่งราคา)</span>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 sm:p-5 ${subCardBg}`}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                    <div>
                      <span className={`text-xs ${mutedText}`}>ราคาขายหลังลด</span>
                      <p className="text-lg sm:text-xl font-bold font-mono mt-0.5">
                        ฿{formatNumber(metrics.discountedPrice)}
                      </p>
                    </div>
                    <div>
                      <span className={`text-xs ${mutedText}`}>กำไรสุทธิต่อชิ้นหลังลด</span>
                      <p
                        className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${
                          metrics.discountedProfitPerUnit > 0
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }`}
                      >
                        {metrics.discountedProfitPerUnit >= 0 ? "+" : "-"}฿
                        {formatNumber(Math.abs(metrics.discountedProfitPerUnit))}
                      </p>
                    </div>
                    <div>
                      <span className={`text-xs ${mutedText}`}>จุดคุ้มทุนใหม่หลังลด</span>
                      <p className="text-lg sm:text-xl font-bold font-mono mt-0.5">
                        {metrics.discountedBreakEvenUnits !== null
                          ? `${metrics.discountedBreakEvenUnits.toLocaleString("th-TH")} ชิ้น`
                          : "ไม่สามารถคืนทุนได้"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      metrics.discountedProfitPerUnit > 0
                        ? isDark
                          ? "border-emerald-500/30 bg-emerald-500/10 text-zinc-200"
                          : "border-emerald-500/30 bg-emerald-50 text-slate-800"
                        : isDark
                          ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                          : "border-rose-500/40 bg-rose-50 text-rose-800"
                    }`}
                  >
                    {metrics.discountedProfitPerUnit > 0 &&
                    metrics.requiredUnitsForSameProfit !== null ? (
                      <p>
                        หากลดราคา <strong>{discountPercent}%</strong> เหลือ{" "}
                        <strong>฿{formatNumber(metrics.discountedPrice)}</strong> กำไรต่อชิ้นจะเหลือ{" "}
                        <strong>฿{formatNumber(metrics.discountedProfitPerUnit)}</strong>{" "}
                        (Margin {formatNumber(metrics.discountedMarginPercent, 1)}%) — เพื่อให้ได้กำไรรวมเท่ากับการขายราคาปกติ{" "}
                        {metrics.baselineUnits} ชิ้น (฿
                        {formatNumber(metrics.baselineTotalProfit, 0)}) คุณต้องขายให้ได้{" "}
                        <strong
                          className={`underline ${
                            isDark ? "text-emerald-400" : "text-emerald-700"
                          }`}
                        >
                          {metrics.requiredUnitsForSameProfit.toLocaleString("th-TH")} ชิ้น
                        </strong>{" "}
                        (คิดเป็น {formatNumber(metrics.volumeMultiplier ?? 1, 2)} เท่าของยอดขายเดิม)
                      </p>
                    ) : (
                      <p className="flex items-center gap-2 font-medium">
                        <ArrowDownRight className="h-4 w-4 shrink-0" />
                        <span>
                          หากลดราคา {discountPercent}% เหลือ ฿
                          {formatNumber(metrics.discountedPrice)} จะทำให้กำไรติดลบหรือเป็นศูนย์ (
                          ฿{formatNumber(metrics.discountedProfitPerUnit)} ต่อชิ้น) ไม่สามารถจัดโปรโมชันในราคานี้ได้!
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Breakdown Chart (SVG Donut + 100% Stacked Horizontal Bar) */}
              <div className={`rounded-3xl border p-6 space-y-5 ${cardBg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-base sm:text-lg font-bold">
                      กราฟแสดงสัดส่วนโครงสร้างราคา (Visual Breakdown Chart)
                    </h3>
                  </div>
                  <span className={`text-xs font-mono ${subtleText}`}>
                    เทียบต่อราคาขาย ฿{formatNumber(sellingPrice)}
                  </span>
                </div>

                {/* 100% Horizontal Stacked Bar */}
                <div className="space-y-2">
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-800/40 p-0.5">
                    {segments.map((seg) =>
                      seg.percent > 0 ? (
                        <div
                          key={seg.key}
                          style={{
                            width: `${Math.max(seg.percent, 2)}%`,
                            backgroundColor: seg.color,
                          }}
                          className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                          title={`${seg.label}: ฿${formatNumber(seg.amount)} (${formatNumber(seg.percent, 1)}%)`}
                        />
                      ) : null
                    )}
                  </div>
                </div>

                {/* SVG Donut Chart + Breakdown Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-6 pt-2">
                  <div className="sm:col-span-5 flex justify-center">
                    <div className="relative flex items-center justify-center">
                      <svg
                        viewBox="0 0 160 160"
                        className="h-40 w-40 -rotate-90 transform"
                      >
                        <circle
                          cx="80"
                          cy="80"
                          r={donutRadius}
                          fill="transparent"
                          stroke={isDark ? "#18181b" : "#e2e8f0"}
                          strokeWidth="18"
                        />
                        {
                          segments.reduce<{
                            offset: number;
                            elements: React.ReactNode[];
                          }>(
                            (acc, seg) => {
                              const dash =
                                (Math.max(0, seg.percent) / 100) *
                                donutCircumference;
                              const el =
                                dash > 0 ? (
                                  <circle
                                    key={seg.key}
                                    cx="80"
                                    cy="80"
                                    r={donutRadius}
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="18"
                                    strokeDasharray={`${dash} ${donutCircumference}`}
                                    strokeDashoffset={-acc.offset}
                                    className="transition-all duration-300"
                                  />
                                ) : null;
                              return {
                                offset: acc.offset + dash,
                                elements: [...acc.elements, el],
                              };
                            },
                            { offset: 0, elements: [] }
                          ).elements
                        }
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={`text-[11px] ${subtleText}`}>ราคาขาย</span>
                        <span className="text-sm font-bold font-mono">
                          ฿{formatNumber(sellingPrice, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-7 grid grid-cols-1 gap-2.5">
                    {segments.map((seg) => (
                      <div
                        key={seg.key}
                        className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm ${subCardBg}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-3 w-3 rounded-full shrink-0 ${seg.dotClass}`}
                          />
                          <span className="font-medium">{seg.label}</span>
                        </div>
                        <div className="font-mono text-right">
                          <span className="font-semibold">
                            ฿{formatNumber(seg.amount)}
                          </span>{" "}
                          <span className={`text-xs ${subtleText}`}>
                            ({formatNumber(seg.percent, 1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: #history (Cloud Save & History) */}
        <section id="history" className="scroll-mt-24 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                  Supabase Cloud Database
                </span>
                {user && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        realtimeConnected
                          ? "bg-emerald-400 animate-pulse"
                          : "bg-amber-400"
                      }`}
                    />
                    {realtimeConnected ? "Realtime Sync" : "Cloud Connected"}
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                บันทึกและประวัติการคำนวณบน Cloud
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                <span>บันทึกการคำนวณลง Cloud</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs sm:text-sm font-semibold transition ${
                  isDark
                    ? "border-zinc-800 bg-zinc-950 text-zinc-200 hover:bg-zinc-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Download className="h-4 w-4" />
                <span>ส่งออกไฟล์ CSV</span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() => fetchCalculations(user.id)}
                  disabled={historyLoading}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${
                    isDark
                      ? "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${historyLoading ? "animate-spin" : ""}`}
                  />
                  <span>รีเฟรช</span>
                </button>
              )}
            </div>
          </div>

          {dbError && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-400"
            >
              {dbError}
            </div>
          )}

          {dbSuccess && (
            <div
              role="status"
              className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
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

          {!user ? (
            <div
              className={`rounded-3xl border p-8 sm:p-10 text-center space-y-4 ${cardBg}`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                เข้าสู่ระบบเพื่อบันทึกและซิงก์รายการคำนวณบน Cloud
              </h3>
              <p className={`mx-auto max-w-lg text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                ข้อมูลสินค้าที่คุณกำลังกรอกในเครื่องมือคำนวณด้านบนจะไม่สูญหาย เมื่อเข้าสู่ระบบแล้วคุณสามารถกดบันทึกเก็บไว้ในฐานข้อมูลส่วนตัว (ป้องกันด้วยระบบ Row Level Security) เพื่อโหลดกลับมาปรับราคาได้ตลอดเวลา
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setAuthNotice(null);
                    setAuthModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400"
                >
                  <LogIn className="h-4 w-4" />
                  <span>เข้าสู่ระบบเพื่อบันทึกข้อมูล</span>
                </button>
              </div>
            </div>
          ) : historyLoading && calculations.length === 0 ? (
            <div className={`rounded-3xl border p-12 text-center ${cardBg}`}>
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-emerald-500 mb-3" />
              <p className={`text-sm ${mutedText}`}>
                กำลังดึงประวัติการคำนวณจาก Supabase Cloud...
              </p>
            </div>
          ) : calculations.length === 0 ? (
            <div
              className={`rounded-3xl border border-dashed p-12 text-center space-y-3 ${cardBg}`}
            >
              <Layers className="mx-auto h-8 w-8 text-emerald-500/70" />
              <h3 className="text-base font-semibold">
                ยังไม่มีประวัติการคำนวณที่บันทึกไว้บน Cloud
              </h3>
              <p className={`text-xs sm:text-sm ${mutedText}`}>
                กดปุ่ม “บันทึกการคำนวณนี้ลง Cloud” เพื่อเก็บโครงสร้างราคาของสินค้าปัจจุบันไว้ดูย้อนหลัง
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {calculations.map((item) => {
                const cPrice = Number(item.cost_price);
                const pCost = Number(item.packaging_cost);
                const aCost = Number(item.ads_cost);
                const feePct = Number(item.platform_fee_percent);
                const sPrice = Number(item.selling_price);
                const fCost = Number(item.fixed_cost);
                const feeBaht = sPrice * (feePct / 100);
                const totalUnitCost = cPrice + pCost + aCost + feeBaht;
                const unitProfit = sPrice - totalUnitCost;
                const marginPct = sPrice > 0 ? (unitProfit / sPrice) * 100 : 0;
                const beUnits =
                  unitProfit > 0 ? Math.ceil(fCost / unitProfit) : null;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-all hover:border-emerald-500/40 ${cardBg}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="inline-flex items-center rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                            {item.platform} ({feePct}%)
                          </span>
                          <span className={`text-xs ${subtleText}`}>
                            {new Date(item.created_at).toLocaleString("th-TH")}
                          </span>
                        </div>
                        <h3 className="text-base font-bold truncate">
                          {item.product_name}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-xl px-3 py-1 font-mono text-xs font-bold ${
                          unitProfit >= 0
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {unitProfit >= 0 ? "+" : "-"}฿
                        {formatNumber(Math.abs(unitProfit))} / ชิ้น
                      </span>
                    </div>

                    <div
                      className={`grid grid-cols-3 gap-2 rounded-xl border p-3 text-xs font-mono mb-4 ${subCardBg}`}
                    >
                      <div>
                        <span className={`block font-sans ${subtleText}`}>
                          ราคาขาย
                        </span>
                        <span className="font-semibold">
                          ฿{formatNumber(sPrice)}
                        </span>
                      </div>
                      <div>
                        <span className={`block font-sans ${subtleText}`}>
                          ต้นทุนรวม/ชิ้น
                        </span>
                        <span className="font-semibold">
                          ฿{formatNumber(totalUnitCost)}
                        </span>
                      </div>
                      <div>
                        <span className={`block font-sans ${subtleText}`}>
                          Margin / คุ้มทุน
                        </span>
                        <span className="font-semibold">
                          {formatNumber(marginPct, 1)}% (
                          {beUnits !== null ? `${beUnits} ชิ้น` : "ไม่คุ้มทุน"})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadCalculation(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500 hover:text-slate-950"
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>โหลดตัวเลขกลับมาคำนวณต่อ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCalculation(item.id)}
                        disabled={deletingId === item.id}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>
                          {deletingId === item.id ? "กำลังลบ..." : "ลบ"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* AUTH MODAL (preserves calculator inputs in background) */}
      {authModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <div
            className={`relative w-full max-w-md rounded-3xl border p-6 sm:p-8 shadow-2xl ${
              isDark
                ? "border-zinc-800 bg-[#050505] text-zinc-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
              className={`absolute right-4 top-4 rounded-xl p-2 transition ${
                isDark
                  ? "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                <Lock className="h-6 w-6" />
              </div>
              <h2 id="auth-modal-title" className="text-xl font-bold">
                {mode === "login"
                  ? "เข้าสู่ระบบ E-Com MarginLab"
                  : "สมัครสมาชิกใหม่"}
              </h2>
              <p className={`mt-1 text-xs sm:text-sm ${mutedText}`}>
                ข้อมูลที่คุณกรอกค้างไว้ในหน้าคำนวณจะไม่หายหลังล็อกอิน
              </p>
            </div>

            <div
              className={`grid grid-cols-2 rounded-xl p-1 border mb-5 ${
                isDark
                  ? "bg-[#000000] border-zinc-800"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setAuthError(null);
                  setAuthNotice(null);
                }}
                className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : mutedText
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setAuthError(null);
                  setAuthNotice(null);
                }}
                className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : mutedText
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            {authError && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs sm:text-sm text-rose-400"
              >
                {authError}
              </div>
            )}

            {authNotice && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-400"
              >
                {authNotice}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="modal-email"
                  className="block text-xs sm:text-sm font-medium mb-1.5"
                >
                  อีเมล
                </label>
                <input
                  id="modal-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={authLoading}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputBg}`}
                />
              </div>

              <div>
                <label
                  htmlFor="modal-password"
                  className="block text-xs sm:text-sm font-medium mb-1.5"
                >
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    disabled={authLoading}
                    className={`w-full rounded-xl border px-3.5 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 ${inputBg}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 ${mutedText}`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                <span>
                  {authLoading
                    ? "กำลังดำเนินการ..."
                    : mode === "login"
                      ? "เข้าสู่ระบบ"
                      : "สมัครสมาชิก"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
