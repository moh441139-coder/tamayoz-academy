import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { cookies } from "next/headers";
import { KEYS } from "./constants";
import { kv } from "./kv";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "ERROR",
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}
export interface ApiFailure {
  ok: false;
  error: { code: string; message: string; details?: unknown };
}

export function ok<T>(data: T, init?: ResponseInit & { cache?: string }) {
  const headers = new Headers(init?.headers);
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", init?.cache ?? "no-store");
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { ...init, headers });
}

export function fail(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json<ApiFailure>(
    { ok: false, error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/** غلاف موحّد لمعالجة الأخطاء في كل مسارات API */
export function handler<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, err.code, err.message, err.details);
      if (err instanceof ZodError) {
        return fail(
          400,
          "VALIDATION_ERROR",
          err.issues[0]?.message ?? "البيانات المرسلة غير صحيحة",
          err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        );
      }
      if (err instanceof SyntaxError) return fail(400, "BAD_JSON", "صيغة البيانات غير صحيحة");
      console.error("[api] unhandled error", err);
      return fail(500, "INTERNAL_ERROR", "حدث خطأ غير متوقع، حاول مرة أخرى");
    }
  };
}

export async function readJson(req: NextRequest): Promise<unknown> {
  const text = await req.text();
  if (text.length > 100_000) throw new ApiError(413, "البيانات كبيرة جداً", "PAYLOAD_TOO_LARGE");
  if (!text) return {};
  return JSON.parse(text);
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? req.ip ?? "unknown";
}

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting بنافذة زمنية ثابتة.
 * distributed=true يستخدم Redis (للعمليات الحساسة)، وإلا ذاكرة المثيل (للقراءة المتكررة).
 */
export async function rateLimit(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowSeconds: number,
  distributed = true,
): Promise<void> {
  const id = clientIp(req);
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  let count: number;
  if (distributed) {
    const key = KEYS.rateLimit(bucket, id, window);
    try {
      count = await kv().incr(key);
      if (count === 1) await kv().expire(key, windowSeconds + 5);
    } catch (e) {
      console.error("[ratelimit] kv failure, allowing request", e);
      return;
    }
  } else {
    const key = `${bucket}:${id}`;
    const now = Date.now();
    const entry = memoryBuckets.get(key);
    if (!entry || entry.resetAt <= now) {
      memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
      count = 1;
      if (memoryBuckets.size > 5000) {
        memoryBuckets.forEach((v, k) => {
          if (v.resetAt <= now) memoryBuckets.delete(k);
        });
      }
    } else {
      count = ++entry.count;
    }
  }
  if (count > limit) {
    throw new ApiError(429, "طلبات كثيرة، انتظر قليلاً ثم حاول مجدداً", "RATE_LIMITED");
  }
}

/** تحقق إضافي داخل مسارات المشرف (بالإضافة إلى Middleware) */
export async function requireAdmin(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    throw new ApiError(401, "غير مصرح، سجّل الدخول أولاً", "UNAUTHORIZED");
  }
}

/** حماية CSRF: الطلبات المعدِّلة يجب أن تأتي من نفس الأصل */
export function assertSameOrigin(req: NextRequest): void {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    if (new URL(origin).host !== host) {
      throw new ApiError(403, "طلب غير مسموح", "FORBIDDEN_ORIGIN");
    }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(403, "طلب غير مسموح", "FORBIDDEN_ORIGIN");
  }
}
