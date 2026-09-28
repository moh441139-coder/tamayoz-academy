"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client";
import { PredictionStatsCard } from "../PredictionStatsCard";
import { VoteResults } from "../VoteResults";
import { useAdmin } from "./context";
import { Card, Toggle } from "./ui";

export function EngagementSection() {
  const { state, run } = useAdmin();
  const [busy, setBusy] = useState(false);
  const s = state.settings;

  async function patch(body: Record<string, boolean>, msg: string) {
    setBusy(true);
    await run(() => apiFetch("/api/admin/settings", { method: "PATCH", json: body }), msg);
    setBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <Card title="التوقعات" icon="🎯">
          <Toggle
            checked={s.predictionsOpen}
            onChange={(v) => patch({ predictionsOpen: v }, v ? "تم فتح التوقعات" : "تم إغلاق التوقعات")}
            label="استقبال التوقعات"
            description="تُغلق تلقائياً عند بداية المباراة حتى لو كانت مفعّلة"
            disabled={busy}
          />
          <p className="mt-3 text-sm">
            الحالة الفعلية الآن:{" "}
            <b className={s.predictionsAccepting ? "text-tamayoz-neon" : "text-red-300"}>{s.predictionsAccepting ? "مفتوحة ✅" : "مغلقة 🔒"}</b>
          </p>
        </Card>
        <PredictionStatsCard stats={state.predictionStats} match={state.match} />
      </div>
      <div className="space-y-4">
        <Card title="التصويت على رجل المباراة" icon="⭐">
          <Toggle
            checked={s.votingOpen}
            onChange={(v) => {
              if (!v && !window.confirm("إغلاق التصويت وإعلان رجل المباراة (الأعلى أصواتاً)؟")) return;
              patch({ votingOpen: v }, v ? "تم فتح التصويت" : "تم إغلاق التصويت وإعلان رجل المباراة");
            }}
            label="التصويت مفتوح"
            description="عند الإغلاق يُعلن الأعلى أصواتاً رجلاً للمباراة مع احتفال"
            disabled={busy}
          />
        </Card>
        <Card title={`النتائج (${state.votes.total} صوت)`} icon="📊">
          <VoteResults summary={state.votes} players={state.players} limit={16} highlightId={state.match.manOfMatchId} />
        </Card>
      </div>
    </div>
  );
}
