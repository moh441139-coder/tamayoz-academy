import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

import { DEVICE_COOKIE } from "@/lib/device";

function withDeviceCookie(req: NextRequest, res: NextResponse): NextResponse {
  if (!req.cookies.get(DEVICE_COOKIE)?.value) {
    res.cookies.set(DEVICE_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApi = pathname.startsWith("/api/admin/");
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

    if (isLoginPage) {
      if (authed) return NextResponse.redirect(new URL("/admin", req.url));
      return noIndex(NextResponse.next());
    }
    if (isLoginApi) return NextResponse.next();

    if (!authed) {
      if (isAdminApi) {
        return NextResponse.json(
          { ok: false, error: { code: "UNAUTHORIZED", message: "غير مصرح، سجّل الدخول أولاً" } },
          { status: 401, headers: { "Cache-Control": "no-store" } },
        );
      }
      const url = new URL("/admin/login", req.url);
      return NextResponse.redirect(url);
    }
    return noIndex(NextResponse.next());
  }

  if (pathname.startsWith("/api/")) return NextResponse.next();
  return withDeviceCookie(req, NextResponse.next());
}

function noIndex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|og.png).*)"],
};
