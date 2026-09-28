import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson, requireAdmin } from "@/lib/api";
import { isValidShape } from "@/lib/formations";
import { formationSchema } from "@/lib/schemas";
import { getPlayers, saveFormation } from "@/lib/store";

export const dynamic = "force-dynamic";

export const PUT = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  const body = formationSchema.parse(await readJson(req));
  if (!isValidShape(body.size, body.shape)) throw new ApiError(400, "الخطة لا تناسب عدد اللاعبين", "INVALID_SHAPE");
  if (body.slots.length !== body.size) throw new ApiError(400, "عدد الخانات لا يطابق عدد اللاعبين", "INVALID_SLOTS");

  const assigned = body.slots.filter((s): s is string => !!s);
  if (new Set(assigned).size !== assigned.length) {
    throw new ApiError(400, "لا يمكن وضع نفس اللاعب في خانتين", "DUPLICATE_PLAYER");
  }
  const players = await getPlayers();
  const formation = await saveFormation(
    { ...body, subs: Array.from(new Set(body.subs)).filter((id) => !assigned.includes(id)) },
    players,
  );
  return ok({ message: "تم حفظ التشكيلة", formation });
});
