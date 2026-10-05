"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api/client";
import { INDIA_CITIES } from "@/lib/india-cities";

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

// Matches the actual backend response shape from GET /jobs (confirmed via
// real test: {"jobs": [...], "page": 1, "total_pages": 9, "total": 72}) -
// previously this was silently discarded, which was the actual bug: the
// frontend only ever showed page 1's 8 jobs with no way to see the rest.
type JobsResponse = {
  jobs: Job[];
  page: number;
  total_pages: number;
  total: number;
};

const JOB_TYPES = ["Any", "Full-time", "Part-time", "Internship", "Remote"];

/* -------------------------------------------------
   Small hand-drawn Notion-style illustration
-------------------------------------------------- */
function JobsSketch({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 120" fill="none" className={className} aria-hidden="true">
      <rect x="30" y="18" width="92" height="72" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M47 38h52M47 49h38M47 60h45" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="145" cy="58" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M158 71l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M141 52c3-4 9-3 11 1M138 62c4 3 9 3 13 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M23 98q11-7 20 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [jobType, setJobType] = useState("Any");
  const [location, setLocation] = useState("Anywhere");
  const [cityQuery, setCityQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);

  // Pagination state - this is what was missing entirely before.
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Any filter change should reset back to page 1 - otherwise you could end
  // up on page 5 of a search that now only has 1 page of results.
  useEffect(() => {
    setPage(1);
  }, [q, jobType, location]);

  useEffect(() => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (jobType !== "Any") params.set("job_type", jobType);
    if (location !== "Anywhere") params.set("location", location);
    params.set("page", String(page));

    apiFetch<JobsResponse>(`/jobs?${params.toString()}`)
      .then((d) => {
        setJobs(d.jobs ?? []);
        setTotalPages(d.total_pages ?? 1);
        setTotal(d.total ?? 0);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load jobs."))
      .finally(() => setLoading(false));
  }, [q, jobType, location, page]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return INDIA_CITIES;
    return INDIA_CITIES.filter((c) => c.toLowerCase().includes(query));
  }, [cityQuery]);

  function goToPage(next: number) {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-gray-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#e9e6e1] bg-[#fbfaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900">
              C
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-gray-900 sm:text-base">
              Craft &amp; Apply
            </span>
          </Link>
          <Link
            href="/resume"
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
            AI Resume
          </Link>
        </div>
      </header>

      {/* Page intro */}
      <section className="mx-auto max-w-5xl px-5 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 translate-x-5">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              Jobs worth applying for.
            </h1>
            <div className="flex-shrink-0 text-gray-800">
              <JobsSketch className="h-16 w-auto sm:h-20" />
            </div>
          </div>

          <p className="mt-4 max-w-xl text-base leading-7 text-gray-600 sm:text-[17px]">
            Discover internships and jobs, find the right fit, and use Craft &amp; Apply to build a resume
            for the role.
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="mx-auto max-w-5xl px-5 sm:px-6">
        <div className="rounded-2xl border border-[#e4e0da] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 transition-all focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-100">
              <span className="text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jobs, companies, or keywords"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-[15px]"
              />
            </div>

            <div className="relative sm:w-60">
              <div className="flex items-center gap-3 rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 transition-all focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-100">
                <span className="text-gray-400">
                  <LocationIcon />
                </span>
                <input
                  type="text"
                  value={cityDropdownOpen ? cityQuery : location}
                  onFocus={() => {
                    setCityDropdownOpen(true);
                    setCityQuery("");
                  }}
                  onChange={(e) => setCityQuery(e.target.value)}
                  onBlur={() => setTimeout(() => setCityDropdownOpen(false), 150)}
                  placeholder="City"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-[15px]"
                />
              </div>

              {cityDropdownOpen && (
                <div className="absolute left-0 right-0 z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#e4e0da] bg-white p-1 shadow-xl">
                  {filteredCities.length === 0 && (
                    <p className="px-3 py-3 text-sm text-gray-400">No matching city</p>
                  )}
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={() => {
                        setLocation(c);
                        setCityDropdownOpen(false);
                      }}
                      className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        c === location ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm text-gray-700 outline-none transition-all focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100 sm:w-40 sm:text-[15px]"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600 sm:text-[15px]">
            {loading ? "Searching..." : `${total} job${total === 1 ? "" : "s"} found`}
          </p>
          {!loading && jobs.length > 0 && (
            <span className="hidden text-xs text-gray-400 sm:block">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d8d4ce] bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#e2ded7] bg-[#faf9f7] text-gray-500">
              <SearchIcon />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No jobs found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 sm:text-[15px]">
              Try another keyword, city, or job type. New opportunities can also appear as employers add roles.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.slug}`}
              className="group rounded-2xl border border-[#e4e0da] bg-white p-4 transition-all duration-200 hover:-translate-y-[1px] hover:border-[#d8d3cb] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] sm:p-5"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                {j.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={j.image_url}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-xl border border-gray-100 bg-white object-cover sm:h-16 sm:w-16"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-[#e6e2dc] bg-[#faf9f7] text-lg font-semibold text-gray-500 sm:h-16 sm:w-16 sm:text-xl">
                    {(j.company || j.title || "?").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold tracking-[-0.01em] text-gray-900 transition-colors group-hover:text-gray-700 sm:text-[17px]">
                        {j.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-gray-700 sm:text-[15px]">{j.company}</p>
                    </div>
                    <span className="hidden text-lg text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500 sm:block">
                      →
                    </span>
                  </div>

                  <p className="mt-1.5 text-sm text-gray-500 sm:text-[14px]">
                    {j.location}
                    {j.posted_date ? ` · Posted ${j.posted_date}` : ""}
                  </p>

                  {j.short_desc && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 sm:text-[15px]">
                      {j.short_desc}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination controls - this is the actual fix */}
        {!loading && !error && jobs.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-full border border-[#ddd9d2] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-full border border-[#ddd9d2] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="border-t border-[#e9e6e1] bg-white">
        <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-6 sm:py-16">
          <p className="text-sm font-medium text-gray-500">Found a role you like?</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Make your resume fit the opportunity.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-[15px]">
            Use Craft &amp; Apply to tailor your resume to the job description before you apply.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-black active:scale-95 sm:text-[15px]"
            >
              Craft my resume
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}