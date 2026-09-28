import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { Pitch } from "@/components/Pitch";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { getSnapshot } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "التشكيلة",
  description: "تشكيلة أكاديمية التميز الأساسية والاحتياط",
  alternates: { canonical: "/formation" },
};

export default async function FormationPage() {
  const { formation, players } = await getSnapshot();
  const byId = new Map(players.map((p) => [p.id, p]));
  const subs = formation.subs.map((id) => byId.get(id)).filter((p) => !!p);

  return (
    <PageShell title="التشكيلة" subtitle={<>{formation.size} لاعبين • خطة <bdi dir="ltr" className="tabular">{formation.shape}</bdi></>}>
      <div className="mb-4 flex justify-center gap-2">
        <span className="rounded-full border border-tamayoz-neon/40 bg-tamayoz-neon/10 px-4 py-1.5 text-sm font-bold text-tamayoz-neon">
          الخطة: <bdi dir="ltr" className="tabular">{formation.shape}</bdi>
        </span>
      </div>
      <Pitch formation={formation} players={players} />

      <section className="glass mt-6 p-4 sm:p-5">
        <h2 className="mb-4 text-lg font-black">🪑 الاحتياط</h2>
        {subs.length === 0 ? (
          <p className="text-sm text-white/50">لم يتم تحديد لاعبي الاحتياط بعد</p>
        ) : (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {subs.map((p) => (
              <li key={p.id} className="flex flex-col items-center gap-1.5 text-center">
                <PlayerAvatar number={p.number} name={p.name} photo={p.photo} size={56} />
                <span className="text-xs font-bold leading-tight">
                  <span className="text-tamayoz-neon tabular">{p.number}</span> {p.name}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  );
}
