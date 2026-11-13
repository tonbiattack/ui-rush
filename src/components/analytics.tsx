import { CF_BEACON_TOKEN } from "@/lib/analytics";

/**
 * Cloudflare Web Analytics のビーコン。
 * 訪問状況だけを計測し、Cookie は使わず個人情報も送らない。
 * 開発中は計測しないよう、本番ビルドのときだけ出力する。
 *
 * type="module" のため読み込みは遅延され、描画をブロックしない。
 * 静的書き出しのHTMLに直接含めたいので、next/script ではなく素の script タグで出力する。
 */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-sync-scripts
    <script
      type="module"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
    />
  );
}
