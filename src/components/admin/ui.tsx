"use client";

import { motion } from "framer-motion";

export function Card({ title, icon, children, actions }: { title: string; icon?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black">
          {icon && <span className="ml-1.5">{icon}</span>}
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </motion.section>
  );
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-right transition hover:bg-white/[0.06] disabled:opacity-50"
    >
      <span>
        <span className="block font-bold">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-white/50">{description}</span>}
      </span>
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? "bg-tamayoz-neon" : "bg-white/15"}`}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-6 w-6 rounded-full bg-white shadow"
          style={{ right: checked ? 4 : undefined, left: checked ? undefined : 4 }}
        />
      </span>
    </button>
  );
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 text-center">
      <p className="text-xs text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-black tabular">{value}</p>
    </div>
  );
}
