import ApplicationForm from "@/components/ApplicationForm";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Hafif golden glow — sağ alt köşe */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-20 -right-20 h-96 w-96 rounded-full bg-amber-200/30 blur-[100px]"
      />

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
