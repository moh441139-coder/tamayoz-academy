"use client";

import { createContext, useContext } from "react";
import type { AdminState } from "@/lib/admin-state";

export interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}

export interface AdminContextValue {
  state: AdminState;
  reload: () => Promise<void>;
  /** ينفذ طلباً ويعرض رسالة ثم يعيد تحميل الحالة. يعيد true عند النجاح */
  run: <T>(fn: () => Promise<T>, success?: string | ((r: T) => string)) => Promise<T | null>;
  notify: (kind: Toast["kind"], message: string) => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminDashboard");
  return ctx;
}
