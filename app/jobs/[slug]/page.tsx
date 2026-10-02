"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api/client";

type Job = {
  title: string;
  company?: string;
  location?: string;
  description?: string;
  apply_url?: string;
  source?: string;
  posted_date?: string;
};

const SOURCE_LABEL: Record<string, string> = {
  adzuna: "Adzuna",
  greenhouse: "Greenhouse",
  internshala: "Internshala",
  linkedin: "LinkedIn",
  indeed: "Indeed",
};

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Job>(`/jobs/${slug}`)
      .then(setJob)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load this job."));
  }, [slug]);

  const sourceName = job?.source ? SOURCE_LABEL[job.source] ?? job.source : "the original site";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
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
        <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-800">
          All jobs
        </Link>
      </header>

      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      {!error && !job && <p className="text-center text-gray-500">Loading...</p>}

      {job && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-1 text-gray-500">
            {job.company}
            {job.location ? ` · ${job.location}` : ""}
            {job.posted_date ? ` · Posted ${job.posted_date}` : ""}
          </p>
          {job.source && (
            <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              via {sourceName}
            </span>
          )}

          <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-gray-700">
            {job.description}
          </div>

          {job.apply_url && (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group relative mt-8 inline-block overflow-hidden rounded-full px-8 py-3 text-sm font-semibold text-white
                         bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]
                         shadow-lg shadow-purple-500/30 transition-all duration-300 ease-out
                         hover:scale-105 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-purple-500/50
                         active:scale-95"
            >
              View full listing on {sourceName} &rarr;
            </a>
          )}
        </div>
      )}
    </main>
  );
}