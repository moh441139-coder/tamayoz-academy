"use client";

export class ClientApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

type ApiBody<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

export async function apiFetch<T>(input: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  if (json !== undefined) headers.set("Content-Type", "application/json");
  let res: Response;
  try {
    res = await fetch(input, {
      ...rest,
      headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ClientApiError("تعذر الاتصال بالخادم، تحقق من الإنترنت", 0, "NETWORK");
  }
  let body: ApiBody<T> | null = null;
  try {
    body = (await res.json()) as ApiBody<T>;
  } catch {
    /* ignore */
  }
  if (!res.ok || !body || !body.ok) {
    const err = body && !body.ok ? body.error : null;
    throw new ClientApiError(err?.message ?? "حدث خطأ غير متوقع", res.status, err?.code ?? "UNKNOWN");
  }
  return body.data;
}
