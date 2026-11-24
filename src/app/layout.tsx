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
  applicationName: "KhumLab",
  title: {
    default:
      "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
    template: "%s | KhumLab",
  },
  description:
    "KhumLab เครื่องมือคำนวณต้นทุนจริง ตั้งราคาขาย หักค่า GP แพลตฟอร์ม (Shopee, TikTok Shop, Lazada) จำลองโปรโมชัน และวิเคราะห์จุดคุ้มทุน | Real-cost E-Commerce profit calculator, break-even analytics, and flash sale simulator.",
  keywords: [
    "KhumLab",
    "khumlab",
    "เว็บคำนวณต้นทุน",
    "คำนวณกำไร Shopee TikTok Lazada",
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
    canonical: "https://khumlab.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
  },
  // CRITICAL: Do NOT delete or modify — required for Google Search Console indexing
  verification: {
    google: "JEcBvWHZNHzyVdzt5HthC8q1MEl_Uegpb90xvexdm7Q",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
    description:
      "KhumLab คำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ขายออนไลน์ พร้อมระบบคลาวด์เก็บข้อมูล | E-Commerce Profit & Break-Even Intelligence.",
    url: "https://khumlab.vercel.app/",
    siteName: "KhumLab",
    locale: "th_TH",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KhumLab — เครื่องมือคำนวณต้นทุน ราคาขาย และวิเคราะห์กำไร E-Commerce",
    description:
      "KhumLab คำนวณต้นทุนจริง ตั้งราคาขาย จำลองส่วนลดโปรโมชัน และวิเคราะห์จุดคุ้มทุนสำหรับผู้ขายออนไลน์ | E-Commerce Profit & Break-Even Intelligence.",
  },
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://khumlab.vercel.app/#website",
  name: "KhumLab",
  alternateName: [
    "KhumLab Thailand",
    "เว็บไซต์คำนวณต้นทุนและกำไร KhumLab",
  ],
  url: "https://khumlab.vercel.app/",
  inLanguage: ["th-TH", "en-US"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(WEBSITE_JSON_LD),
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
        <ClickRipple />
      </body>
    </html>
  );
}
