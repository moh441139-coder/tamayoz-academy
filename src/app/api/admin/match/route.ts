import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { matchUpdateSchema } from "@/lib/schemas";
import { getMatch, getPlayers, saveMatch } from "@/lib/store";

export const dynamic = "force-dynamic";

export const PATCH = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  const body = matchUpdateSchema.parse(await readJson(req));
  const match = await getMatch();

  if (body.manOfMatchId) {
    const players = await getPlayers();
    if (!players.some((p) => p.id === body.manOfMatchId)) {
      throw new ApiError(400, "اللاعب المحدد غير موجود", "INVALID_PLAYER");
    }
  }

  const next = {
    ...match,
    ...(body.date !== undefined && { date: body.date }),
    ...(body.startTime !== undefined && { startTime: body.startTime }),
    ...(body.endTime !== undefined && { endTime: body.endTime }),
    ...(body.venue !== undefined && { venue: body.venue }),
    ...(body.title !== undefined && { title: body.title }),
    ...(body.organizer !== undefined && { organizer: body.organizer }),
    ...(body.status !== undefined && { status: body.status }),
    ...(body.statusMode !== undefined && { statusMode: body.statusMode }),
    ...(body.homeScore !== undefined && { homeScore: body.homeScore }),
    ...(body.awayScore !== undefined && { awayScore: body.awayScore }),
    ...(body.manOfMatchId !== undefined && { manOfMatchId: body.manOfMatchId }),
    home: {
      ...match.home,
      ...(body.homeName !== undefined && { name: body.homeName }),
      ...(body.homeShortName !== undefined && { shortName: body.homeShortName }),
    },
    away: {
      ...match.away,
      ...(body.awayName !== undefined && { name: body.awayName }),
      ...(body.awayShortName !== undefined && { shortName: body.awayShortName }),
    },
  };
  // تغيير الحالة يدوياً يحوّل الوضع إلى يدوي تلقائياً
  if (body.status !== undefined && body.statusMode === undefined) next.statusMode = "manual";

  await saveMatch(next);
  return ok({ message: "تم الحفظ", match: next });
});
