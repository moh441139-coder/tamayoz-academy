import type { NextRequest } from "next/server";
import { handler, ok, rateLimit } from "@/lib/api";
import { getPublicState } from "@/lib/store";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await rateLimit(req, "state", 240, 60, false);
  const state = await getPublicState();
  return ok(state, { cache: "public, max-age=0, s-maxage=2, stale-while-revalidate=4" });
});
