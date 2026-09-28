import "server-only";
import { Redis } from "@upstash/redis";

/**
 * طبقة تخزين موحدة: Upstash Redis في الإنتاج،
 * وذاكرة مؤقتة داخل العملية للتطوير المحلي عند غياب متغيرات البيئة.
 */
export interface KV {
  readonly persistent: boolean;
  get<T>(key: string): Promise<T | null>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }): Promise<boolean>;
  del(...keys: string[]): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  hincrby(key: string, field: string, by: number): Promise<number>;
  hgetall(key: string): Promise<Record<string, number>>;
  sadd(key: string, member: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
}

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function isRedisConfigured(): boolean {
  return redisCredentials() !== null;
}

function toNumberRecord(raw: Record<string, unknown> | null): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw) return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

class UpstashKV implements KV {
  readonly persistent = true;
  constructor(private readonly redis: Redis) {}

  get<T>(key: string) {
    return this.redis.get<T>(key);
  }
  async mget<T>(keys: string[]) {
    if (keys.length === 0) return [];
    const out: (T | null)[] = [];
    for (let i = 0; i < keys.length; i += 200) {
      const chunk = keys.slice(i, i + 200);
      const res = await this.redis.mget<(T | null)[]>(...chunk);
      out.push(...res);
    }
    return out;
  }
  async set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }) {
    let res: unknown;
    if (opts?.nx && opts.ex) res = await this.redis.set(key, value, { nx: true, ex: opts.ex });
    else if (opts?.nx) res = await this.redis.set(key, value, { nx: true });
    else if (opts?.ex) res = await this.redis.set(key, value, { ex: opts.ex });
    else res = await this.redis.set(key, value);
    return res === "OK";
  }
  del(...keys: string[]) {
    if (keys.length === 0) return Promise.resolve(0);
    return this.redis.del(...keys);
  }
  incr(key: string) {
    return this.redis.incr(key);
  }
  async expire(key: string, seconds: number) {
    await this.redis.expire(key, seconds);
  }
  hincrby(key: string, field: string, by: number) {
    return this.redis.hincrby(key, field, by);
  }
  async hgetall(key: string) {
    return toNumberRecord(await this.redis.hgetall<Record<string, unknown>>(key));
  }
  async sadd(key: string, member: string) {
    await this.redis.sadd(key, member);
  }
  async smembers(key: string) {
    return (await this.redis.smembers(key)).map(String);
  }
}

interface MemEntry {
  value: unknown;
  expiresAt: number | null;
}

class MemoryKV implements KV {
  readonly persistent = false;
  private store = new Map<string, MemEntry>();

  private read(key: string): unknown {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (e.expiresAt !== null && e.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return e.value;
  }
  private write(key: string, value: unknown, ex?: number) {
    this.store.set(key, { value, expiresAt: ex ? Date.now() + ex * 1000 : null });
  }
  private clone<T>(v: unknown): T {
    return v === undefined ? (null as T) : (JSON.parse(JSON.stringify(v)) as T);
  }

  async get<T>(key: string) {
    return this.clone<T | null>(this.read(key));
  }
  async mget<T>(keys: string[]) {
    return keys.map((k) => this.clone<T | null>(this.read(k)));
  }
  async set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }) {
    if (opts?.nx && this.read(key) !== undefined) return false;
    this.write(key, this.clone(value), opts?.ex);
    return true;
  }
  async del(...keys: string[]) {
    let n = 0;
    for (const k of keys) if (this.store.delete(k)) n++;
    return n;
  }
  async incr(key: string) {
    const cur = Number(this.read(key) ?? 0) + 1;
    const e = this.store.get(key);
    this.store.set(key, { value: cur, expiresAt: e?.expiresAt ?? null });
    return cur;
  }
  async expire(key: string, seconds: number) {
    const e = this.store.get(key);
    if (e) e.expiresAt = Date.now() + seconds * 1000;
  }
  async hincrby(key: string, field: string, by: number) {
    const h = (this.read(key) as Record<string, number> | undefined) ?? {};
    h[field] = (h[field] ?? 0) + by;
    this.write(key, h);
    return h[field];
  }
  async hgetall(key: string) {
    return toNumberRecord((this.read(key) as Record<string, unknown> | undefined) ?? null);
  }
  async sadd(key: string, member: string) {
    const s = new Set((this.read(key) as string[] | undefined) ?? []);
    s.add(member);
    this.write(key, Array.from(s));
  }
  async smembers(key: string) {
    return [...((this.read(key) as string[] | undefined) ?? [])];
  }
}

const globalForKV = globalThis as unknown as { __tamayozKV?: KV; __tamayozKVWarned?: boolean };

export function kv(): KV {
  if (globalForKV.__tamayozKV) return globalForKV.__tamayozKV;
  const creds = redisCredentials();
  if (creds) {
    globalForKV.__tamayozKV = new UpstashKV(new Redis({ url: creds.url, token: creds.token }));
  } else {
    if (process.env.NODE_ENV === "production" && !globalForKV.__tamayozKVWarned) {
      console.warn(
        "[kv] Upstash Redis غير مهيأ — يتم استخدام ذاكرة مؤقتة غير دائمة. أضف UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN.",
      );
      globalForKV.__tamayozKVWarned = true;
    }
    globalForKV.__tamayozKV = new MemoryKV();
  }
  return globalForKV.__tamayozKV;
}
