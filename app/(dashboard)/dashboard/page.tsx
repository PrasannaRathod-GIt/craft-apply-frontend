"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, type CurrentUser } from "@/lib/api/auth";
import { apiFetch, ApiError, API_BASE_URL } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  phone: string | null;
  location: string | null;
  headline: string | null;
  summary: string | null;
  skills: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  experience_text: string | null;
  education_text: string | null;
  profile_completion: number;
}

interface SavedResume {
  id: number;
  name: string;
  title: string;
  created_at: string;
}

interface AppliedJob {
  job_id: number;
  job_title: string;
  job_company: string | null;
  job_slug: string;
  applied_at: string;
}

// ─── Survey questions ─────────────────────────────────────────────────────────

type ProfileField = keyof Omit<Profile, "profile_completion">;

const SURVEY_STEPS: {
  field: ProfileField;
  question: string;
  hint: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { field: "headline", question: "What's your professional title?", hint: "e.g. Backend Engineer, Product Manager", placeholder: "Software Engineer" },
  { field: "location", question: "Where are you based?", hint: "City or region you're looking for work in", placeholder: "Bengaluru, India" },
  { field: "phone", question: "What's your phone number?", hint: "Used only on your resume — never shared", placeholder: "+91 98765 43210" },
  { field: "linkedin_url", question: "LinkedIn profile URL?", hint: "Skip if you don't have one", placeholder: "https://linkedin.com/in/your-name" },
  { field: "portfolio_url", question: "Portfolio or website?", hint: "GitHub, personal site, Dribbble — anything relevant", placeholder: "https://yoursite.dev" },
  { field: "skills", question: "List your top skills", hint: "Comma-separated, e.g. Python, React, PostgreSQL", placeholder: "Python, FastAPI, React" },
  { field: "summary", question: "Write a short professional summary", hint: "2–3 sentences. This will be used to autofill your resume.", placeholder: "Backend engineer with 4 years of experience…", multiline: true },
  { field: "experience_text", question: "Paste your work experience", hint: "Plain text is fine — this autofills the resume builder", placeholder: "Backend Engineer at TechCorp, Jan 2021–Present\n- Built REST APIs…", multiline: true },
  { field: "education_text", question: "Paste your education", hint: "Degree, institution, year", placeholder: "B.Tech Computer Science, Pune University, 2020", multiline: true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso.split("T")[0];
  }
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-[#0a66c2] transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyDone, setSurveyDone] = useState(false);
  const [fieldValue, setFieldValue] = useState("");
  const [saving, setSaving] = useState(false);

  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteFinal, setDeleteFinal] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [appliedLoading, setAppliedLoading] = useState(true);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) router.push("/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  // ── Load profile ────────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const p = await apiFetch<Profile>("/profile");
      setProfile(p);
      const filled = SURVEY_STEPS.filter((s) => p[s.field]);
      if (filled.length === SURVEY_STEPS.length) {
        setSurveyDone(true);
      } else {
        const next = SURVEY_STEPS.findIndex((s) => !p[s.field]);
        setSurveyStep(next);
        setFieldValue("");
      }
    } catch {
      // profile load error is non-fatal
    }
  }, []);

  useEffect(() => {
    if (!checking && user) loadProfile();
  }, [checking, user, loadProfile]);

  // ── Load resumes ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!checking && user) {
      apiFetch<SavedResume[]>("/resume/my/list")
        .then(setResumes)
        .catch(() => {})
        .finally(() => setResumesLoading(false));
    }
  }, [checking, user]);

  // ── Load applied jobs ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!checking && user) {
      apiFetch<AppliedJob[]>("/applied-jobs")
        .then(setAppliedJobs)
        .catch(() => {})
        .finally(() => setAppliedLoading(false));
    }
  }, [checking, user]);

  // ── Survey actions ───────────────────────────────────────────────────────────
  async function handleSurveyAnswer(skip = false) {
    const step = SURVEY_STEPS[surveyStep];
    if (!skip && !fieldValue.trim()) return;

    setSaving(true);
    try {
      const updated = await apiFetch<Profile>("/profile", {
        method: "PUT",
        json: skip ? {} : { [step.field]: fieldValue.trim() },
      });
      setProfile(updated);

      const next = surveyStep + 1;
      if (next >= SURVEY_STEPS.length) {
        setSurveyDone(true);
      } else {
        setSurveyStep(next);
        const nextField = SURVEY_STEPS[next].field;
        setFieldValue((updated[nextField] as string | null) ?? "");
      }
    } catch {
      // keep going silently
    } finally {
      setSaving(false);
    }
  }

  function handleEditProfile() {
    setSurveyDone(false);
    const first = SURVEY_STEPS.findIndex((s) => !profile?.[s.field]);
    const idx = first >= 0 ? first : 0;
    setSurveyStep(idx);
    if (profile) {
      setFieldValue((profile[SURVEY_STEPS[idx].field] as string | null) ?? "");
    }
  }

  // ── Resume download ──────────────────────────────────────────────────────────
  async function handleDownload(id: number, fmt: "pdf" | "docx") {
    setDownloadError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/resume/${id}/export/${fmt}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers.get("content-disposition") || "";
      const m = cd.match(/filename="?([^"]+)"?/);
      a.download = m ? m[1] : `resume.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Download failed. Please try again.");
    }
  }

  // ── Resume delete ────────────────────────────────────────────────────────────
  async function handleDeleteConfirmed(id: number) {
    try {
      await apiFetch(`/resume/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setDownloadError("Delete failed. Please try again.");
    } finally {
      setDeleteConfirm(null);
      setDeleteFinal(null);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  // ── Loading / guard ──────────────────────────────────────────────────────────
  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
          <p className="text-sm text-gray-500">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const completion = profile?.profile_completion ?? 0;

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-gray-900">
      {/* Nav */}
      <header className="border-b border-[#e9e6e1] bg-[#fbfaf8]/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold">C</span>
            <span className="text-[15px] font-semibold tracking-tight">Craft &amp; Apply</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/resume" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Resume
            </Link>
            <Link href="/jobs" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Jobs
            </Link>
            <button onClick={handleLogout} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        {/* Welcome */}
        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome, {user.username ?? user.email.split("@")[0]}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </section>

        {/* ── Profile survey ──────────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-[#e4e0da] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Your profile</h2>
              <p className="mt-0.5 text-xs text-gray-500">{completion}% complete</p>
            </div>
            {surveyDone && (
              <button onClick={handleEditProfile} className="text-xs font-medium text-[#0a66c2] hover:underline">
                Edit
              </button>
            )}
          </div>
          <ProgressBar pct={completion} />

          {surveyDone ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {SURVEY_STEPS.filter((s) => profile?.[s.field]).map((s) => (
                <div key={s.field} className="rounded-xl border border-gray-100 bg-[#faf9f7] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{s.question.replace("?", "")}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                    {profile?.[s.field] as string}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            profile !== null && (
              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Step {surveyStep + 1} of {SURVEY_STEPS.length}
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {SURVEY_STEPS[surveyStep].question}
                </p>
                <p className="mt-1 text-sm text-gray-500">{SURVEY_STEPS[surveyStep].hint}</p>

                {SURVEY_STEPS[surveyStep].multiline ? (
                  <textarea
                    rows={4}
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder={SURVEY_STEPS[surveyStep].placeholder}
                    className="mt-4 w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                ) : (
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder={SURVEY_STEPS[surveyStep].placeholder}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSurveyAnswer(); }}
                    className="mt-4 w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                )}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleSurveyAnswer(false)}
                    disabled={saving || !fieldValue.trim()}
                    className="rounded-full bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-black"
                  >
                    {saving ? "Saving…" : "Continue"}
                  </button>
                  <button
                    onClick={() => handleSurveyAnswer(true)}
                    disabled={saving}
                    className="text-sm text-gray-400 hover:text-gray-700"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )
          )}
        </section>

        {/* ── Saved resumes ───────────────────────────────────────────────── */}
        <section className="mb-8 rounded-2xl border border-[#e4e0da] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Saved resumes</h2>
            <Link href="/resume" className="text-xs font-medium text-[#0a66c2] hover:underline">
              + New
            </Link>
          </div>

          {downloadError && (
            <p className="mt-3 text-sm text-red-600">{downloadError}</p>
          )}

          {resumesLoading ? (
            <p className="mt-4 text-sm text-gray-400">Loading…</p>
          ) : resumes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No saved resumes yet.{" "}
              <Link href="/resume" className="text-[#0a66c2] hover:underline">
                Generate your first one →
              </Link>
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-[#e4e0da] bg-[#faf9f7] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{r.name}</p>
                      {r.title && <p className="mt-0.5 truncate text-xs text-gray-500">{r.title}</p>}
                      <p className="mt-1 text-xs text-gray-400">{formatDate(r.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDownload(r.id, "pdf")}
                        className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownload(r.id, "docx")}
                        className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Word
                      </button>
                      {deleteConfirm === r.id ? (
                        deleteFinal === r.id ? (
                          <button
                            onClick={() => handleDeleteConfirmed(r.id)}
                            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete permanently
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteFinal(r.id)}
                            className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Sure?
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(r.id)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Applied jobs ─────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#e4e0da] bg-white p-6 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Applied jobs</h2>
            <Link href="/jobs" className="text-xs font-medium text-[#0a66c2] hover:underline">
              Browse jobs →
            </Link>
          </div>

          {appliedLoading ? (
            <p className="mt-4 text-sm text-gray-400">Loading…</p>
          ) : appliedJobs.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No applications tracked yet.{" "}
              <Link href="/jobs" className="text-[#0a66c2] hover:underline">
                Find a job →
              </Link>
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-3">
                {appliedJobs.map((j) => (
                  <Link
                    key={j.job_id}
                    href={`/jobs/${j.job_slug}`}
                    className="flex items-center gap-3 rounded-xl border border-[#e4e0da] bg-[#faf9f7] px-4 py-4 transition-colors hover:border-gray-300 hover:bg-white"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                        <path d="m2.5 8 3 3 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{j.job_title}</p>
                      {j.job_company && (
                        <p className="mt-0.5 text-xs text-gray-500">{j.job_company}</p>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-gray-400">{formatDate(j.applied_at)}</p>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Jobs are removed from this list after 30 days.
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  );
}