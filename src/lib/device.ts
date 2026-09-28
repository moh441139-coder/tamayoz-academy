export const DEVICE_COOKIE = "tamayoz_device";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validDeviceId(v: string | undefined | null): string | null {
  return v && UUID_RE.test(v) ? v : null;
}
