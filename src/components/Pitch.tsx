"use client";

import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { getSlotPositions } from "@/lib/formations";
import type { FormationData, Player } from "@/lib/types";

function firstName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(-1)[0]! : name;
}

export function PitchMarkings() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 68 105" preserveAspectRatio="none" aria-hidden>
      <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.35">
        <rect x="1.5" y="1.5" width="65" height="102" rx="0.5" />
        <line x1="1.5" y1="52.5" x2="66.5" y2="52.5" />
        <circle cx="34" cy="52.5" r="9.15" />
        <rect x="13.84" y="1.5" width="40.32" height="16.5" />
        <rect x="24.84" y="1.5" width="18.32" height="5.5" />
        <rect x="13.84" y="87" width="40.32" height="16.5" />
        <rect x="24.84" y="98" width="18.32" height="5.5" />
        <path d="M 26.7 18 A 9.15 9.15 0 0 0 41.3 18" />
        <path d="M 26.7 87 A 9.15 9.15 0 0 1 41.3 87" />
      </g>
      <g fill="rgba(255,255,255,0.7)">
        <circle cx="34" cy="52.5" r="0.5" />
        <circle cx="34" cy="12.5" r="0.4" />
        <circle cx="34" cy="92.5" r="0.4" />
      </g>
    </svg>
  );
}

export function Pitch({ formation, players, large }: { formation: FormationData; players: Player[]; large?: boolean }) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const positions = getSlotPositions(formation.size, formation.shape);
  const avatar = large ? 84 : formation.size >= 11 ? 46 : 54;

  return (
    <div
      className="pitch relative mx-auto aspect-[68/105] w-full max-w-[520px] overflow-hidden rounded-3xl border-2 border-white/20 shadow-[0_0_60px_rgba(79,227,200,0.2)]"
      role="img"
      aria-label={`تشكيلة ${formation.shape}`}
    >
      <PitchMarkings />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]" aria-hidden />
      {positions.map((pos, i) => {
        const id = formation.slots[i];
        const p = id ? byId.get(id) : undefined;
        return (
          <motion.div
            key={`${formation.shape}-${i}`}
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.08 * i, type: "spring", stiffness: 200, damping: 16 }}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {p ? (
              <>
                <PlayerAvatar
                  number={p.number}
                  name={p.name}
                  photo={p.photo}
                  size={avatar}
                  className={pos.role === "GK" ? "!ring-amber-300" : ""}
                />
                <span className="mt-1 max-w-[76px] truncate rounded-full bg-night-900/85 px-2 py-0.5 text-[11px] font-bold leading-tight sm:text-xs">
                  <span className="text-tamayoz-neon tabular">{p.number}</span> {firstName(p.name)}
                </span>
              </>
            ) : (
              <div
                className="flex items-center justify-center rounded-full border-2 border-dashed border-white/40 bg-black/20 text-xs text-white/60"
                style={{ width: avatar, height: avatar }}
              >
                {pos.role}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
