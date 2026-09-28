"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PercentBar } from "./PercentBar";
import { PlayerAvatar } from "./PlayerAvatar";
import type { Player, VoteSummary } from "@/lib/types";

interface Props {
  summary: VoteSummary;
  players: Player[];
  limit?: number;
  large?: boolean;
  highlightId?: string | null;
}

export function VoteResults({ summary, players, limit = 8, large, highlightId }: Props) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const rows = summary.results.slice(0, limit);
  if (rows.length === 0) {
    return <p className={`py-6 text-center text-white/50 ${large ? "text-2xl" : "text-sm"}`}>لا توجد أصوات بعد</p>;
  }
  return (
    <ul className={large ? "space-y-5" : "space-y-3.5"}>
      <AnimatePresence initial={false}>
        {rows.map((r, i) => {
          const p = byId.get(r.playerId);
          if (!p) return null;
          return (
            <motion.li
              key={r.playerId}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="flex items-center gap-3"
            >
              <span className={`w-6 shrink-0 text-center font-black tabular ${i === 0 ? "text-amber-300" : "text-white/40"} ${large ? "text-3xl w-10" : ""}`}>
                {i + 1}
              </span>
              <PlayerAvatar number={p.number} name={p.name} photo={p.photo} size={large ? 64 : 40} />
              <div className="min-w-0 flex-1">
                <PercentBar
                  large={large}
                  label={p.name}
                  pct={r.pct}
                  value={`${r.pct}% (${r.count})`}
                  highlight={highlightId === p.id || i === 0}
                  color={i === 0 ? "from-amber-300 to-tamayoz-neon" : undefined}
                />
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
