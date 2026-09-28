"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl">⚠️</p>
      <h1 className="mt-3 text-2xl font-black">حدث خطأ غير متوقع</h1>
      <p className="mt-2 text-white/60">حاول مرة أخرى بعد لحظات</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        إعادة المحاولة
      </button>
    </main>
  );
}
