"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MatchStatus } from "@/lib/types";

const STYLES: Record<MatchStatus, { label: string; cls: string }> = {
  UPCOMING: { label: "قريباً", cls: "border-tamayoz-neon/40 bg-tamayoz-neon/10 text-tamayoz-neon" },
  LIVE: { label: "مباشر", cls: "border-red-500/60 bg-red-500/15 text-red-300 shadow-neon-red" },
  FINISHED: { label: "انتهت", cls: "border-rahab-violet/60 bg-rahab-violet/15 text-indigo-200" },
};

export function StatusBadge({ status, large = false }: { status: MatchStatus; large?: boolean }) {
  const s = STYLES[status];
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, y: -8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={`inline-flex items-center gap-2 rounded-full border font-bold ${s.cls} ${
          large ? "px-6 py-2 text-2xl lg:text-4xl" : "px-4 py-1.5 text-sm"
        }`}
        role="status"
      >
        {status === "LIVE" && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        )}
        {status === "LIVE" ? "مباشر 🔴" : s.label}
      </motion.span>
    </AnimatePresence>
  );
}
