import type { NextRequest } from "next/server";
import { assertSameOrigin, handler, ok, rateLimit, requireAdmin } from "@/lib/api";
import { announceWinners, hideWinners } from "@/lib/store";

export const dynamic = "force-dynamic";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  const winners = await announceWinners();
  return ok({ message: "تم إعلان الفائزين 🎉", winners });
});

export const DELETE = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await requireAdmin();
  await rateLimit(req, "admin-write", 120, 60);
  await hideWinners();
  return ok({ message: "تم إخفاء الفائزين" });
});
