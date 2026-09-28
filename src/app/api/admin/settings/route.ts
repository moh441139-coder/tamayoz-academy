import type { NextRequest } from "next/server";
import { assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { settingsUpdateSchema } from "@/lib/schemas";
import { getMatch, getPlayers, getSettings, saveMatch, saveSettings, topVotedPlayerId } from "@/lib/store";

export const dynamic = "force-dynamic";

export const PATCH = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  const body = settingsUpdateSchema.parse(await readJson(req));
  const current = await getSettings();
  const next = { ...current, ...body };

  let manOfMatchId: string | null | undefined;
  if (body.votingOpen === true) {
    next.votingClosedAt = null;
  }
  if (body.votingOpen === false && current.votingOpen) {
    // عند إغلاق التصويت: إعلان رجل المباراة صاحب أعلى أصوات
    next.votingClosedAt = Date.now();
    const [players, match] = await Promise.all([getPlayers(), getMatch()]);
    manOfMatchId = await topVotedPlayerId(players);
    if (manOfMatchId) await saveMatch({ ...match, manOfMatchId });
  }
  await saveSettings(next);
  return ok({ message: "تم التحديث", settings: next, manOfMatchId: manOfMatchId ?? null });
});
