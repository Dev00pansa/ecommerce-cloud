import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClickRipple } from "@/components/ClickRipple";
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
  metadataBase: new URL("https://khumlab.vercel.app"),
  title: "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
  description:
    "KhumLab เครื่องมือคำนวณต้นทุนจริง ตั้งราคาขาย หักค่า GP แพลตฟอร์ม (Shopee, TikTok Shop, Lazada) จำลองโปรโมชัน และวิเคราะห์จุดคุ้มทุน | Real-cost E-Commerce profit calculator, break-even analytics, and flash sale simulator.",
  keywords: [
    "KhumLab",
    "คำนวณต้นทุน",
    "คำนวณกำไร",
    "ตั้งราคาขาย",
    "คำนวณค่า GP Shopee",
    "คำนวณราคาขาย TikTok Shop",
    "วิเคราะห์จุดคุ้มทุน",
    "E-Commerce profit calculator",
    "break-even calculator",
  ],
  alternates: {
    canonical: "https://khumlab.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "JEcBvWHZNHzyVdzt5HthC8q1MEl_Uegpb90xvexdm7Q",
  },
  icons: {
    icon: "/images/khumlab-logo.svg",
  },
  openGraph: {
    title: "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
    description:
      "คำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ขายออนไลน์ พร้อมระบบคลาวด์เก็บข้อมูล | E-Commerce Profit & Break-Even Intelligence.",
    url: "https://khumlab.vercel.app",
    siteName: "KhumLab",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
    description:
      "คำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ขายออนไลน์ | E-Commerce Profit & Break-Even Intelligence.",
  },
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("khumlab_theme");if(t==="dark"){document.documentElement.classList.remove("light");document.documentElement.setAttribute("data-theme","dark");}else{document.documentElement.classList.add("light");document.documentElement.setAttribute("data-theme","light");}}catch(e){document.documentElement.classList.add("light");document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      data-theme="light"
      suppressHydrationWarning
      className={`${ibmPlexThai.variable} ${jetbrainsMono.variable} light h-full scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <ClickRipple />
      </body>
    </html>
  );
}
