"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Countdown } from "./Countdown";
import { Scoreboard } from "./Scoreboard";
import { StatusBadge } from "./StatusBadge";
import { TeamLogo } from "./TeamLogo";
import { formatArabicDate, formatArabicTime } from "@/lib/time";
import type { PublicState } from "@/lib/types";

export function MatchCard({ match, now }: { match: PublicState["match"]; now: number }) {
  const status = match.effectiveStatus;
  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="glass neon-border relative overflow-hidden p-5 sm:p-8"
      aria-label="بطاقة المباراة"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
        <div className="absolute -top-10 h-[140%] w-24 animate-sweep bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-tamayoz-neon/15 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-rahab-violet/20 blur-3xl" />
      </div>

      <div className="relative flex justify-center">
        <StatusBadge status={status} />
      </div>

      <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 16 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <TeamLogo side="home" name={match.home.shortName} logo={match.home.logo} size={104} priority className="sm:!h-36 sm:!w-36" />
          <div>
            <p className="text-lg font-black sm:text-2xl">{match.home.name}</p>
            <p className="text-xs font-medium text-tamayoz-neon/80">المستضيف</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 12 }}
          className="relative flex flex-col items-center"
        >
          <span className="text-5xl font-black italic tracking-tight text-gradient drop-shadow-[0_0_24px_rgba(79,227,200,0.5)] sm:text-7xl">
            VS
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 16 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          <TeamLogo side="away" name={match.away.shortName} logo={match.away.logo} size={104} priority className="sm:!h-36 sm:!w-36" />
          <div>
            <p className="text-lg font-black sm:text-2xl">{match.away.name}</p>
            <p className="text-xs font-medium text-indigo-200/70">الضيف</p>
          </div>
        </motion.div>
      </div>

      <div className="relative mt-6 min-h-[120px]">
        <AnimatePresence mode="wait">
          {status === "UPCOMING" ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-3"
            >
              <p className="text-center text-sm font-medium text-white/60">تنطلق المباراة بعد</p>
              <Countdown target={match.kickoffAt} now={now} />
            </motion.div>
          ) : (
            <motion.div
              key="score"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <p className="mb-1 text-sm font-bold text-white/60">
                {status === "LIVE" ? "النتيجة الحية" : "النتيجة النهائية"}
              </p>
              <Scoreboard home={match.homeScore} away={match.awayScore} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <dl className="relative mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
        <InfoItem icon="📅" label="التاريخ" value={formatArabicDate(match.date)} />
        <InfoItem
          icon="⏰"
          label="الوقت"
          value={`${formatArabicTime(match.startTime)} — ${formatArabicTime(match.endTime)}`}
        />
        <InfoItem icon="📍" label="المكان" value={match.venue} />
      </dl>
    </motion.section>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] text-white/45">{label}</dt>
        <dd className="font-bold leading-snug">{value}</dd>
      </div>
    </div>
  );
}
