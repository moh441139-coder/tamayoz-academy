/**
 * جلسات المشرف الموقّعة بـ HMAC-SHA256 عبر Web Crypto
 * (تعمل في Edge Middleware وفي Node.js).
 */
export const SESSION_COOKIE = "tamayoz_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 ساعة

const encoder = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function secret(): string | null {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  const pw = process.env.ADMIN_PASSWORD;
  // اشتقاق السر من كلمة المرور يعني أن تغييرها يبطل كل الجلسات
  return pw ? `tamayoz-session::${pw}` : null;
}

async function hmac(data: string, key: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, encoder.encode(data)));
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD is not configured");
  const now = Math.floor(Date.now() / 1000);
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  const payload = b64url(encoder.encode(JSON.stringify({ iat: now, exp: now + SESSION_TTL_SECONDS, n: b64url(nonce) })));
  const sig = b64url(await hmac(payload, key));
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  try {
    const key = secret();
    if (!key || !token) return false;
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expected = await hmac(payload, key);
    if (!timingSafeEqual(expected, fromB64url(sig))) return false;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** مقارنة كلمة المرور بزمن ثابت */
export async function checkPassword(input: string): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = await hmac(input, "tamayoz-pw-compare");
  const b = await hmac(pw, "tamayoz-pw-compare");
  return timingSafeEqual(a, b);
}
