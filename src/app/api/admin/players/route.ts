import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { deleteImages } from "@/lib/images";
import { playerCreateSchema, playerDeleteSchema, playerUpdateSchema } from "@/lib/schemas";
import { getFormation, getMatch, getPlayers, saveFormation, saveMatch, savePlayers } from "@/lib/store";
import type { Player } from "@/lib/types";

export const dynamic = "force-dynamic";

function assertUniqueNumber(players: Player[], number: number, exceptId?: string) {
  if (players.some((p) => p.number === number && p.id !== exceptId)) {
    throw new ApiError(409, `الرقم ${number} مستخدم للاعب آخر`, "DUPLICATE_NUMBER");
  }
}

async function guard(req: NextRequest) {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
}

export const POST = handler(async (req: NextRequest) => {
  await guard(req);
  const body = playerCreateSchema.parse(await readJson(req));
  const players = await getPlayers();
  if (players.length >= 40) throw new ApiError(400, "وصلت للحد الأقصى من اللاعبين", "TOO_MANY_PLAYERS");
  assertUniqueNumber(players, body.number);
  const player: Player = { id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, ...body, photo: null };
  await savePlayers([...players, player]);
  return ok({ message: "تمت إضافة اللاعب", player }, { status: 201 });
});

export const PATCH = handler(async (req: NextRequest) => {
  await guard(req);
  const body = playerUpdateSchema.parse(await readJson(req));
  const players = await getPlayers();
  const idx = players.findIndex((p) => p.id === body.id);
  if (idx === -1) throw new ApiError(404, "اللاعب غير موجود", "PLAYER_NOT_FOUND");
  if (body.number !== undefined) assertUniqueNumber(players, body.number, body.id);
  const updated: Player = {
    ...players[idx]!,
    ...(body.name !== undefined && { name: body.name }),
    ...(body.number !== undefined && { number: body.number }),
    ...(body.position !== undefined && { position: body.position }),
  };
  players[idx] = updated;
  await savePlayers(players);
  return ok({ message: "تم حفظ بيانات اللاعب", player: updated });
});

export const DELETE = handler(async (req: NextRequest) => {
  await guard(req);
  const { id } = playerDeleteSchema.parse(await readJson(req));
  const players = await getPlayers();
  const target = players.find((p) => p.id === id);
  if (!target) throw new ApiError(404, "اللاعب غير موجود", "PLAYER_NOT_FOUND");
  const remaining = players.filter((p) => p.id !== id);
  await savePlayers(remaining);
  const [formation, match] = await Promise.all([getFormation(players), getMatch()]);
  await saveFormation(formation, remaining);
  if (match.manOfMatchId === id) await saveMatch({ ...match, manOfMatchId: null });
  await deleteImages([target.photo]);
  return ok({ message: "تم حذف اللاعب" });
});
