export function StadiumBackground() {
  return (
    <div className="stadium-bg" aria-hidden>
      <div className="floodlight -rotate-[18deg]" style={{ insetInlineStart: "-8vw" }} />
      <div className="floodlight rotate-[18deg]" style={{ insetInlineEnd: "-8vw" }} />
      <div className="stadium-grid" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="0" y1="100" x2="50" y2="35" stroke="#4FE3C8" strokeWidth="0.15" />
        <line x1="100" y1="100" x2="50" y2="35" stroke="#6268B0" strokeWidth="0.15" />
        <circle cx="50" cy="78" r="14" fill="none" stroke="#4FE3C8" strokeWidth="0.12" />
        <line x1="0" y1="78" x2="100" y2="78" stroke="#4FE3C8" strokeWidth="0.1" />
      </svg>
      <div className="noise" />
    </div>
  );
}
