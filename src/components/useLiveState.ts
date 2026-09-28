"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/client";
import type { PublicState } from "@/lib/types";

/** يجلب حالة المباراة بشكل دوري ويتوقف عند إخفاء الصفحة */
export function useLiveState(initial: PublicState, intervalMs = 10_000) {
  const [state, setState] = useState<PublicState>(initial);
  const [offset, setOffset] = useState(() => initial.now - Date.now());
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const next = await apiFetch<PublicState>("/api/state");
      setState(next);
      setOffset(next.now - Date.now());
    } catch {
      /* نحتفظ بآخر حالة */
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (timer) return;
      timer = setInterval(refresh, intervalMs);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        refresh();
        start();
      } else stop();
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, intervalMs]);

  return { state, refresh, serverOffset: offset };
}

/** ساعة محلية متزامنة مع وقت الخادم */
export function useNow(serverOffset = 0, tickMs = 1000) {
  const [now, setNow] = useState(() => Date.now() + serverOffset);
  useEffect(() => {
    setNow(Date.now() + serverOffset);
    const t = setInterval(() => setNow(Date.now() + serverOffset), tickMs);
    return () => clearInterval(t);
  }, [serverOffset, tickMs]);
  return now;
}
