import type { NextRequest } from "next/server";
import { assertSameOrigin, handler, ok, rateLimit } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit(req, "admin-logout", 20, 60, false);
  const res = ok({ message: "تم تسجيل الخروج" });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "strict" });
  return res;
});
