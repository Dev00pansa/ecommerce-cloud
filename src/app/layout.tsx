import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Com MarginLab | ระบบคำนวณต้นทุน ตั้งราคาขาย และวิเคราะห์จุดคุ้มทุน E-Commerce",
  description:
    "เว็บแอปพลิเคชันคำนวณต้นทุน ตั้งราคาขาย จำลองโปรโมชันส่วนลด และวิเคราะห์จุดคุ้มทุนสำหรับผู้ประกอบการ E-Commerce พร้อมบันทึกข้อมูลบน Cloud",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
