import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { getPublicState } from "@/lib/store";
import { PredictionClient } from "./PredictionClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "توقع النتيجة",
  description: "توقع نتيجة مباراة أكاديمية التميز ضد رحب واربح",
  alternates: { canonical: "/prediction" },
};

export default async function PredictionPage() {
  const state = await getPublicState();
  return (
    <PageShell title="توقع النتيجة" subtitle="توقع واحد لكل رقم جوال • يغلق عند بداية المباراة">
      <PredictionClient initial={state} />
    </PageShell>
  );
}
