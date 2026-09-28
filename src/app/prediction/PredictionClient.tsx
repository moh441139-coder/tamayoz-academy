"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Confetti } from "@/components/Confetti";
import { ScoreLine } from "@/components/ScoreLine";
import { PredictionStatsCard } from "@/components/PredictionStatsCard";
import { TeamLogo } from "@/components/TeamLogo";
import { useLiveState } from "@/components/useLiveState";
import { apiFetch, ClientApiError } from "@/lib/client";
import type { PublicState } from "@/lib/types";

const STORAGE_KEY = "tamayoz:prediction";

interface Saved {
  name: string;
  home: number;
  away: number;
}

function Stepper({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className="btn-ghost h-11 w-11 !p-0 text-2xl" onClick={() => onChange(Math.min(30, value + 1))} aria-label={`زيادة ${label}`}>
        +
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={30}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
        className="input h-14 w-16 !px-0 text-center text-3xl font-black tabular"
        aria-label={label}
      />
      <button type="button" className="btn-ghost h-11 w-11 !p-0 text-2xl" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`إنقاص ${label}`}>
        −
      </button>
    </div>
  );
}

export function PredictionClient({ initial }: { initial: PublicState }) {
  const { state, refresh } = useLiveState(initial, 10_000);
  const { match, settings, predictionStats } = state;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [celebrate, setCelebrate] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as Saved);
    } catch {
      /* ignore */
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/predictions", { method: "POST", json: { name, phone, home, away, website } });
      const s = { name: name.trim(), home, away };
      setSaved(s);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      } catch {
        /* ignore */
      }
      setCelebrate((c) => c + 1);
      refresh();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  const open = settings.predictionsAccepting;

  return (
    <div className="space-y-5">
      <Confetti active={celebrate > 0} burstKey={celebrate} />
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.section
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass neon-border p-6 text-center"
          >
            <p className="text-4xl">✅</p>
            <h2 className="mt-2 text-xl font-black">تم تسجيل توقعك يا {saved.name}</h2>
            <ScoreLine home={saved.home} away={saved.away} className="mt-3 text-5xl" />
            <p className="mt-2 text-sm text-white/55">
              {match.home.shortName} - {match.away.shortName}
            </p>
            <p className="mt-4 text-xs text-white/45">يُسمح بتوقع واحد فقط لكل رقم جوال</p>
          </motion.section>
        ) : open ? (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass neon-border space-y-5 p-5 sm:p-6"
            noValidate
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-3">
                <TeamLogo side="home" name={match.home.shortName} logo={match.home.logo} size={72} />
                <p className="font-black">{match.home.shortName}</p>
                <Stepper value={home} onChange={setHome} label={`أهداف ${match.home.shortName}`} />
              </div>
              <div className="flex flex-col items-center gap-3">
                <TeamLogo side="away" name={match.away.shortName} logo={match.away.logo} size={72} />
                <p className="font-black">{match.away.shortName}</p>
                <Stepper value={away} onChange={setAway} label={`أهداف ${match.away.shortName}`} />
              </div>
            </div>

            <div>
              <label htmlFor="name" className="label">الاسم</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسمك" autoComplete="name" required maxLength={40} />
            </div>
            <div>
              <label htmlFor="phone" className="label">رقم الجوال</label>
              <input
                id="phone"
                className="input text-left tabular"
                dir="ltr"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                required
                maxLength={16}
              />
              <p className="mt-1.5 text-xs text-white/45">لن يظهر رقمك كاملاً — يُستخدم فقط للتحقق وإعلان الفائزين</p>
            </div>
            <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200"
                  role="alert"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-primary w-full text-lg" disabled={loading}>
              {loading ? "جارٍ الإرسال..." : `🎯 أرسل توقعي (${home} - ${away})`}
            </button>
          </motion.form>
        ) : (
          <motion.section key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-6 text-center">
            <p className="text-4xl">🔒</p>
            <h2 className="mt-2 text-xl font-black">التوقعات مغلقة</h2>
            <p className="mt-2 text-sm text-white/55">
              {match.effectiveStatus === "UPCOMING" ? "أغلق المشرف التوقعات مؤقتاً" : "انطلقت المباراة وتم إغلاق التوقعات تلقائياً"}
            </p>
          </motion.section>
        )}
      </AnimatePresence>

      <PredictionStatsCard stats={predictionStats} match={match} />
    </div>
  );
}
