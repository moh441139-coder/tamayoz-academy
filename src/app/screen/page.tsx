import type { Metadata } from "next";
import { currentOrigin, qrSvg } from "@/lib/qr";
import { getPublicState } from "@/lib/store";
import { ScreenClient } from "./ScreenClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الشاشة الكبيرة",
  robots: { index: false, follow: false },
};

export default async function ScreenPage() {
  const origin = currentOrigin();
  const [state, qr] = await Promise.all([getPublicState(), qrSvg(origin)]);
  return <ScreenClient initial={state} qr={qr} origin={origin} />;
}
