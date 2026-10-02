"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parseResumeText, tailorResume, downloadResume, type ResumeData } from "@/lib/api/resume";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import AuthGateModal from "@/components/auth/AuthGateModal";

const GATE_DELAY_MS = 2500;
const PENDING_RESULT_KEY = "craft_pending_result";

export default function CraftPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ResumeData | null>(null);
  const [matchNotes, setMatchNotes] = useState<string | null>(null);
  const [resultSubmissionId, setResultSubmissionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const gateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSubmit = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  // Restore state after a Google-login redirect round trip, then check auth status.
  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_RESULT_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        setResumeText(saved.resumeText || "");
        setJobDescription(saved.jobDescription || "");
        setResult(saved.result || null);
        setMatchNotes(saved.matchNotes || null);
        setResultSubmissionId(saved.resultSubmissionId ?? null);
      } catch {
        // ignore malformed/old data
      }
      sessionStorage.removeItem(PENDING_RESULT_KEY);
    }

    getCurrentUser()
      .then(() => setIsAuthed(true))
      .catch(() => setIsAuthed(false))
      .finally(() => setAuthChecked(true));
  }, []);

  // Start the gate timer once a result exists and we know the person is logged out.
  useEffect(() => {
    if (gateTimer.current) {
      clearTimeout(gateTimer.current);
      gateTimer.current = null;
    }
    if (result && authChecked && !isAuthed) {
      gateTimer.current = setTimeout(() => setShowGate(true), GATE_DELAY_MS);
    } else {
      setShowGate(false);
    }
    return () => {
      if (gateTimer.current) clearTimeout(gateTimer.current);
    };
  }, [result, authChecked, isAuthed]);

  async function handleTailor() {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    setResult(null);
    setMatchNotes(null);
    setResultSubmissionId(null);
    try {
      const parsed = await parseResumeText(resumeText);
      const tailored = await tailorResume(parsed.submission_id, jobDescription);
      setResult(tailored.data);
      setMatchNotes(tailored.match_notes);
      setResultSubmissionId(tailored.submission_id);
      setModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        console.error("Unexpected error during tailor flow:", err);
        setError("Could not reach the server. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(fmt: "docx" | "pdf") {
    if (!resultSubmissionId) return;
    setDownloadError(null);
    try {
      await downloadResume(resultSubmissionId, fmt);
    } catch (err) {
      setDownloadError("Could not generate the file. Please try again.");
      console.error(err);
    }
  }

  function handleAuthenticated() {
    setIsAuthed(true);
    setShowGate(false);
  }

  function handleBeforeGoogleRedirect() {
    sessionStorage.setItem(
      PENDING_RESULT_KEY,
      JSON.stringify({ resumeText, jobDescription, result, matchNotes, resultSubmissionId })
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      {/* Top bar */}
      <header className="mb-12 flex items-center justify-between">
        <Link
          href="/jobs"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          &larr; Apply
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Craft &amp; Apply</h1>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <h2 className="max-w-xl text-3xl font-bold leading-tight text-gray-900">
          Your resume, rewritten for the job you actually want.
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
          Paste your resume and any job description, and AI rewrites it to match
          &mdash; honestly, instantly, and built to pass ATS screening.
        </p>

        {/* Tagline strip */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-500">
          <span className="rounded-full bg-gray-100 px-3 py-1">🎯 ATS-friendly format</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">⚡ Tailored in seconds</span>
          <span className="rounded-full bg-gray-100 px-3 py-1">🔒 Nothing invented, ever</span>
        </div>

        {/* AI Resume button */}
        <button
          onClick={() => setModalOpen(true)}
          className="group relative mt-10 overflow-hidden rounded-full px-10 py-4 text-lg font-semibold text-white
                     bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]
                     shadow-lg shadow-purple-500/30 transition-all duration-300 ease-out
                     hover:scale-105 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-purple-500/50
                     active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            AI Resume
          </span>
          <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full bg-white/10" />
        </button>

        {/* Feature strip */}
        <div className="mt-14 grid w-full grid-cols-1 gap-6 border-t border-gray-100 pt-10 sm:grid-cols-3">
          <div>
            <p className="text-2xl">📝</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">Resume Builder</p>
            <p className="mt-1 text-xs text-gray-500">Paste your resume, no formatting needed.</p>
          </div>
          <div>
            <p className="text-2xl">🎯</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">Smart Job Match</p>
            <p className="mt-1 text-xs text-gray-500">Rewritten to mirror the job description.</p>
          </div>
          <div>
            <p className="text-2xl">📄</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">One-Click Export</p>
            <p className="mt-1 text-xs text-gray-500">Download as a clean PDF or Word file.</p>
          </div>
        </div>
      </section>

      {/* Error (outside modal, so it's visible even after modal closes) */}
      {error && <p className="mt-8 text-center text-sm text-red-600">{error}</p>}

      {/* Match notes + result */}
      {matchNotes && (
        <div className={`mt-10 rounded bg-gray-50 p-4 text-sm text-gray-700 ${showGate ? "pointer-events-none select-none blur-sm" : ""}`}>
          <span className="font-medium">What changed: </span>
          {matchNotes}
        </div>
      )}

      {result && (
        <section className={`mt-6 rounded border p-6 transition-all ${showGate ? "pointer-events-none select-none blur-sm" : ""}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">{result.name || "Untitled resume"}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload("pdf")}
                className="rounded-full border border-purple-600 px-4 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Download PDF
              </button>
              <button
                onClick={() => handleDownload("docx")}
                className="rounded-full border border-purple-600 px-4 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-50"
              >
                Download DOCX
              </button>
            </div>
          </div>
          {downloadError && <p className="mb-3 text-sm text-red-600">{downloadError}</p>}

          {result.title && <p className="text-gray-600">{result.title}</p>}
          {result.summary && <p className="mt-3 text-sm leading-relaxed">{result.summary}</p>}

          {result.skills.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Skills</h3>
              <p className="mt-1 text-sm">{result.skills.join(", ")}</p>
            </div>
          )}

          {result.experiences.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Experience</h3>
              {result.experiences.map((exp, i) => (
                <div key={i} className="mt-3">
                  <p className="font-medium">
                    {exp.role}
                    {exp.company ? ` at ${exp.company}` : ""}
                  </p>
                  {(exp.start_date || exp.end_date) && (
                    <p className="text-xs text-gray-500">
                      {exp.start_date} &mdash; {exp.end_date}
                    </p>
                  )}
                  {exp.bullets.length > 0 && (
                    <ul className="ml-4 mt-1 list-disc text-sm">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.education.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Education</h3>
              {result.education.map((ed, i) => (
                <p key={i} className="mt-1 text-sm">
                  {ed.degree}
                  {ed.institution ? `, ${ed.institution}` : ""}
                  {ed.year ? ` (${ed.year})` : ""}
                </p>
              ))}
            </div>
          )}

          {(result.contact.email || result.contact.phone || result.contact.location || result.contact.linkedin || result.contact.website) && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Contact</h3>
              <p className="mt-1 text-sm">
                {[result.contact.email, result.contact.phone, result.contact.location].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-sm">
                {[result.contact.linkedin, result.contact.website].filter(Boolean).join(" · ")}
              </p>
            </div>
          )}

          {result.projects.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Projects</h3>
              {result.projects.map((p, i) => (
                <div key={i} className="mt-2 text-sm">
                  <p className="font-medium">
                    {p.name}
                    {p.link ? ` — ${p.link}` : ""}
                  </p>
                  {p.description && <p>{p.description}</p>}
                  {p.tech_stack.length > 0 && <p className="text-xs text-gray-500">{p.tech_stack.join(", ")}</p>}
                </div>
              ))}
            </div>
          )}

          {result.certificates.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Certificates</h3>
              {result.certificates.map((c, i) => (
                <p key={i} className="mt-1 text-sm">
                  {c.name}
                  {c.issuer ? `, ${c.issuer}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </p>
              ))}
            </div>
          )}

          {result.achievements.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Achievements</h3>
              {result.achievements.map((a, i) => (
                <p key={i} className="mt-1 text-sm">
                  {a.description}
                  {a.date ? ` (${a.date})` : ""}
                </p>
              ))}
            </div>
          )}

          {result.languages.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Languages</h3>
              <p className="mt-1 text-sm">{result.languages.join(", ")}</p>
            </div>
          )}
        </section>
      )}

      {showGate && (
        <AuthGateModal
          onAuthenticated={handleAuthenticated}
          onBeforeGoogleRedirect={handleBeforeGoogleRedirect}
        />
      )}

      {/* Generate modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !loading && setModalOpen(false)}
        >
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Craft your tailored resume</h2>
              <button
                onClick={() => !loading && setModalOpen(false)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Resume Details</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  placeholder="Paste your resume text here..."
                  className="w-full rounded border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={10}
                  placeholder="Paste the job description you're applying to..."
                  className="w-full rounded border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleTailor}
                disabled={loading || !canSubmit}
                className="group relative overflow-hidden rounded-full px-10 py-3 text-base font-semibold text-white
                           bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]
                           shadow-lg shadow-purple-500/30 transition-all duration-300 ease-out
                           hover:scale-105 hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-purple-500/50
                           active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loading ? "Generating..." : "Generate Professional"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}