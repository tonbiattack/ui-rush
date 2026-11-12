import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UI Rush | UI用語を数秒で覚えるクイズ",
  description:
    "UIコンポーネントの見た目・動き・名称を短時間で覚えるWebクイズ。操作できるデモを見て、4択で答える。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4338ca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ブラウザ拡張がhtml要素へ属性を足すことがあるため、この差分は警告しない。
    <html lang="ja" suppressHydrationWarning>
      <body>
        <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-6 pt-4 sm:px-6">
          {children}
        </div>
      </body>
    </html>
  );
}
