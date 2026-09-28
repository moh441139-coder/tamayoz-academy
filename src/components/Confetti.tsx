"use client";

import { useEffect } from "react";

/** احتفال بالقصاصات الملونة بألوان الفريقين */
export function Confetti({ active, burstKey }: { active: boolean; burstKey?: string | number }) {
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let raf = 0;
    (async () => {
      const confetti = (await import("canvas-confetti")).default;
      if (cancelled) return;
      const colors = ["#4FE3C8", "#0B5E5E", "#04AE9F", "#6268B0", "#ffffff", "#FFD166"];
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors, zIndex: 60 });
      const end = Date.now() + 2800;
      const frame = () => {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 60 });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 60 });
        if (Date.now() < end && !cancelled) raf = requestAnimationFrame(frame);
      };
      frame();
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, burstKey]);
  return null;
}
