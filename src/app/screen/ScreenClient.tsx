"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Countdown } from "@/components/Countdown";
import { ManOfMatch } from "@/components/ManOfMatch";
import { Scoreboard } from "@/components/Scoreboard";
import { StatusBadge } from "@/components/StatusBadge";
import { TeamLogo } from "@/components/TeamLogo";
import { VoteResults } from "@/components/VoteResults";
import { useLiveState, useNow } from "@/components/useLiveState";
import { formatArabicDate, formatArabicTime } from "@/lib/time";
import type { PublicState } from "@/lib/types";

export function ScreenClient({ initial, qr, origin }: { initial: PublicState; qr: string; origin: string }) {
  const { state, serverOffset } = useLiveState(initial, 5000);
  const now = useNow(serverOffset);
  const { match, votes, players, settings, predictionStats } = state;
  const status = match.effectiveStatus;
  const mom = !settings.votingOpen && match.manOfMatchId ? players.find((p) => p.id === match.manOfMatchId) : null;

  return (
    <main className="flex min-h-dvh flex-col gap-6 p-4 sm:p-8 lg:h-dvh lg:overflow-hidden lg:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-bold text-tamayoz-neon lg:text-2xl">{match.organizer}</p>
          <p className="text-white/60 lg:text-xl">
            {formatArabicDate(match.date)} • {formatArabicTime(match.startTime)} — {formatArabicTime(match.endTime)} • {match.venue}
          </p>
        </div>
        <StatusBadge status={status} large />
      </header>

      <div className="grid flex-1 gap-6 lg:min-h-0 lg:grid-cols-[1.6fr_1fr]">
        <section className="glass neon-border relative flex flex-col items-center justify-center overflow-hidden p-6 lg:p-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-tamayoz-neon/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-rahab-violet/20 blur-3xl" />
          </div>
          <div className="relative grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <TeamLogo side="home" name={match.home.shortName} logo={match.home.logo} size={200} priority className="lg:!h-[260px] lg:!w-[260px]" />
              <p className="text-3xl font-black lg:text-5xl">{match.home.name}</p>
            </div>
            <span className="text-6xl font-black italic text-gradient lg:text-9xl">VS</span>
            <div className="flex flex-col items-center gap-4 text-center">
              <TeamLogo side="away" name={match.away.shortName} logo={match.away.logo} size={200} priority className="lg:!h-[260px] lg:!w-[260px]" />
              <p className="text-3xl font-black lg:text-5xl">{match.away.name}</p>
            </div>
          </div>
          <div className="relative mt-8 w-full">
            <AnimatePresence mode="wait">
              {status === "UPCOMING" ? (
                <motion.div key="cd" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                  <p className="mb-4 text-2xl font-bold text-white/60 lg:text-3xl">تنطلق المباراة بعد</p>
                  <Countdown target={match.kickoffAt} now={now} large />
                </motion.div>
              ) : (
                <motion.div key="sc" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center">
                  <p className="text-2xl font-bold text-white/60 lg:text-3xl">{status === "LIVE" ? "النتيجة الحية" : "النتيجة النهائية"}</p>
                  <Scoreboard home={match.homeScore} away={match.awayScore} large />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <aside className="flex flex-col gap-6 lg:min-h-0">
          <section className="glass flex-1 overflow-hidden p-6 lg:min-h-0">
            {mom ? (
              <ManOfMatch player={mom} />
            ) : settings.votingOpen || votes.total > 0 ? (
              <>
                <h2 className="mb-5 flex items-center gap-3 text-3xl font-black">
                  ⭐ تصويت رجل المباراة
                  {settings.votingOpen && <span className="h-3 w-3 animate-pulse-glow rounded-full bg-red-500" />}
                </h2>
                <VoteResults summary={votes} players={players} limit={5} large />
                <p className="mt-4 text-xl text-white/50 tabular">{votes.total} صوت</p>
              </>
            ) : (
              <div className="flex h-full flex-col justify-center gap-4">
                <h2 className="text-3xl font-black">🎯 توقعات الجمهور</h2>
                <p className="text-2xl text-white/70">
                  <span className="text-neon tabular">{predictionStats.total}</span> توقع
                </p>
                {predictionStats.topScores[0] && (
                  <p className="text-2xl text-white/70">
                    الأكثر توقعاً:{" "}
                    <span className="font-black text-white tabular">
                      {predictionStats.topScores[0].home}-{predictionStats.topScores[0].away}
                    </span>
                  </p>
                )}
                <p className="text-xl text-white/50">
                  فوز {match.home.shortName} {predictionStats.homeWinPct}% • تعادل {predictionStats.drawPct}% • فوز {match.away.shortName} {predictionStats.awayWinPct}%
                </p>
              </div>
            )}
          </section>
          <section className="glass flex items-center gap-5 p-5">
            <div className="h-36 w-36 shrink-0 rounded-2xl bg-white p-2 lg:h-44 lg:w-44 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="رمز QR للموقع" />
            <div className="min-w-0">
              <p className="text-2xl font-black lg:text-3xl">📱 امسح وشارك</p>
              <p className="mt-1 text-lg text-white/60">توقّع • صوّت • تابع النتيجة</p>
              <p className="mt-2 truncate text-lg font-bold text-tamayoz-neon" dir="ltr">
                {origin.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
