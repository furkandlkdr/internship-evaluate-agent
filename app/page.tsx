import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hafif golden glow — sağ alt köşe */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-20 -right-20 h-96 w-96 rounded-full bg-amber-200/30 blur-[100px]"
      />

      {/* Admin girişi — sağ üst köşe, mobilde alt satır */}
      <div className="fixed top-4 right-4 z-20 sm:top-6 sm:right-6">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          Admin Girişi
        </Link>
      </div>

      <main className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Staj Başvurusu
          </h1>
          <p className="mt-3 text-base text-zinc-600">
            Başvurunuzu tamamlamak için aşağıdaki formu doldurun ve CV’nizi
            yükleyin. Başvurular AI destekli değerlendirme sürecinden
            geçecektir.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <ApplicationForm />
        </div>
      </main>
    </div>
  );
}
