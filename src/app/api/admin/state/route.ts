import type { NextRequest } from "next/server";
import { handler, ok, rateLimit, requireAdmin } from "@/lib/api";
import { getAdminState } from "@/lib/admin-state";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await requireAdmin();
  await rateLimit(req, "admin-state", 120, 60, false);
  return ok(await getAdminState());
});
