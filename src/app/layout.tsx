import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CursorGlow } from "@/components/CursorGlow";
import "./globals.css";

const ibmPlexThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-ibm-plex-thai",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "KhumLab | ระบบคำนวณต้นทุน ตั้งราคาขาย และจุดคุ้มทุน E-Commerce",
  description:
    "KhumLab เว็บแอปพลิเคชันคำนวณต้นทุน ตั้งราคาขาย จำลองโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ประกอบการ E-Commerce พร้อมบันทึกข้อมูลส่วนตัวบน Cloud",
  icons: {
    icon: "/images/khumlab-logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${ibmPlexThai.variable} ${jetbrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <CursorGlow />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
