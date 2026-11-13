import type { NextConfig } from "next";

/** GitHub Pages のプロジェクトページ（/<repo>/）でも動くよう、環境変数でベースパスを渡せる。 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 静的書き出し（GitHub Pages / Cloudflare Pages など、HTML/CSS/JS を置くだけのホスト向け）。
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
