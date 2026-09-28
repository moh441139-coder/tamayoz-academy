import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { getPublicState } from "@/lib/store";
import { WinnersClient } from "./WinnersClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "الفائزين",
  description: "الفائزون في توقع نتيجة مباراة أكاديمية التميز ضد رحب",
  alternates: { canonical: "/winners" },
};

export default async function WinnersPage() {
  const state = await getPublicState();
  return (
    <PageShell title="الفائزون" subtitle="أصحاب التوقعات الصحيحة">
      <WinnersClient initial={state} />
    </PageShell>
  );
}
