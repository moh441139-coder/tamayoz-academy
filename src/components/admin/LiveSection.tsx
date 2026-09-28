"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import { STATUS_LABELS } from "@/lib/time";
import type { MatchStatus } from "@/lib/types";
import { useAdmin } from "./context";
import { Card, Toggle } from "./ui";

const STATUSES: { value: MatchStatus; label: string; cls: string }[] = [
  { value: "UPCOMING", label: "قادمة", cls: "border-tamayoz-neon/50 bg-tamayoz-neon/15 text-tamayoz-neon" },
  { value: "LIVE", label: "مباشر 🔴", cls: "border-red-500/60 bg-red-500/15 text-red-300" },
  { value: "FINISHED", label: "انتهت", cls: "border-rahab-violet/60 bg-rahab-violet/20 text-indigo-200" },
];

function ScoreControl({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-bold">{label}</p>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-ghost h-12 w-12 !p-0 text-3xl" onClick={() => onChange(Math.min(30, value + 1))} disabled={disabled} aria-label={`هدف لـ ${label}`}>
          +
        </button>
        <span className="w-14 text-center text-5xl font-black tabular text-neon">{value}</span>
        <button type="button" className="btn-ghost h-12 w-12 !p-0 text-3xl" onClick={() => onChange(Math.max(0, value - 1))} disabled={disabled || value === 0} aria-label={`إلغاء هدف لـ ${label}`}>
          −
        </button>
      </div>
    </div>
  );
}

export function LiveSection() {
  const { state, run } = useAdmin();
  const m = state.match;
  const [busy, setBusy] = useState(false);
  const [finalHome, setFinalHome] = useState(m.homeScore);
  const [finalAway, setFinalAway] = useState(m.awayScore);

  useEffect(() => {
    setFinalHome(m.homeScore);
    setFinalAway(m.awayScore);
  }, [m.homeScore, m.awayScore]);

  async function patch(body: Record<string, unknown>, msg: string) {
    setBusy(true);
    await run(() => apiFetch("/api/admin/match", { method: "PATCH", json: body }), msg);
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <Card title="حالة المباراة" icon="🚦">
        <p className="mb-3 text-sm text-white/60">
          الحالة المعروضة الآن: <b className="text-white">{STATUS_LABELS[m.effectiveStatus]}</b>
        </p>
        <Toggle
          checked={m.statusMode === "auto"}
          onChange={(v) => patch({ statusMode: v ? "auto" : "manual", status: m.effectiveStatus }, v ? "الحالة تلقائية حسب الوقت" : "الحالة يدوية")}
          label="تحديث الحالة تلقائياً حسب الوقت"
          description="قادمة قبل البداية ← مباشر ← انتهت بعد وقت النهاية"
          disabled={busy}
        />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              disabled={busy}
              onClick={() => patch({ status: s.value, statusMode: "manual" }, `الحالة: ${s.label}`)}
              className={`btn border py-3 text-sm ${m.effectiveStatus === s.value ? s.cls : "border-white/10 bg-white/[0.03]"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title="النتيجة المباشرة" icon="⚽">
        <p className="mb-4 text-xs text-white/50">كل ضغطة تُحدّث النتيجة فوراً لجميع المتابعين</p>
        <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 min-[420px]:gap-3">
          <ScoreControl label={m.home.shortName} value={m.homeScore} onChange={(v) => patch({ homeScore: v }, `${m.home.shortName}: ${v}`)} disabled={busy} />
          <ScoreControl label={m.away.shortName} value={m.awayScore} onChange={(v) => patch({ awayScore: v }, `${m.away.shortName}: ${v}`)} disabled={busy} />
        </div>
      </Card>

      <Card title="إدخال النتيجة النهائية" icon="🏁">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex-1">
            <span className="label">{m.home.shortName}</span>
            <input type="number" min={0} max={30} className="input text-center text-2xl font-black tabular" value={finalHome} onChange={(e) => setFinalHome(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} />
          </label>
          <label className="flex-1">
            <span className="label">{m.away.shortName}</span>
            <input type="number" min={0} max={30} className="input text-center text-2xl font-black tabular" value={finalAway} onChange={(e) => setFinalAway(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} />
          </label>
        </div>
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={busy}
          onClick={() => {
            if (!window.confirm(`اعتماد النتيجة النهائية ${finalHome}-${finalAway} وإنهاء المباراة؟`)) return;
            patch({ homeScore: finalHome, awayScore: finalAway, status: "FINISHED", statusMode: "manual" }, "تم اعتماد النتيجة النهائية");
          }}
        >
          ✅ اعتماد النتيجة وإنهاء المباراة
        </button>
      </Card>

      <Card title="رجل المباراة" icon="⭐">
        <p className="mb-3 text-xs text-white/50">يُحدَّد تلقائياً عند إغلاق التصويت (الأعلى أصواتاً)، ويمكنك تعديله يدوياً</p>
        <select
          className="input"
          value={m.manOfMatchId ?? ""}
          disabled={busy}
          onChange={(e) => patch({ manOfMatchId: e.target.value || null }, "تم تحديث رجل المباراة")}
        >
          <option value="">— لم يُحدد —</option>
          {state.players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.number} - {p.name}
            </option>
          ))}
        </select>
      </Card>
    </div>
  );
}
