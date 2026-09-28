import type { Metadata } from "next";
import { FifaCard } from "@/components/FifaCard";
import { PageShell } from "@/components/PageShell";
import { getPlayers } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "اللاعبين",
  description: "بطاقات لاعبي أكاديمية التميز",
  alternates: { canonical: "/players" },
};

export default async function PlayersPage() {
  const players = await getPlayers();
  const gks = players.filter((p) => p.position === "GK");
  const others = players.filter((p) => p.position !== "GK");
  return (
    <PageShell title="لاعبو التميز" subtitle={`${players.length} لاعباً`} wide>
      {gks.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-amber-200">🧤 حراس المرمى</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {gks.map((p, i) => (
              <FifaCard key={p.id} player={p} index={i} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-tamayoz-neon">⚽ اللاعبون</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {others.map((p, i) => (
            <FifaCard key={p.id} player={p} index={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
