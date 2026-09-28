import type { NextRequest } from "next/server";
import { handler, rateLimit, requireAdmin } from "@/lib/api";
import { exportSchema } from "@/lib/schemas";
import { getMatch, getPlayers, getWinners, listPredictions, listVotes } from "@/lib/store";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  // حماية من CSV injection
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(header: string[], rows: unknown[][]): string {
  return "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

const fmt = (ts: number) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Riyadh" }).format(
    new Date(ts),
  );

export const GET = handler(async (req: NextRequest) => {
  await requireAdmin();
  await rateLimit(req, "admin-export", 30, 60);
  const { type } = exportSchema.parse({ type: req.nextUrl.searchParams.get("type") });
  const match = await getMatch();
  let csv: string;

  if (type === "predictions") {
    const list = await listPredictions();
    const sign = (n: number) => Math.sign(n);
    csv = toCsv(
      ["#", "الاسم", "الجوال", match.home.shortName, match.away.shortName, "توقع صحيح", "توقع الفائز", "الوقت"],
      list.map((p, i) => [
        i + 1,
        p.name,
        p.phone,
        p.home,
        p.away,
        p.home === match.homeScore && p.away === match.awayScore ? "نعم" : "لا",
        sign(p.home - p.away) === sign(match.homeScore - match.awayScore) ? "نعم" : "لا",
        fmt(p.createdAt),
      ]),
    );
  } else if (type === "votes") {
    const [votes, players] = await Promise.all([listVotes(), getPlayers()]);
    const byId = new Map(players.map((p) => [p.id, p]));
    csv = toCsv(
      ["#", "الجوال", "رقم اللاعب", "اسم اللاعب", "الوقت"],
      votes.map((v, i) => [i + 1, v.phone, byId.get(v.playerId)?.number ?? "", byId.get(v.playerId)?.name ?? "محذوف", fmt(v.createdAt)]),
    );
  } else {
    const w = await getWinners();
    const rows: unknown[][] = [];
    w?.exact.forEach((e) => rows.push(["توقع صحيح", e.name, e.maskedPhone, `${e.home}-${e.away}`]));
    w?.outcome.forEach((e) => rows.push(["توقع الفائز", e.name, e.maskedPhone, `${e.home}-${e.away}`]));
    csv = toCsv(["الفئة", "الاسم", "الجوال", "التوقع"], rows);
  }

  const filename = `tamayoz-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});
