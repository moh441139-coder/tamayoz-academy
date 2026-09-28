import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-neon">404</p>
      <h1 className="mt-3 text-2xl font-black">الصفحة غير موجودة</h1>
      <p className="mt-2 text-white/60">يبدو أن الكرة خرجت خارج الملعب ⚽</p>
      <Link href="/" className="btn-primary mt-6">العودة للرئيسية</Link>
    </main>
  );
}
