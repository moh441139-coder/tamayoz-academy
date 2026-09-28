import type { NextRequest } from "next/server";
import { ApiError, assertSameOrigin, handler, ok, rateLimit, readJson } from "@/lib/api";
import { loginSchema } from "@/lib/schemas";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from "@/lib/session";

export const dynamic = "force-dynamic";

export const POST = handler(async (req: NextRequest) => {
  assertSameOrigin(req);
  await rateLimit(req, "admin-login", 5, 300);
  if (!process.env.ADMIN_PASSWORD) {
    throw new ApiError(503, "لم يتم ضبط ADMIN_PASSWORD على الخادم", "ADMIN_NOT_CONFIGURED");
  }
  const { password } = loginSchema.parse(await readJson(req));
  if (!(await checkPassword(password))) {
    throw new ApiError(401, "كلمة المرور غير صحيحة", "INVALID_PASSWORD");
  }
  const res = ok({ message: "تم تسجيل الدخول" });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
});
