export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="جارٍ التحميل">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-tamayoz-neon/20 border-t-tamayoz-neon" />
    </div>
  );
}
