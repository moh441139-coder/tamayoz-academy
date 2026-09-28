import Link from "next/link";

interface Props {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}

export function PageShell({ title, subtitle, children, wide }: Props) {
  return (
    <main className={`mx-auto w-full px-4 pb-16 pt-5 sm:px-6 ${wide ? "max-w-6xl" : "max-w-3xl"}`}>
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl transition hover:bg-white/10"
          aria-label="العودة للرئيسية"
        >
          →
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black sm:text-3xl">
            <span className="text-gradient">{title}</span>
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-white/55">{subtitle}</p>}
        </div>
      </header>
      {children}
    </main>
  );
}
