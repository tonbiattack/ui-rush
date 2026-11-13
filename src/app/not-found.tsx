import Link from "next/link";
import { Masthead } from "@/components/ui-kit";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <Masthead />
      <h1 className="text-xl font-bold">このページはありません</h1>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft">
        URLが変わったか、まだ作られていないページです。
      </p>
      <div className="mt-5">
        <Link href="/" className="focus-ring bg-ink px-5 py-3 text-sm font-bold text-paper">
          ホームへ
        </Link>
      </div>
    </main>
  );
}
