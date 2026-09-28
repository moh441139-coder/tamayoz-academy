"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/client";
import { FORMATION_SHAPES, FORMATION_SIZES, getSlotPositions } from "@/lib/formations";
import type { FormationData, FormationSize } from "@/lib/types";
import { Pitch } from "../Pitch";
import { useAdmin } from "./context";
import { Card } from "./ui";

const ROLE_AR = { GK: "حارس", DF: "دفاع", MF: "وسط", FW: "هجوم" } as const;

export function FormationSection() {
  const { state, run } = useAdmin();
  const [draft, setDraft] = useState<FormationData>(state.formation);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(state.formation), [state.formation]);

  const positions = useMemo(() => getSlotPositions(draft.size, draft.shape), [draft.size, draft.shape]);
  const byId = new Map(state.players.map((p) => [p.id, p]));
  const assigned = new Set(draft.slots.filter(Boolean) as string[]);

  function changeSize(size: FormationSize) {
    const slots = Array.from({ length: size }, (_, i) => draft.slots[i] ?? null);
    const dropped = draft.slots.slice(size).filter(Boolean) as string[];
    setDraft({ size, shape: FORMATION_SHAPES[size][0]!, slots, subs: [...draft.subs, ...dropped] });
  }

  function setSlot(i: number, id: string | null) {
    const slots = draft.slots.map((s) => (s === id ? null : s));
    slots[i] = id;
    setDraft({ ...draft, slots, subs: draft.subs.filter((s) => s !== id) });
  }

  function toggleSub(id: string) {
    setDraft((d) => ({ ...d, subs: d.subs.includes(id) ? d.subs.filter((s) => s !== id) : [...d.subs, id] }));
  }

  function autoFill() {
    const gk = state.players.filter((p) => p.position === "GK");
    const others = state.players.filter((p) => p.position !== "GK");
    const ordered = [...gk.slice(0, 1), ...others, ...gk.slice(1)];
    const slots = ordered.slice(0, draft.size).map((p) => p.id);
    const subs = ordered.slice(draft.size).map((p) => p.id);
    setDraft({ ...draft, slots, subs });
  }

  async function save() {
    setBusy(true);
    await run(() => apiFetch("/api/admin/formation", { method: "PUT", json: draft }), "تم حفظ التشكيلة");
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,420px)]">
      <div className="space-y-4">
        <Card title="الخطة" icon="🧩">
          <p className="label">عدد اللاعبين</p>
          <div className="grid grid-cols-4 gap-2">
            {FORMATION_SIZES.map((s) => (
              <button key={s} type="button" onClick={() => changeSize(s)} className={`btn border py-2.5 ${draft.size === s ? "border-tamayoz-neon bg-tamayoz-neon/15 text-tamayoz-neon" : "border-white/10 bg-white/[0.03]"}`}>
                {s}
              </button>
            ))}
          </div>
          <p className="label mt-4">التوزيع</p>
          <div className="flex flex-wrap gap-2">
            {FORMATION_SHAPES[draft.size].map((sh) => (
              <button key={sh} type="button" dir="ltr" onClick={() => setDraft({ ...draft, shape: sh })} className={`btn border px-4 py-2 tabular ${draft.shape === sh ? "border-tamayoz-neon bg-tamayoz-neon/15 text-tamayoz-neon" : "border-white/10 bg-white/[0.03]"}`}>
                {sh}
              </button>
            ))}
          </div>
        </Card>

        <Card title="الأساسيون" icon="⭐" actions={<button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={autoFill}>تعبئة تلقائية</button>}>
          <ul className="space-y-2">
            {positions.map((pos, i) => (
              <li key={`${draft.shape}-${i}`} className="grid grid-cols-[64px_1fr] items-center gap-2">
                <span className={`rounded-xl px-2 py-2 text-center text-xs font-bold ${pos.role === "GK" ? "bg-amber-400/15 text-amber-200" : "bg-white/5 text-white/70"}`}>
                  {ROLE_AR[pos.role]}
                </span>
                <select className="input py-2.5" value={draft.slots[i] ?? ""} onChange={(e) => setSlot(i, e.target.value || null)}>
                  <option value="">— فارغ —</option>
                  {state.players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.number} - {p.name}
                      {p.position === "GK" ? " (GK)" : ""}
                      {assigned.has(p.id) && draft.slots[i] !== p.id ? " ✓" : ""}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="الاحتياط" icon="🪑">
          <div className="flex flex-wrap gap-2">
            {state.players
              .filter((p) => !assigned.has(p.id))
              .map((p) => {
                const on = draft.subs.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => toggleSub(p.id)} aria-pressed={on} className={`btn border px-3 py-2 text-sm ${on ? "border-tamayoz-neon bg-tamayoz-neon/15 text-tamayoz-neon" : "border-white/10 bg-white/[0.03] text-white/70"}`}>
                    {on ? "✓ " : ""}
                    {p.number} {p.name}
                  </button>
                );
              })}
          </div>
          {byId.size > 0 && state.players.every((p) => assigned.has(p.id)) && <p className="text-sm text-white/50">كل اللاعبين في التشكيلة الأساسية</p>}
        </Card>
        <button type="button" className="btn-primary w-full" onClick={save} disabled={busy}>
          {busy ? "جارٍ الحفظ..." : "💾 حفظ التشكيلة"}
        </button>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-2 text-center text-sm font-bold text-white/60">معاينة</p>
        <Pitch formation={draft} players={state.players} />
      </div>
    </div>
  );
}
