"use client";

import { AnimatePresence, motion } from "framer-motion";

function Unit({ value, label, large }: { value: number; label: string; large?: boolean }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative overflow-hidden rounded-2xl border border-tamayoz-neon/25 bg-night-900/80 shadow-neon ${
          large ? "h-28 w-24 lg:h-40 lg:w-36" : "h-16 w-14 sm:h-20 sm:w-16"
        }`}
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={v}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className={`absolute inset-0 flex items-center justify-center font-black text-neon tabular ${
              large ? "text-6xl lg:text-8xl" : "text-3xl sm:text-4xl"
            }`}
          >
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={`mt-2 font-medium text-white/60 ${large ? "text-xl lg:text-2xl" : "text-xs sm:text-sm"}`}>
        {label}
      </span>
    </div>
  );
}

export function Countdown({ target, now, large }: { target: number; now: number; large?: boolean }) {
  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return (
    <div className="flex items-start justify-center gap-2 sm:gap-3" dir="rtl" aria-live="polite">
      {days > 0 && <Unit value={days} label="يوم" large={large} />}
      <Unit value={hours} label="ساعة" large={large} />
      <Unit value={minutes} label="دقيقة" large={large} />
      <Unit value={seconds} label="ثانية" large={large} />
    </div>
  );
}
