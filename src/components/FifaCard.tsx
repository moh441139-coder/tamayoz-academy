"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { POSITION_LABELS } from "@/lib/constants";
import type { Player } from "@/lib/types";

export function FifaCard({ player, index = 0 }: { player: Player; index?: number }) {
  const isGK = player.position === "GK";
  const pos = POSITION_LABELS[player.position];
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, rotateY: -25 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.05, type: "spring", stiffness: 140, damping: 18 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="group relative mx-auto w-full max-w-[220px] [perspective:800px]"
    >
      <div
        className={`fifa-card relative aspect-[3/4.2] w-full overflow-hidden p-[2px] ${
          isGK
            ? "bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700"
            : "bg-gradient-to-b from-tamayoz-neon via-rahab to-tamayoz"
        }`}
      >
        <div
          className={`fifa-card relative h-full w-full overflow-hidden ${
            isGK
              ? "bg-[radial-gradient(circle_at_50%_20%,#5b4a16,#231c07_70%)]"
              : "bg-[radial-gradient(circle_at_50%_20%,#0f6a66,#061c1c_70%)]"
          }`}
        >
          <div className="absolute inset-0 opacity-30" aria-hidden>
            <div className="absolute -left-10 top-6 h-px w-[160%] rotate-[25deg] bg-white/40" />
            <div className="absolute -left-10 top-14 h-px w-[160%] rotate-[25deg] bg-white/20" />
          </div>
          <div className="absolute -top-8 h-[140%] w-10 animate-sweep bg-gradient-to-b from-transparent via-white/15 to-transparent" aria-hidden />

          <div className="absolute right-[9%] top-[9%] z-10 flex flex-col items-center leading-none">
            <span className={`text-4xl font-black tabular ${isGK ? "text-amber-200" : "text-neon"}`}>{player.number}</span>
            <span className={`mt-1 text-xs font-black tracking-wider ${isGK ? "text-amber-300" : "text-white/80"}`}>
              {pos.short}
            </span>
          </div>

          <div className="absolute inset-x-[12%] top-[10%] aspect-square">
            {player.photo ? (
              <Image
                src={player.photo}
                alt={player.name}
                fill
                sizes="(max-width: 640px) 45vw, 200px"
                className="object-cover [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div
                  className="flex aspect-square w-[78%] items-center justify-center rounded-full font-black text-white shadow-neon tabular"
                  style={{
                    background: isGK
                      ? "radial-gradient(circle at 30% 25%, #fde68a, #b45309 70%)"
                      : "radial-gradient(circle at 30% 25%, #4FE3C8, #0B5E5E 70%)",
                    fontSize: "clamp(2rem, 9vw, 3.6rem)",
                  }}
                  role="img"
                  aria-label={`${player.name} رقم ${player.number}`}
                >
                  {player.number}
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-[14%] z-10 px-3 text-center">
            <div className={`mx-auto mb-1.5 h-px w-2/3 ${isGK ? "bg-amber-300/60" : "bg-tamayoz-neon/60"}`} />
            <h3 className="truncate text-base font-black sm:text-lg">{player.name}</h3>
            <p className={`text-[11px] font-bold ${isGK ? "text-amber-200/80" : "text-tamayoz-neon/80"}`}>{pos.ar}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
