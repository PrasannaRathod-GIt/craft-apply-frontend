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

const JOB_TYPES = ["Any", "Full-time", "Part-time", "Internship", "Remote"];

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

  useEffect(() => {
    const t = setTimeout(() => setQ(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (jobType !== "Any") params.set("job_type", jobType);
    if (location !== "Anywhere") params.set("location", location);

    apiFetch<any>(`/jobs?${params.toString()}`)
      .then((d) => setJobs(Array.isArray(d) ? d : d.jobs ?? d.items ?? []))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load jobs."))
      .finally(() => setLoading(false));
  }, [q, jobType, location]);

  const filteredCities = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    if (!query) return INDIA_CITIES;
    return INDIA_CITIES.filter((c) => c.toLowerCase().includes(query));
  }, [cityQuery]);

  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      {/* Top nav bar - LinkedIn style */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0a66c2] text-sm font-bold text-white">
              C
            </span>
            <span className="text-lg font-semibold text-gray-900">Craft &amp; Apply</span>
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#0a66c2] px-4 py-1.5 text-sm font-semibold text-[#0a66c2] hover:bg-[#e7f3ff]"
          >
            AI Resume
          </Link>
        </div>
      </header>

      {/* Search bar - two-field LinkedIn style */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded border border-gray-300 px-3 py-2 focus-within:border-[#0a66c2] focus-within:ring-1 focus-within:ring-[#0a66c2]">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, company, or keyword"
                className="w-full text-sm outline-none"
              />
            </div>

            <div className="relative sm:w-64">
              <div className="flex items-center gap-2 rounded border border-gray-300 px-3 py-2 focus-within:border-[#0a66c2] focus-within:ring-1 focus-within:ring-[#0a66c2]">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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
                  className="w-full text-sm outline-none"
                />
              </div>
              {cityDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
                  {filteredCities.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No matching city</p>
                  )}
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={() => {
                        setLocation(c);
                        setCityDropdownOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#e7f3ff] ${
                        c === location ? "bg-[#e7f3ff] font-medium text-[#0a66c2]" : ""
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
              className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] sm:w-40"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="mx-auto max-w-5xl px-4 py-5">
        <p className="mb-3 text-sm font-medium text-gray-600">
          {loading ? "Searching..." : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`}
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <p className="text-gray-500">No jobs match your search.</p>
        )}

        <div className="flex flex-col gap-2">
          {jobs.map((j) => (
            <Link
              key={j.id}
              href={`/jobs/${j.slug}`}
              className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4
                         transition-shadow duration-150 hover:shadow-md"
            >
              {j.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={j.image_url}
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded border border-gray-100 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded border border-gray-100 bg-gray-50 text-lg font-bold text-gray-400">
                  {(j.company || j.title || "?").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold text-[#0a66c2] group-hover:underline">
                  {j.title}
                </h2>
                <p className="mt-0.5 text-sm text-gray-900">{j.company}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {j.location}
                  {j.posted_date ? ` · Posted ${j.posted_date}` : ""}
                </p>
                {j.short_desc && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{j.short_desc}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}