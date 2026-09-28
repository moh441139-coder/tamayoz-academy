"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client";
import type { WinnerEntry } from "@/lib/types";
import { useAdmin } from "./context";
import { Card, Stat } from "./ui";

const SCOPES = [
  { value: "predictions", label: "التوقعات فقط" },
  { value: "votes", label: "التصويت فقط" },
  { value: "winners", label: "الفائزين فقط" },
  { value: "all", label: "كل البيانات (المباراة واللاعبين والصور والتوقعات والتصويت)" },
] as const;

function MiniList({ list }: { list: WinnerEntry[] }) {
  if (list.length === 0) return <p className="text-sm text-white/45">لا يوجد</p>;
  return (
    <ul className="max-h-60 space-y-1 overflow-auto text-sm">
      {list.map((w, i) => (
        <li key={i} className="flex justify-between gap-2 rounded-lg bg-white/[0.03] px-2 py-1">
          <span className="truncate">{w.name}</span>
          <span className="shrink-0 text-white/50 tabular" dir="ltr">
            {w.maskedPhone} • {w.home}-{w.away}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function DataSection() {
  const { state, run } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [scope, setScope] = useState<(typeof SCOPES)[number]["value"]>("predictions");
  const [confirm, setConfirm] = useState("");
  const w = state.winnersDraft;
  const m = state.match;

  async function announce() {
    if (m.effectiveStatus !== "FINISHED" && !window.confirm("المباراة لم تنتهِ بعد. هل تريد الإعلان بالنتيجة الحالية؟")) return;
    if (!window.confirm(`إعلان الفائزين بناءً على النتيجة ${m.homeScore}-${m.awayScore}؟`)) return;
    setBusy(true);
    await run(() => apiFetch<{ message: string }>("/api/admin/winners", { method: "POST" }), (r) => r.message);
    setBusy(false);
  }

  async function hide() {
    setBusy(true);
    await run(() => apiFetch("/api/admin/winners", { method: "DELETE" }), "تم إخفاء الفائزين");
    setBusy(false);
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    const label = SCOPES.find((s) => s.value === scope)?.label;
    if (!window.confirm(`تأكيد نهائي: تصفير ${label}؟ لا يمكن التراجع!`)) return;
    setBusy(true);
    const res = await run(() => apiFetch<{ message: string }>("/api/admin/reset", { method: "POST", json: { scope, confirm: confirm.trim() } }), (r) => r.message);
    if (res) setConfirm("");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <Card title="إعلان الفائزين" icon="🏆">
        <div className="mb-4 grid grid-cols-3 gap-2">
          <Stat label="النتيجة الحالية" value={`${m.homeScore}-${m.awayScore}`} />
          <Stat label="توقع صحيح" value={w?.exact.length ?? "—"} />
          <Stat label="توقع الفائز" value={w?.outcome.length ?? "—"} />
        </div>
        <p className="mb-3 text-sm">
          الحالة: {w?.announced ? <b className="text-tamayoz-neon">معلن للجمهور ✅</b> : <b className="text-white/60">غير معلن</b>}
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={announce} disabled={busy}>
            🎉 {w?.announced ? "إعادة حساب وإعلان" : "إعلان الفائزين"}
          </button>
          {w?.announced && (
            <button type="button" className="btn-ghost" onClick={hide} disabled={busy}>
              إخفاء
            </button>
          )}
        </div>
        {w && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold text-amber-300">🎯 التوقع الصحيح</p>
              <MiniList list={w.exact} />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-tamayoz-neon">✅ توقع الفائز</p>
              <MiniList list={w.outcome} />
            </div>
          </div>
        )}
      </Card>

      <Card title="تصدير CSV" icon="📥">
        <div className="flex flex-wrap gap-2">
          <a className="btn-ghost" href="/api/admin/export?type=predictions" download>
            التوقعات ({state.predictionStats.total})
          </a>
          <a className="btn-ghost" href="/api/admin/export?type=votes" download>
            الأصوات ({state.votes.total})
          </a>
          <a className="btn-ghost" href="/api/admin/export?type=winners" download>
            الفائزين
          </a>
        </div>
        <p className="mt-2 text-xs text-white/45">الملفات تحتوي أرقام الجوال كاملة — للاستخدام الداخلي فقط</p>
      </Card>

      <Card title="تصفير البيانات" icon="⚠️">
        <form onSubmit={reset} className="space-y-3">
          <select className="input" value={scope} onChange={(e) => setScope(e.target.value as typeof scope)}>
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input className="input" placeholder='اكتب "تصفير" للتأكيد' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button type="submit" className="btn-danger w-full" disabled={busy || confirm.trim() !== "تصفير"}>
            🗑️ تصفير
          </button>
        </form>
      </Card>
    </div>
  );
}
