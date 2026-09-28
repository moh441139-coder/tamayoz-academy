import type { NextRequest } from "next/server";
import { handler, ok, rateLimit } from "@/lib/api";
import { isRedisConfigured, kv } from "@/lib/kv";
import { isBlobConfigured } from "@/lib/images";

export const dynamic = "force-dynamic";

export const GET = handler(async (req: NextRequest) => {
  await rateLimit(req, "health", 30, 60, false);
  let redis: "ok" | "memory" | "error" = isRedisConfigured() ? "ok" : "memory";
  if (redis === "ok") {
    try {
      await kv().get("settings");
    } catch {
      redis = "error";
    }
  }
  return ok({
    redis,
    blob: isBlobConfigured() ? "ok" : "missing",
    adminPassword: !!process.env.ADMIN_PASSWORD,
    time: new Date().toISOString(),
  });
});
