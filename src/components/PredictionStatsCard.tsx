"use client";

import { motion } from "framer-motion";
import { PercentBar } from "./PercentBar";
import { ScoreLine } from "./ScoreLine";
import type { MatchData, PredictionStats } from "@/lib/types";

export function PredictionStatsCard({ stats, match }: { stats: PredictionStats; match: Pick<MatchData, "home" | "away"> }) {
  const top = stats.topScores[0];
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black">📊 إحصائيات التوقعات</h2>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/70 tabular">
          {stats.total} توقع
        </span>
      </div>

      {stats.total === 0 ? (
        <p className="py-6 text-center text-sm text-white/50">لا توجد توقعات بعد — كن أول المتوقعين!</p>
      ) : (
        <div className="space-y-5">
          {top && (
            <div className="rounded-2xl border border-tamayoz-neon/25 bg-tamayoz-neon/[0.06] p-4 text-center">
              <p className="text-xs font-bold text-white/60">أكثر نتيجة متوقعة</p>
              <ScoreLine home={top.home} away={top.away} className="mt-1 text-4xl" />
              <p className="mt-1 text-xs text-white/50">
                {match.home.shortName} - {match.away.shortName} • {top.pct}%
              </p>
            </div>
          )}
          <div className="space-y-3">
            <PercentBar label={`فوز ${match.home.shortName}`} pct={stats.homeWinPct} />
            <PercentBar label="تعادل" pct={stats.drawPct} color="from-slate-300 to-slate-500" />
            <PercentBar label={`فوز ${match.away.shortName}`} pct={stats.awayWinPct} color="from-rahab-violet to-rahab" />
          </div>
          {stats.topScores.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-bold text-white/50">النتائج الأكثر توقعاً</p>
              <ul className="flex flex-wrap gap-2">
                {stats.topScores.map((s) => (
                  <li
                    key={`${s.home}-${s.away}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold tabular"
                  >
                    {s.home}-{s.away} <span className="text-white/45">({s.count})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}
