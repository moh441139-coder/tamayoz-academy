import type { Metadata } from "next";
import Link from "next/link";
import { currentOrigin, qrSvg } from "@/lib/qr";
import { getMatch } from "@/lib/store";
import { formatArabicDate, formatArabicTime } from "@/lib/time";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "رمز QR",
  description: "امسح الرمز للدخول إلى موقع المباراة",
  alternates: { canonical: "/qr" },
};

export default async function QrPage() {
  const origin = currentOrigin();
  const [svg, match] = await Promise.all([qrSvg(origin), getMatch()]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center px-4 py-8 text-center print:py-0">
      <style>{`@page { size: A4 portrait; margin: 12mm; }`}</style>
      <div className="w-full rounded-[2rem] border border-white/10 bg-night-700/60 p-6 sm:p-10 print:border-2 print:border-[#0B5E5E] print:bg-white">
        <p className="text-sm font-bold text-tamayoz-neon print:text-[#0B5E5E]">{match.organizer}</p>
        <h1 className="mt-2 text-3xl font-black sm:text-5xl print:text-[#0A1414]">
          {match.home.name} 🆚 {match.away.name}
        </h1>
        <p className="mt-3 text-base text-white/70 print:text-[#333]">
          {formatArabicDate(match.date)} • {formatArabicTime(match.startTime)} • {match.venue}
        </p>

        <div
          className="mx-auto mt-8 aspect-square w-full max-w-[460px] rounded-3xl bg-white p-4 shadow-neon print:max-w-[130mm] print:shadow-none [&>svg]:h-full [&>svg]:w-full"
          aria-label={`رمز QR لرابط ${origin}`}
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <p className="mt-6 text-2xl font-black print:text-[#0A1414]">📱 امسح الرمز</p>
        <p className="mt-1 text-white/70 print:text-[#333]">توقع النتيجة • صوّت لرجل المباراة • شاهد التشكيلة</p>
        <p className="mt-4 break-all text-lg font-bold text-tamayoz-neon tabular print:text-[#0B5E5E]" dir="ltr">
          {origin.replace(/^https?:\/\//, "")}
        </p>
      </div>
      <div className="no-print mt-6 flex gap-3">
        <PrintButton />
        <Link href="/" className="btn-ghost">
          الرئيسية
        </Link>
      </div>
    </main>
  );
}
