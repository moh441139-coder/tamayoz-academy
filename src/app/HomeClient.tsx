"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MatchCard } from "@/components/MatchCard";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useLiveState, useNow } from "@/components/useLiveState";
import type { PublicState } from "@/lib/types";

const LINKS = [
  { href: "/formation", label: "التشكيلة", icon: "🧩", desc: "خطة اللعب والأساسيين" },
  { href: "/players", label: "اللاعبين", icon: "👕", desc: "بطاقات نجوم التميز" },
  { href: "/prediction", label: "توقع النتيجة", icon: "🎯", desc: "توقع واربح" },
  { href: "/vote", label: "رجل المباراة", icon: "⭐", desc: "صوّت لأفضل لاعب" },
  { href: "/winners", label: "الفائزين", icon: "🏆", desc: "أصحاب التوقعات الصحيحة" },
];

export function HomeClient({ initial }: { initial: PublicState }) {
  const { state, serverOffset } = useLiveState(initial, 10_000);
  const now = useNow(serverOffset);
  const { match, settings, players } = state;
  const status = match.effectiveStatus;
  const mom = match.manOfMatchId ? players.find((p) => p.id === match.manOfMatchId) : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <p className="text-xs font-bold tracking-wide text-tamayoz-neon/80 sm:text-sm">{match.organizer}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">
          <span className="text-gradient">{match.home.name}</span>
          <span className="mx-2 text-white/80">🆚</span>
          <span className="text-gradient">{match.away.name}</span>
        </h1>
      </motion.header>

      <MatchCard match={match} now={now} />

      {status === "UPCOMING" && settings.predictionsAccepting && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4">
          <Link
            href="/prediction"
            className="btn-primary w-full text-lg"
          >
            🎯 التوقعات مفتوحة — سجّل توقعك الآن
          </Link>
        </motion.div>
      )}

      {settings.votingOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <Link href="/vote" className="btn w-full bg-gradient-to-l from-rahab-violet to-rahab text-lg text-white shadow-neon-violet">
            ⭐ التصويت على رجل المباراة مفتوح الآن
          </Link>
        </motion.div>
      )}

      {status === "FINISHED" && mom && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-4 flex items-center gap-4 p-4"
        >
          <PlayerAvatar number={mom.number} name={mom.name} photo={mom.photo} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-300">⭐ رجل المباراة</p>
            <p className="truncate text-xl font-black">{mom.name}</p>
          </div>
          <Link href="/winners" className="btn-ghost shrink-0 px-4 py-2 text-sm">
            الفائزون
          </Link>
        </motion.div>
      )}

      <nav className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="أقسام الموقع">
        {LINKS.map((l, i) => (
          <motion.div
            key={l.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
            className={i === LINKS.length - 1 ? "col-span-2 sm:col-span-1" : ""}
          >
            <Link
              href={l.href}
              className="glass group flex h-full flex-col items-center justify-center gap-1.5 px-3 py-5 text-center transition hover:-translate-y-1 hover:border-tamayoz-neon/40 hover:shadow-neon"
            >
              <span className="text-3xl transition group-hover:scale-110" aria-hidden>
                {l.icon}
              </span>
              <span className="text-base font-black">{l.label}</span>
              <span className="text-[11px] text-white/50">{l.desc}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <footer className="mt-10 text-center text-xs text-white/35">
        <p>{match.organizer}</p>
        <p className="mt-1">أكاديمية التميز — الفريق المستضيف</p>
      </footer>
    </main>
  );
}
