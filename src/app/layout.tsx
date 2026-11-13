import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const display = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const sans = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UI Rush | UI用語を数秒で覚えるクイズ",
  description:
    "UIコンポーネントの名称・読み・説明を4択で答えるクイズ。操作できるデモを見て回答する。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1f2ed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 pb-8 pt-5 sm:px-6 sm:pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}
