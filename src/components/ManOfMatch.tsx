"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Confetti } from "./Confetti";
import type { Player } from "@/lib/types";

export function ManOfMatch({ player, large }: { player: Player; large?: boolean }) {
  const size = large ? 280 : 180;
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 14 }}
      className="glass neon-border relative overflow-hidden p-6 text-center"
    >
      <Confetti active burstKey={player.id} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(252,211,77,0.18),transparent_60%)]" aria-hidden />
      <motion.p
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`relative font-black text-amber-300 ${large ? "text-4xl" : "text-xl"}`}
      >
        ⭐ رجل المباراة ⭐
      </motion.p>
      <motion.div
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 120, damping: 12 }}
        className="relative mx-auto mt-5 overflow-hidden rounded-full ring-4 ring-amber-300 shadow-[0_0_60px_rgba(252,211,77,0.5)]"
        style={{ width: size, height: size }}
      >
        {player.photo ? (
          <Image src={player.photo} alt={player.name} fill sizes={`${size}px`} className="object-cover" priority />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-black text-white tabular"
            style={{ background: "radial-gradient(circle at 30% 25%, #4FE3C8, #0B5E5E 70%)", fontSize: size * 0.42 }}
          >
            {player.number}
          </div>
        )}
      </motion.div>
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className={`relative mt-5 font-black ${large ? "text-6xl" : "text-3xl"}`}
      >
        {player.name}
      </motion.h2>
      <p className={`relative mt-1 font-bold text-tamayoz-neon tabular ${large ? "text-3xl" : "text-lg"}`}>#{player.number}</p>
    </motion.section>
  );
}
