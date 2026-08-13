import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/DashboardContent";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Kimlik doğrulama kontrolü
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, created_at, first_name, last_name, technologies, description, score, recommendation, evaluation_status, cv_filename"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase query error:", error.message);
    return (
      <div className="p-8 text-red-700">
        Veriler alınırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-xl font-semibold text-zinc-900">
            Başvuru Yönetimi
          </h1>
          <form action="/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Çıkış Yap
            </button>
          </form>
        </div>
      </header>

      <DashboardContent rows={data ?? []} />
    </div>
  );
}
