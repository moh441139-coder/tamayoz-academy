"use client";

import { motion } from "framer-motion";

interface Props {
  label: React.ReactNode;
  pct: number;
  value?: React.ReactNode;
  color?: string;
  highlight?: boolean;
  large?: boolean;
}

export function PercentBar({ label, pct, value, color = "from-tamayoz-neon to-rahab", highlight, large }: Props) {
  return (
    <div className={large ? "space-y-2" : "space-y-1.5"}>
      <div className={`flex items-center justify-between gap-3 ${large ? "text-2xl lg:text-3xl" : "text-sm"}`}>
        <span className={`min-w-0 truncate font-bold ${highlight ? "text-neon" : "text-white/90"}`}>{label}</span>
        <span className="shrink-0 font-bold tabular text-white/75">{value ?? `${pct}%`}</span>
      </div>
      <div className={`overflow-hidden rounded-full bg-white/[0.07] ${large ? "h-5" : "h-3"}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-l ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          style={{ boxShadow: "0 0 14px rgba(79,227,200,0.45)" }}
        />
      </div>
    </div>
  );
}
