"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client";
import { POSITION_LABELS } from "@/lib/constants";
import type { Player, Position } from "@/lib/types";
import { PlayerAvatar } from "../PlayerAvatar";
import { useAdmin } from "./context";
import { ImageUploader } from "./ImageUploader";
import { Card } from "./ui";

const POSITIONS = Object.entries(POSITION_LABELS) as [Position, { short: string; ar: string }][];

function PlayerRow({ player }: { player: Player }) {
  const { run } = useAdmin();
  const [name, setName] = useState(player.name);
  const [number, setNumber] = useState(String(player.number));
  const [position, setPosition] = useState<Position>(player.position);
  const [busy, setBusy] = useState(false);
  const dirty = name !== player.name || Number(number) !== player.number || position !== player.position;

  async function save() {
    setBusy(true);
    await run(
      () => apiFetch("/api/admin/players", { method: "PATCH", json: { id: player.id, name, number: Number(number), position } }),
      "تم حفظ اللاعب",
    );
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`حذف اللاعب ${player.name} نهائياً؟`)) return;
    setBusy(true);
    await run(() => apiFetch("/api/admin/players", { method: "DELETE", json: { id: player.id } }), "تم حذف اللاعب");
    setBusy(false);
  }

  return (
    <li className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
      <ImageUploader
        target={{ kind: "player", playerId: player.id }}
        current={player.photo}
        label={`صورة ${player.name}`}
        size={64}
        fallback={<PlayerAvatar number={player.number} name={player.name} photo={null} size={64} ring={false} />}
      />
      <div className="mt-3 grid grid-cols-[72px_1fr] gap-2 sm:grid-cols-[72px_1fr_140px]">
        <input type="number" min={1} max={99} className="input text-center font-black tabular" value={number} onChange={(e) => setNumber(e.target.value)} aria-label="الرقم" />
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="الاسم" maxLength={40} />
        <select className="input col-span-2 sm:col-span-1" value={position} onChange={(e) => setPosition(e.target.value as Position)} aria-label="المركز">
          {POSITIONS.map(([k, v]) => (
            <option key={k} value={k}>
              {v.short} — {v.ar}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-primary flex-1 py-2 text-sm" onClick={save} disabled={!dirty || busy}>
          💾 حفظ
        </button>
        <button type="button" className="btn py-2 text-sm text-red-300 hover:bg-red-500/10" onClick={remove} disabled={busy}>
          🗑️ حذف اللاعب
        </button>
      </div>
    </li>
  );
}

export function PlayersSection() {
  const { state, run } = useAdmin();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState<Position>("PL");
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await run(
      () => apiFetch("/api/admin/players", { method: "POST", json: { name, number: Number(number), position } }),
      "تمت إضافة اللاعب",
    );
    if (res) {
      setName("");
      setNumber("");
      setPosition("PL");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <Card title="إضافة لاعب" icon="➕">
        <form onSubmit={add} className="grid grid-cols-[80px_1fr] gap-2 sm:grid-cols-[80px_1fr_150px_auto]">
          <input type="number" min={1} max={99} className="input text-center tabular" placeholder="رقم" value={number} onChange={(e) => setNumber(e.target.value)} required />
          <input className="input" placeholder="اسم اللاعب" value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} />
          <select className="input col-span-2 sm:col-span-1" value={position} onChange={(e) => setPosition(e.target.value as Position)}>
            {POSITIONS.map(([k, v]) => (
              <option key={k} value={k}>
                {v.short} — {v.ar}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary col-span-2 sm:col-span-1" disabled={busy || !name || !number}>
            إضافة
          </button>
        </form>
      </Card>

      <Card title={`اللاعبون (${state.players.length})`} icon="👕">
        <p className="mb-3 text-xs text-white/50">ارفع الصور مباشرة من الجوال (الكاميرا أو المعرض) — عند الاستبدال تُحذف الصورة القديمة تلقائياً</p>
        <ul className="grid gap-3 lg:grid-cols-2">
          {state.players.map((p) => (
            <PlayerRow key={`${p.id}-${p.number}-${p.name}-${p.position}`} player={p} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
