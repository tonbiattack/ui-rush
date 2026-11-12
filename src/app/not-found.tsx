import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-bold">ページが見つかりません</h1>
      <Link
        href="/"
        className="focus-ring rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white"
      >
        ホームへ
      </Link>
    </main>
  );
}
