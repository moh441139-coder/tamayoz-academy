"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { AdminState } from "@/lib/admin-state";
import { apiFetch, ClientApiError } from "@/lib/client";
import { STATUS_LABELS } from "@/lib/time";
import { AdminContext, type AdminContextValue, type Toast } from "./context";
import { DataSection } from "./DataSection";
import { EngagementSection } from "./EngagementSection";
import { FormationSection } from "./FormationSection";
import { LiveSection } from "./LiveSection";
import { MatchSection } from "./MatchSection";
import { PlayersSection } from "./PlayersSection";

const TABS = [
  { id: "live", label: "النتيجة", icon: "⚽" },
  { id: "match", label: "المباراة", icon: "📅" },
  { id: "players", label: "اللاعبين", icon: "👕" },
  { id: "formation", label: "التشكيلة", icon: "🧩" },
  { id: "engagement", label: "التوقعات والتصويت", icon: "🎯" },
  { id: "data", label: "الفائزين والبيانات", icon: "🏆" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard({ initial }: { initial: AdminState }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [tab, setTab] = useState<TabId>("live");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("admin-tab") as TabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setTab(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const selectTab = (id: TabId) => {
    setTab(id);
    try {
      sessionStorage.setItem("admin-tab", id);
    } catch {
      /* ignore */
    }
  };

  const notify = useCallback((kind: Toast["kind"], message: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 5000 : 2500);
  }, []);

  const reload = useCallback(async () => {
    try {
      setState(await apiFetch<AdminState>("/api/admin/state"));
    } catch (e) {
      if (e instanceof ClientApiError && e.status === 401) router.replace("/admin/login");
    }
  }, [router]);

  const run = useCallback<AdminContextValue["run"]>(
    async (fn, success) => {
      try {
        const res = await fn();
        if (success) notify("success", typeof success === "function" ? success(res) : success);
        await reload();
        return res;
      } catch (e) {
        if (e instanceof ClientApiError && e.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        notify("error", e instanceof ClientApiError ? e.message : "حدث خطأ غير متوقع");
        return null;
      }
    },
    [notify, reload, router],
  );

  // تحديث دوري للأصوات والتوقعات
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, 10_000);
    return () => clearInterval(t);
  }, [reload]);

  async function logout() {
    await apiFetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
    router.refresh();
  }

  const ctx = useMemo<AdminContextValue>(() => ({ state, reload, run, notify }), [state, reload, run, notify]);
  const warnings: string[] = [];
  if (!state.system.redis) warnings.push("Upstash Redis غير مهيأ — البيانات مؤقتة وستضيع. أضف UPSTASH_REDIS_REST_URL و UPSTASH_REDIS_REST_TOKEN.");
  if (!state.system.blob) warnings.push("Vercel Blob غير مهيأ — رفع الصور معطل. أضف BLOB_READ_WRITE_TOKEN.");

  return (
    <AdminContext.Provider value={ctx}>
      <div className="min-h-dvh pb-24">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-night-800/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black">
                <span className="text-gradient">لوحة المشرف</span>
              </h1>
              <p className="truncate text-xs text-white/55">
                {state.match.home.shortName} {state.match.homeScore} - {state.match.awayScore} {state.match.away.shortName} •{" "}
                {STATUS_LABELS[state.match.effectiveStatus]}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/" target="_blank" className="btn-ghost px-3 py-2 text-xs">الموقع</Link>
              <Link href="/screen" target="_blank" className="btn-ghost hidden px-3 py-2 text-xs sm:inline-flex">الشاشة</Link>
              <Link href="/qr" target="_blank" className="btn-ghost hidden px-3 py-2 text-xs sm:inline-flex">QR</Link>
              <button type="button" onClick={logout} className="btn px-3 py-2 text-xs text-red-300 hover:bg-red-500/10">خروج</button>
            </div>
          </div>
          <nav className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-4 pb-3" aria-label="أقسام اللوحة">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => selectTab(t.id)}
                className={`relative shrink-0 rounded-xl px-3.5 py-2 text-sm font-bold transition ${tab === t.id ? "text-night-900" : "text-white/70 hover:bg-white/5"}`}
              >
                {tab === t.id && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-tamayoz-neon" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  {t.icon} {t.label}
                </span>
              </button>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 pt-5">
          {warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {warnings.map((w) => (
                <p key={w} className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">
                  ⚠️ {w}
                </p>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {tab === "live" && <LiveSection />}
              {tab === "match" && <MatchSection />}
              {tab === "players" && <PlayersSection />}
              {tab === "formation" && <FormationSection />}
              {tab === "engagement" && <EngagementSection />}
              {tab === "data" && <DataSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10 }}
                className={`pointer-events-auto rounded-2xl px-5 py-3 text-sm font-bold shadow-2xl ${t.kind === "success" ? "bg-tamayoz-neon text-night-900" : "bg-red-500 text-white"}`}
                role={t.kind === "error" ? "alert" : "status"}
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
