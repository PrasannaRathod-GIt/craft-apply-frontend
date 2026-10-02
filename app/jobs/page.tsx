"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api/client";

type Job = {
  id: number;
  slug: string;
  title: string;
  company?: string;
  location?: string;
  short_desc?: string;
  image_url?: string | null;
  posted_date?: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<any>("/jobs")
      .then((d) => setJobs(Array.isArray(d) ? d : d.items ?? d.jobs ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load jobs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
      {/* Top bar - mirrors the Craft page's AI Resume button, top-left */}
      <header className="mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="group relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white
                     bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]
                     shadow-lg shadow-purple-500/30 transition-all duration-300 ease-out
                     hover:scale-105 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-purple-500/50
                     active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            AI Resume
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Jobs</h1>
      </header>

      {loading && <p className="text-center text-gray-500">Loading jobs...</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {!loading && !error && jobs.length === 0 && (
        <p className="text-center text-gray-500">No jobs found right now.</p>
      )}

      <div className="flex flex-col gap-4">
        {jobs.map((j) => (
          <Link
            key={j.id}
            href={`/jobs/${j.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4
                       shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
          >
            {j.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={j.image_url}
                alt=""
                className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xl font-bold text-gray-300">
                {(j.company || j.title || "?").charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold text-gray-900 group-hover:text-purple-700">
                {j.title}
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                {j.company}
                {j.location ? ` · ${j.location}` : ""}
              </p>
              {j.short_desc && (
                <p className="mt-1 line-clamp-1 text-sm text-gray-600">{j.short_desc}</p>
              )}
            </div>

            <span className="flex-shrink-0 text-sm font-medium text-purple-600">
              View details &rarr;
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}