"use client";

import { motion } from "framer-motion";
import { Confetti } from "@/components/Confetti";
import { ScoreLine } from "@/components/ScoreLine";
import { ManOfMatch } from "@/components/ManOfMatch";
import { useLiveState } from "@/components/useLiveState";
import type { PublicState, WinnerEntry } from "@/lib/types";

function WinnerList({ title, icon, list, accent }: { title: string; icon: string; list: WinnerEntry[]; accent: string }) {
  return (
    <section className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className={`text-lg font-black ${accent}`}>
          {icon} {title}
        </h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular">{list.length}</span>
      </div>
      {list.length === 0 ? (
        <p className="py-4 text-center text-sm text-white/50">لا يوجد</p>
      ) : (
        <ol className="space-y-2">
          {list.map((w, i) => (
            <motion.li
              key={`${w.maskedPhone}-${i}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i, 20) * 0.05 }}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
            >
              <span className="w-7 shrink-0 text-center font-black text-white/40 tabular">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{w.name}</p>
                <p className="text-xs text-white/50 tabular" dir="ltr" style={{ textAlign: "right" }}>
                  {w.maskedPhone}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-night-900/70 px-3 py-1 font-black tabular">
                {w.home}-{w.away}
              </span>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function WinnersClient({ initial }: { initial: PublicState }) {
  const { state } = useLiveState(initial, 15_000);
  const { winners, match, players } = state;
  const mom = match.manOfMatchId && !state.settings.votingOpen ? players.find((p) => p.id === match.manOfMatchId) : null;

  if (!winners) {
    return (
      <div className="space-y-5">
        <section className="glass p-8 text-center">
          <p className="text-5xl">🏆</p>
          <h2 className="mt-3 text-xl font-black">لم يتم إعلان الفائزين بعد</h2>
          <p className="mt-2 text-sm text-white/55">سيتم الإعلان بعد نهاية المباراة — تابعنا!</p>
        </section>
        {mom && <ManOfMatch player={mom} />}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Confetti active burstKey={winners.announcedAt ?? 0} />
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass neon-border p-5 text-center"
      >
        <p className="text-sm font-bold text-white/60">النتيجة النهائية</p>
        <ScoreLine home={winners.homeScore} away={winners.awayScore} className="mt-1 text-5xl" />
        <p className="mt-1 text-sm text-white/55">
          {match.home.shortName} - {match.away.shortName}
        </p>
      </motion.section>
      {mom && <ManOfMatch player={mom} />}
      <WinnerList title="أصحاب التوقع الصحيح" icon="🎯" list={winners.exact} accent="text-amber-300" />
      <WinnerList title="أصحاب توقع الفائز" icon="✅" list={winners.outcome} accent="text-tamayoz-neon" />
    </div>
  );
}
