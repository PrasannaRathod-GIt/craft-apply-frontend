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

function LogoMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-black/15 bg-white text-sm font-bold text-[#202020]">
      C
    </span>
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Job>(`/jobs/${slug}`)
      .then(setJob)
      .catch((e) =>
        setError(e instanceof ApiError ? e.message : "Could not load this job.")
      );
  }, [slug]);

  const sourceName = job?.source
    ? SOURCE_LABEL[job.source] ?? job.source
    : "the original site";

  return (
    <main className="min-h-screen bg-[#fbfbf9] text-[#202020]">
      <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[#fbfbf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Craft & Apply home">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">
              Craft &amp; Apply
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="text-[14px] font-medium text-[#686863] transition-colors hover:text-[#202020]"
            >
              All jobs
            </Link>
            <Link
              href="/"
              className="rounded-full bg-[#202020] px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
            >
              AI Resume
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-[14px] text-red-700">
            {error}
          </div>
        )}

        {!error && !job && (
          <div className="rounded-[28px] border border-black/[0.08] bg-white px-6 py-16 text-center shadow-[0_10px_35px_rgba(0,0,0,0.03)]">
            <p className="text-[15px] text-[#777770]">Loading job...</p>
          </div>
        )}

        {job && (
          <div className="overflow-hidden rounded-[28px] border border-black/[0.08] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.05)]">
            {/* Job header */}
            <div className="border-b border-black/[0.07] bg-[#fbfbf9] px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a84]">
                    Job opportunity
                  </p>

                  <h1 className="mt-2.5 text-[28px] font-bold leading-tight tracking-[-0.03em] text-[#202020] sm:text-[36px]">
                    {job.title}
                  </h1>

                  <p className="mt-3 text-[15px] leading-6 text-[#66665f] sm:text-[16px]">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ""}
                    {job.posted_date ? ` · Posted ${job.posted_date}` : ""}
                  </p>

                  {job.source && (
                    <span className="mt-4 inline-flex rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-medium text-[#66665f]">
                      via {sourceName}
                    </span>
                  )}
                </div>

                {job.apply_url && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#202020] px-5 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
                  >
                    Apply now
                    <ArrowRight />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="px-6 py-7 sm:px-8 sm:py-9">
              <div className="max-w-3xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8a84]">
                  About the role
                </p>

                <div className="mt-5 whitespace-pre-line text-[15px] leading-8 text-[#555550] sm:text-[16px]">
                  {job.description}
                </div>
              </div>

              {job.apply_url && (
                <div className="mt-10 border-t border-black/[0.07] pt-7">
                  <p className="text-[14px] leading-6 text-[#777770]">
                    Ready to apply? Continue to the original listing on {sourceName}.
                  </p>

                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="group mt-4 inline-flex items-center gap-2 rounded-full bg-[#202020] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
                  >
                    View full listing on {sourceName}
                    <ArrowRight />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
