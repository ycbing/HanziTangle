import Link from "next/link";
import { generatePuzzle } from "@/lib/hanzi/generator";
import PuzzleArchive, { type ArchiveMonth } from "@/components/puzzle/PuzzleArchive";

export const revalidate = 3600;

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Shanghai" });
}

const ARCHIVE_DAYS = 365;

export default function ArchivePage() {
  const today = todayStr();
  const byMonth = new Map<string, ArchiveMonth>();

  for (let back = ARCHIVE_DAYS - 1; back >= 0; back--) {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - back);
    const key = d.toISOString().slice(0, 7);
    if (!byMonth.has(key)) {
      const m: ArchiveMonth = { year: d.getUTCFullYear(), month: d.getUTCMonth(), days: [] };
      const lead = (new Date(Date.UTC(m.year, m.month, 1)).getUTCDay() + 6) % 7;
      for (let i = 0; i < lead; i++) m.days.push(null);
      byMonth.set(key, m);
    }
  }

  for (let back = ARCHIVE_DAYS - 1; back >= 0; back--) {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - back);
    const date = d.toISOString().slice(0, 10);
    const m = byMonth.get(date.slice(0, 7))!;
    const puzzle = generatePuzzle(date);
    m.days.push({ date, day: d.getUTCDate(), theme: puzzle.theme });
  }

  const months = [...byMonth.values()];

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-teal-100 text-stone-800 dark:from-stone-900 dark:to-stone-950 dark:text-stone-100">
      <header className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-sm text-white shadow">
            字
          </span>
          <span className="text-lg">字缠</span>
        </Link>
        <Link
          href="/"
          className="rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold text-stone-600 shadow-sm hover:bg-white dark:bg-white/10 dark:text-stone-300"
        >
          ← 今天的题
        </Link>
      </header>
      <PuzzleArchive months={months} />
    </main>
  );
}