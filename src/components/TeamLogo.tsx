import Image from "next/image";
import type { TeamSide } from "@/lib/types";

const THEMES: Record<TeamSide, { from: string; to: string; ring: string; glow: string }> = {
  home: { from: "#0B5E5E", to: "#4FE3C8", ring: "rgba(79,227,200,0.65)", glow: "rgba(79,227,200,0.45)" },
  away: { from: "#6268B0", to: "#04AE9F", ring: "rgba(98,104,176,0.75)", glow: "rgba(98,104,176,0.5)" },
};

interface Props {
  side: TeamSide;
  name: string;
  logo: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function TeamLogo({ side, name, logo, size = 112, className = "", priority }: Props) {
  const t = THEMES[side];
  return (
    <div
      className={`relative shrink-0 rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 2px ${t.ring}, 0 0 ${size / 3}px ${t.glow}`,
      }}
    >
      {logo ? (
        <Image
          src={logo}
          alt={`شعار ${name}`}
          fill
          sizes={`${size}px`}
          priority={priority}
          className="rounded-full bg-white/95 object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full p-2 text-center font-black leading-tight text-white"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${t.to}, ${t.from} 70%)`,
            fontSize: Math.max(12, size / (name.length > 6 ? 6.5 : 4.2)),
            textShadow: "0 2px 8px rgba(0,0,0,0.45)",
          }}
          role="img"
          aria-label={`شعار ${name}`}
        >
          <span className="absolute inset-[6%] rounded-full border border-dashed border-white/35" aria-hidden />
          {name}
        </div>
      )}
    </div>
  );
}
