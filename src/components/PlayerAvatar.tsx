import Image from "next/image";

interface Props {
  number: number;
  name: string;
  photo: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}

export function PlayerAvatar({ number, name, photo, size = 56, className = "", ring = true }: Props) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${ring ? "ring-2 ring-tamayoz-neon/70" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {photo ? (
        <Image src={photo} alt={name} fill sizes={`${Math.ceil(size * 2)}px`} className="object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-black text-white tabular"
          style={{
            background: "radial-gradient(circle at 30% 25%, #4FE3C8 0%, #0B5E5E 65%, #073838 100%)",
            fontSize: size * 0.42,
            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
          }}
          role="img"
          aria-label={`${name} رقم ${number}`}
        >
          {number}
        </div>
      )}
    </div>
  );
}
