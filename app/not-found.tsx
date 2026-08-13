import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <h2 className="text-3xl font-bold text-zinc-900">404</h2>
      <p className="mt-2 text-lg text-zinc-600">Sayfa bulunamadı</p>
      <p className="mt-1 text-sm text-zinc-500">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
