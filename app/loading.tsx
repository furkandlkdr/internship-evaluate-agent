export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <p className="mt-4 text-sm text-zinc-600">Yükleniyor…</p>
    </div>
  );
}
