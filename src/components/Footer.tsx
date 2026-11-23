"use client";

import Link from "next/link";
import { useAppLanguage } from "@/lib/language";
import { KhumLabLogo } from "@/components/KhumLabLogo";

interface FooterProps {
  isAuthenticated?: boolean;
}

export function Footer({ isAuthenticated = false }: FooterProps) {
  const [language] = useAppLanguage();
  const isEn = language === "en";
  const homeHref = isAuthenticated ? "/?landing=1" : "/";

  const handleScrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-20 w-full border-t border-zinc-800 bg-zinc-900 text-zinc-300">
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-16 py-12 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 pb-10 border-b border-zinc-800">
          <div className="md:col-span-6 space-y-4">
            <Link
              href={homeHref}
              onClick={handleScrollTop}
              className="inline-flex items-center gap-3 group focus:outline-none"
            >
              <KhumLabLogo size={36} />
              <div>
                <span className="text-lg font-bold tracking-tight text-zinc-100 block leading-none">
                  KhumLab
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  E-Commerce Profit & Break-Even Intelligence
                </span>
              </div>
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400">
              {isEn
                ? "Real-cost pricing calculator, flash sale discount simulator, and break-even analytics platform built for online sellers — complete with private Cloud persistence."
                : "เครื่องมือคำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ประกอบการร้านค้าออนไลน์ พร้อมระบบบันทึกข้อมูลส่วนตัวบน Cloud"}
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-100">
              {isEn ? "Navigation" : "เมนูการใช้งาน"}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link
                  href={homeHref}
                  onClick={handleScrollTop}
                  className="transition-colors hover:text-emerald-400"
                >
                  {isEn ? "Home" : "หน้าหลัก"}
                </Link>
              </li>
              <li>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  className="transition-colors hover:text-emerald-400"
                >
                  {isEn ? "Pricing Calculator" : "เครื่องมือคำนวณราคา"}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-emerald-400"
                >
                  {isEn ? "Sign In / Register" : "เข้าสู่ระบบ / สมัครสมาชิก"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-100">
              {isEn ? "Key Features" : "ฟีเจอร์หลัก"}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                {isEn
                  ? "Automatic marketplace GP calculation"
                  : "คำนวณค่า GP แพลตฟอร์มอัตโนมัติ"}
              </li>
              <li>
                {isEn
                  ? "Net margin & break-even diagnostics"
                  : "วิเคราะห์กำไรสุทธิและจุดคุ้มทุน"}
              </li>
              <li>
                {isEn
                  ? "0%–50% promo discount simulator"
                  : "จำลองจัดโปรโมชันลดราคา 0%–50%"}
              </li>
              <li>
                {isEn
                  ? "Private Cloud sync & custom CSV export"
                  : "บันทึกข้อมูลบน Cloud & ส่งออก CSV"}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-zinc-400">
          <p>
            {isEn
              ? "Built as a Digital for E-Commerce course project."
              : "เว็บไซต์นี้จัดทำขึ้นเป็นโปรเจกต์ในวิชาดิจิทัลฟอร์อีคอมเมิร์ซ"}
          </p>
          <p className="font-medium text-emerald-400">
            {isEn
              ? "Free to use for as long as the creator can keep the servers running."
              : "เปิดให้ใช้งานฟรีแบบยาวๆ จนกว่าคนสร้างจะไม่มีตังค์"}
          </p>
        </div>
      </div>
    </footer>
  );
}
