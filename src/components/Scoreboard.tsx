"use client";

import { AnimatePresence, motion } from "framer-motion";

function Digit({ value, className }: { value: number; className: string }) {
  return (
    <span className={`relative inline-flex min-w-[1ch] justify-center overflow-hidden tabular ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "-60%", opacity: 0, scale: 1.4 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "60%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** النتيجة: المستضيف (التميز) يمين الشاشة في RTL */
export function Scoreboard({ home, away, large }: { home: number; away: number; large?: boolean }) {
  const cls = large ? "text-[9rem] lg:text-[13rem] leading-none" : "text-6xl sm:text-7xl";
  return (
    <div className="flex items-center justify-center gap-4 font-black" dir="rtl">
      <Digit value={home} className={`${cls} text-neon`} />
      <span className={`${large ? "text-7xl" : "text-4xl"} text-white/30`}>-</span>
      <Digit value={away} className={`${cls} text-indigo-200`} />
    </div>
  );
}
