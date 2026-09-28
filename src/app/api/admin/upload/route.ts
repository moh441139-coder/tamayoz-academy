import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { deleteImages, processImage, uploadImage } from "@/lib/images";
import { uploadTargetSchema } from "@/lib/schemas";
import { getMatch, getPlayers, saveMatch, savePlayers } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

/** رفع صورة (شعار أو لاعب): multipart/form-data مع file + kind + side|playerId */
export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-upload", 40, 60);

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > 6 * 1024 * 1024) throw new ApiError(413, "حجم الصورة يتجاوز 5 ميجابايت", "FILE_TOO_LARGE");

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "لم يتم إرفاق صورة", "NO_FILE");
  const target = uploadTargetSchema.parse({
    kind: form.get("kind"),
    side: form.get("side") ?? undefined,
    playerId: form.get("playerId") ?? undefined,
  });

  const buffer = await processImage(file);

  if (target.kind === "logo") {
    const match = await getMatch();
    const url = await uploadImage(buffer, "logos", target.side);
    const old = match[target.side].logo;
    await saveMatch({ ...match, [target.side]: { ...match[target.side], logo: url } });
    await deleteImages([old]);
    return ok({ message: "تم رفع الشعار", url }, { status: 201 });
  }

  const players = await getPlayers();
  const idx = players.findIndex((p) => p.id === target.playerId);
  if (idx === -1) throw new ApiError(404, "اللاعب غير موجود", "PLAYER_NOT_FOUND");
  const url = await uploadImage(buffer, "players", `${target.playerId}-${players[idx]!.number}`);
  const old = players[idx]!.photo;
  players[idx] = { ...players[idx]!, photo: url };
  await savePlayers(players);
  await deleteImages([old]);
  return ok({ message: "تم رفع صورة اللاعب", url }, { status: 201 });
});

/** حذف صورة: JSON { kind, side|playerId } */
export const DELETE = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  const target = uploadTargetSchema.parse(await readJson(req));

  if (target.kind === "logo") {
    const match = await getMatch();
    const old = match[target.side].logo;
    await saveMatch({ ...match, [target.side]: { ...match[target.side], logo: null } });
    await deleteImages([old]);
    return ok({ message: "تم حذف الشعار" });
  }

  const players = await getPlayers();
  const idx = players.findIndex((p) => p.id === target.playerId);
  if (idx === -1) throw new ApiError(404, "اللاعب غير موجود", "PLAYER_NOT_FOUND");
  const old = players[idx]!.photo;
  players[idx] = { ...players[idx]!, photo: null };
  await savePlayers(players);
  await deleteImages([old]);
  return ok({ message: "تم حذف الصورة" });
});
