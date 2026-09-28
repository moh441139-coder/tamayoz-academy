/** سطر نتيجة ثابت الاتجاه: المستضيف دائماً على اليمين */
export function ScoreLine({ home, away, className = "text-5xl" }: { home: number; away: number; className?: string }) {
  return (
    <p className={`flex items-center justify-center gap-3 font-black tabular ${className}`} dir="rtl">
      <span className="text-neon">{home}</span>
      <span className="text-white/30">-</span>
      <span className="text-indigo-200">{away}</span>
    </p>
  );
}
