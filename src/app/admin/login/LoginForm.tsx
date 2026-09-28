"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch, ClientApiError } from "@/lib/client";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/admin/login", { method: "POST", json: { password } });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "حدث خطأ غير متوقع");
      setLoading(false);
    }
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass neon-border w-full max-w-sm space-y-5 p-6"
    >
      <div className="text-center">
        <p className="text-4xl">🔐</p>
        <h1 className="mt-2 text-2xl font-black">لوحة المشرف</h1>
        <p className="mt-1 text-sm text-white/55">أكاديمية التميز 🆚 رحب</p>
      </div>
      <div>
        <label htmlFor="password" className="label">كلمة المرور</label>
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            className="input pl-16"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/60 hover:text-white"
          >
            {show ? "إخفاء" : "إظهار"}
          </button>
        </div>
      </div>
      {error && (
        <p className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading || !password}>
        {loading ? "جارٍ الدخول..." : "دخول"}
      </button>
    </motion.form>
  );
}
