import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface ApplicationDetail {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  technologies: string;
  description: string;
  score: number | null;
  recommendation: string | null;
  strengths: string | null;
  risks: string | null;
  reasoning: string | null;
  evaluation_details: Record<string, unknown> | null;
  evaluation_status: string | null;
  cv_filename: string | null;
  cv_path: string | null;
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    notFound();
  }

  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, created_at, first_name, last_name, technologies, description, score, recommendation, strengths, risks, reasoning, evaluation_details, evaluation_status, cv_filename, cv_path"
    )
    .eq("id", numericId)
    .single();

  if (error || !data) {
    notFound();
  }

  const app = data as ApplicationDetail;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              ← Listeye Dön
            </Link>
            <h1 className="text-xl font-semibold text-zinc-900">
              Başvuru #{app.id}
            </h1>
          </div>
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

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* Başvuru bilgileri */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Başvuru Bilgileri
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Ad
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {app.first_name}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Soyad
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {app.last_name}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Teknolojiler
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                  {app.technologies}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Açıklama
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                  {app.description}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  CV
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {app.cv_filename ? (
                    <a
                      href={`/api/cv?id=${app.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
                    >
                      {app.cv_filename}
                    </a>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* AI Değerlendirmesi */}
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              AI Değerlendirmesi
            </h2>

            {/* Puan + Progress Bar (0-100) */}
            {app.score !== null && app.score !== undefined && (
              <div className="mt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Toplam Puan
                    </dt>
                    <dd className="mt-1 text-3xl font-bold text-zinc-900">
                      {app.score}
                      <span className="ml-1 text-lg font-medium text-zinc-400">
                        / 100
                      </span>
                    </dd>
                  </div>
                  <span className="text-sm text-zinc-500">
                    %{Math.round((app.score / 100) * 100)}
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-800 transition-all"
                    style={{ width: `${Math.min((app.score / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Detaylı Kriterler — puanın hemen altında */}
            {app.evaluation_details && (
              <div className="mt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Detaylı Kriterler
                </dt>
                <dd className="mt-2">
                  <EvaluationDetailsGrid details={app.evaluation_details} />
                </dd>
              </div>
            )}

            {/* Öneri + Durum */}
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Öneri
                </dt>
                <dd className="mt-1">
                  <RecommendationBadge value={app.recommendation} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Durum
                </dt>
                <dd className="mt-1">
                  <StatusBadge value={app.evaluation_status} />
                </dd>
              </div>
            </dl>

            {app.strengths && (
              <div className="mt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Güçlü Yönler
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                  {app.strengths}
                </dd>
              </div>
            )}

            {app.risks && (
              <div className="mt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Riskler
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                  {app.risks}
                </dd>
              </div>
            )}

            {app.reasoning && (
              <div className="mt-6">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Gerekçe
                </dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                  {app.reasoning}
                </dd>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

/* ── Yardımcı Bileşenler ── */

function RecommendationBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-zinc-400">—</span>;

  const styles: Record<string, string> = {
    Evet: "bg-emerald-100 text-emerald-800",
    Belki: "bg-amber-100 text-amber-800",
    Hayır: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[value] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-zinc-400">Beklemede</span>;

  const styles: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
    processing: "bg-blue-100 text-blue-800",
  };

  const labels: Record<string, string> = {
    completed: "Tamamlandı",
    pending: "Beklemede",
    failed: "Başarısız",
    processing: "İşleniyor",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[value.toLowerCase()] ?? "bg-zinc-100 text-zinc-700"
      }`}
    >
      {labels[value.toLowerCase()] ?? value}
    </span>
  );
}

const CRITERIA_MAX: Record<string, number> = {
  rest_api: 20,
  llm_experience: 20,
  agentic_ai_mcp: 15,
  education: 10,
  automation_tools: 10,
  apify: 5,
  openai_anthropic_api: 5,
  lovable_cursor: 5,
  learning_research: 10,
};

const CRITERIA_LABELS: Record<string, string> = {
  rest_api: "REST API",
  llm_experience: "LLM Deneyimi",
  agentic_ai_mcp: "Agentic AI / MCP",
  education: "Eğitim",
  automation_tools: "Otomasyon Araçları",
  apify: "Apify",
  openai_anthropic_api: "OpenAI / Anthropic API",
  lovable_cursor: "Lovable / Cursor",
  learning_research: "Öğrenme / Araştırma",
};

function extractScore(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/");
      const first = Number(parts[0]);
      if (!isNaN(first)) return first;
    }
    const n = Number(trimmed);
    return isNaN(n) ? null : n;
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    for (const key of ["score", "value", "points", "rating", "point", "puan", "grade", "mark"]) {
      const val = obj[key];
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed.includes("/")) {
          const parts = trimmed.split("/");
          const first = Number(parts[0]);
          if (!isNaN(first)) return first;
        }
        const n = Number(trimmed);
        if (!isNaN(n)) return n;
      }
    }
  }
  return null;
}

function extractFeedback(raw: unknown): string | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    for (const key of ["feedback", "comment", "note", "notes", "explanation", "rationale", "reasoning"]) {
      const val = obj[key];
      if (typeof val === "string") return val;
    }
  }
  return undefined;
}

function EvaluationDetailsGrid({
  details,
}: {
  details: Record<string, unknown>;
}) {
  const entries = Object.entries(details).filter(([key]) => key in CRITERIA_MAX);

  if (entries.length === 0) {
    return (
      <pre className="overflow-x-auto rounded-md bg-zinc-50 p-3 text-xs text-zinc-800">
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([key, raw]) => {
        const score = extractScore(raw);
        const feedback = extractFeedback(raw);
        const max = CRITERIA_MAX[key] ?? 0;
        const pct = score !== null && max > 0 ? Math.min((score / max) * 100, 100) : 0;

        return (
          <div
            key={key}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-800">
                {CRITERIA_LABELS[key] ?? key}
              </span>
              <span className="text-sm font-bold text-zinc-900">
                {score !== null ? score : "—"}
                <span className="text-xs font-normal text-zinc-500">
                  {" "}
                  / {max}
                </span>
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-zinc-700 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            {feedback && (
              <p className="mt-2 text-xs text-zinc-600">{feedback}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
