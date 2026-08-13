"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Fuse from "fuse.js";

interface ApplicationRow {
  id: number;
  created_at: string;
  first_name: string;
  last_name: string;
  technologies: string;
  description: string;
  score: number | null;
  recommendation: string | null;
  evaluation_status: string | null;
  cv_filename: string | null;
}

interface DashboardContentProps {
  rows: ApplicationRow[];
}

const RECOMMENDATION_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "Evet", label: "Evet" },
  { value: "Belki", label: "Belki" },
  { value: "Hayır", label: "Hayır" },
];

export default function DashboardContent({ rows }: DashboardContentProps) {
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recFilter, setRecFilter] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: 3+ karakter ve 100ms bekleme
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const trimmed = value.trim();
      if (trimmed.length >= 3) {
        timerRef.current = setTimeout(() => {
          setDebouncedSearch(trimmed.toLowerCase());
        }, 100);
      } else {
        setDebouncedSearch("");
      }
    },
    []
  );

  // Fuse.js ile fuzzy search hazırlığı
  const fuse = useMemo(() => {
    return new Fuse(rows, {
      keys: [
        { name: "first_name", weight: 0.3 },
        { name: "last_name", weight: 0.3 },
        { name: "technologies", weight: 0.25 },
        { name: "description", weight: 0.15 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [rows]);

  // Filtreleme
  const filtered = useMemo(() => {
    let result = rows;

    // Recommendation filtresi
    if (recFilter) {
      result = result.filter((r) => r.recommendation === recFilter);
    }

    // Fuzzy search (3+ karakter ve debounced)
    if (debouncedSearch.length >= 3) {
      const fuseResults = fuse.search(debouncedSearch);
      result = fuseResults.map((r) => r.item);
      // Eğer fuzzy sonuç boşsa, fallback olarak basit includes yap
      if (result.length === 0) {
        const q = debouncedSearch.toLowerCase();
        result = rows.filter(
          (r) =>
            r.first_name.toLowerCase().includes(q) ||
            r.last_name.toLowerCase().includes(q) ||
            r.technologies.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        );
      }
    }

    return result;
  }, [rows, recFilter, debouncedSearch, fuse]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Arama ve filtreleme */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            type="text"
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="İsim, soyisim veya teknoloji ara… (en az 3 karakter)"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
          {debouncedSearch.length >= 3 && (
            <p className="mt-1 text-xs text-zinc-500">
              {filtered.length} sonuç bulundu
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {RECOMMENDATION_OPTIONS.map((opt) => {
            const active = recFilter === opt.value;
            return (
              <button
                key={opt.value || "all"}
                onClick={() => setRecFilter(opt.value)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">Puan</th>
              <th className="px-4 py-3 font-medium">Öneri</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Sonuç bulunamadı.
                </td>
              </tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-50">
                <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                  {new Date(row.created_at).toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {row.first_name} {row.last_name}
                </td>
                <td className="px-4 py-3 text-zinc-700">
                  {row.score != null && !isNaN(Number(row.score))
                    ? `${Number(row.score)}/100`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <RecommendationBadge value={row.recommendation} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={row.evaluation_status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/applications/${row.id}`}
                    className="text-sm font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-700"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

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
