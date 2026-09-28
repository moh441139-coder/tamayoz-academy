import "server-only";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { siteUrl } from "./site";

/** رابط الموقع الحالي: من المتغير البيئي أو من ترويسات الطلب */
export function currentOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return siteUrl();
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl();
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function qrSvg(url: string, dark = "#0A1414", light = "#FFFFFF"): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark, light },
  });
}
