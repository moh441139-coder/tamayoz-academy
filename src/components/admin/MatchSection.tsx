"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client";
import { TeamLogo } from "../TeamLogo";
import { useAdmin } from "./context";
import { ImageUploader } from "./ImageUploader";
import { Card, Field } from "./ui";

export function MatchSection() {
  const { state, run } = useAdmin();
  const m = state.match;
  const initialForm = () => ({
    date: m.date,
    startTime: m.startTime,
    endTime: m.endTime,
    venue: m.venue,
    title: m.title,
    organizer: m.organizer,
    homeName: m.home.name,
    homeShortName: m.home.shortName,
    awayName: m.away.name,
    awayShortName: m.away.shortName,
  });
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // مزامنة عند تحديث البيانات من الخادم
  useEffect(() => {
    setForm(initialForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m.updatedAt]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await run(() => apiFetch("/api/admin/match", { method: "PATCH", json: form }), "تم حفظ بيانات المباراة");
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <Card title="موعد ومكان المباراة" icon="📅">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="التاريخ" htmlFor="date">
              <input id="date" type="date" className="input" value={form.date} onChange={set("date")} required />
            </Field>
            <Field label="وقت البداية" htmlFor="start">
              <input id="start" type="time" className="input" value={form.startTime} onChange={set("startTime")} required />
            </Field>
            <Field label="وقت النهاية" htmlFor="end" hint="الافتراضي 7:45 مساءً">
              <input id="end" type="time" className="input" value={form.endTime} onChange={set("endTime")} required />
            </Field>
          </div>
          <Field label="المكان" htmlFor="venue">
            <input id="venue" className="input" value={form.venue} onChange={set("venue")} required maxLength={120} />
          </Field>
          <Field label="الجهة المنظمة" htmlFor="org">
            <input id="org" className="input" value={form.organizer} onChange={set("organizer")} required maxLength={120} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم الفريق المستضيف" htmlFor="hn">
              <input id="hn" className="input" value={form.homeName} onChange={set("homeName")} required maxLength={60} />
            </Field>
            <Field label="الاسم المختصر للمستضيف" htmlFor="hs">
              <input id="hs" className="input" value={form.homeShortName} onChange={set("homeShortName")} required maxLength={30} />
            </Field>
            <Field label="اسم الفريق الضيف" htmlFor="an">
              <input id="an" className="input" value={form.awayName} onChange={set("awayName")} required maxLength={60} />
            </Field>
            <Field label="الاسم المختصر للضيف" htmlFor="as">
              <input id="as" className="input" value={form.awayShortName} onChange={set("awayShortName")} required maxLength={30} />
            </Field>
          </div>
          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "💾 حفظ"}
          </button>
        </form>
      </Card>

      <Card title="الشعارات" icon="🛡️">
        <p className="mb-4 text-xs text-white/50">JPG / PNG / HEIC حتى 5MB — تُقص مربعة وتحوّل WebP تلقائياً</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 font-bold">{m.home.name}</p>
            <ImageUploader
              target={{ kind: "logo", side: "home" }}
              current={m.home.logo}
              label={`شعار ${m.home.name}`}
              fallback={<TeamLogo side="home" name={m.home.shortName} logo={null} size={96} />}
            />
          </div>
          <div>
            <p className="mb-2 font-bold">{m.away.name}</p>
            <ImageUploader
              target={{ kind: "logo", side: "away" }}
              current={m.away.logo}
              label={`شعار ${m.away.name}`}
              fallback={<TeamLogo side="away" name={m.away.shortName} logo={null} size={96} />}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
