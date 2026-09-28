"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ManOfMatch } from "@/components/ManOfMatch";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { VoteResults } from "@/components/VoteResults";
import { apiFetch, ClientApiError } from "@/lib/client";
import type { Player, VoteSummary } from "@/lib/types";

interface VoteState {
  votingOpen: boolean;
  manOfMatchId: string | null;
  summary: VoteSummary;
  myVote: string | null;
}

export function VoteClient({ initial, players }: { initial: VoteState; players: Player[] }) {
  const [state, setState] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setState(await apiFetch<VoteState>("/api/vote"));
    } catch {
      /* keep last */
    }
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("اختر لاعباً أولاً");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("/api/vote", {
        method: "POST",
        json: { playerId: selected, phone, website },
      });
      setSuccess(res.message);
      await refresh();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "حدث خطأ غير متوقع");
      if (err instanceof ClientApiError && err.code === "DEVICE_ALREADY_VOTED") refresh();
    } finally {
      setLoading(false);
    }
  }

  const winner = !state.votingOpen && state.manOfMatchId ? players.find((p) => p.id === state.manOfMatchId) : null;
  const mine = state.myVote ? players.find((p) => p.id === state.myVote) : null;

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {winner ? (
          <motion.div key="winner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ManOfMatch player={winner} />
          </motion.div>
        ) : !state.votingOpen ? (
          <motion.section key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 text-center">
            <p className="text-4xl">⏳</p>
            <h2 className="mt-2 text-xl font-black">التصويت لم يُفتح بعد</h2>
            <p className="mt-2 text-sm text-white/55">سيفتح المشرف التصويت على رجل المباراة قريباً — ابقَ متابعاً</p>
          </motion.section>
        ) : mine ? (
          <motion.section key="voted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass neon-border flex items-center gap-4 p-5">
            <PlayerAvatar number={mine.number} name={mine.name} photo={mine.photo} size={64} />
            <div>
              <p className="text-sm font-bold text-tamayoz-neon">{success ?? "تم تسجيل صوتك ✅"}</p>
              <p className="text-xl font-black">صوّتَّ لـ {mine.name}</p>
            </div>
          </motion.section>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass neon-border space-y-5 p-5" noValidate>
            <div>
              <h2 className="mb-3 text-lg font-black">اختر رجل المباراة</h2>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {players.map((p) => {
                  const active = selected === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setSelected(p.id)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition ${
                        active ? "border-tamayoz-neon bg-tamayoz-neon/15 shadow-neon" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                      }`}
                    >
                      <PlayerAvatar number={p.number} name={p.name} photo={p.photo} size={52} ring={active} />
                      <span className="line-clamp-2 text-xs font-bold leading-tight">{p.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div>
              <label htmlFor="vphone" className="label">رقم الجوال</label>
              <input id="vphone" className="input text-left tabular" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={16} required />
              <p className="mt-1.5 text-xs text-white/45">صوت واحد لكل جهاز ولكل رقم جوال</p>
            </div>
            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />
            {error && (
              <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full text-lg" disabled={loading || !selected}>
              {loading ? "جارٍ التصويت..." : "⭐ صوّت الآن"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="glass p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">📊 النتائج المباشرة</h2>
          <span className="flex items-center gap-2 text-xs text-white/55">
            <span className="h-2 w-2 animate-pulse-glow rounded-full bg-tamayoz-neon" />
            <span className="tabular">{state.summary.total}</span> صوت • تحديث كل 5 ثوانٍ
          </span>
        </div>
        <VoteResults summary={state.summary} players={players} highlightId={state.myVote} limit={16} />
      </section>
    </div>
  );
}
