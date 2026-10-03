"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parseResumeText, tailorResume, downloadResume, type ResumeData } from "@/lib/api/resume";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { MODEL_OPTIONS, DEFAULT_MODEL } from "@/lib/models";

const GATE_DELAY_MS = 2500;
const PENDING_RESULT_KEY = "craft_pending_result";

// Shared button style - used by both "AI Resume" and "Generate" so they
// visually inherit the same identity. Blue, professional, no gradient.
const AI_BUTTON_CLASS =
  "group relative overflow-hidden rounded-full px-10 py-3.5 text-base font-semibold text-white " +
  "bg-[#0a66c2] shadow-md shadow-blue-900/15 transition-all duration-200 ease-out " +
  "hover:bg-[#004182] hover:shadow-lg hover:shadow-blue-900/25 active:scale-95 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0a66c2] disabled:hover:shadow-md";

export default function CraftPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
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
      const parsed = await parseResumeText(resumeText, selectedModel);
      const tailored = await tailorResume(parsed.submission_id, jobDescription, selectedModel);
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
    <div className="min-h-screen bg-[#f4f2ee]">
      {/* Top nav - matches jobs page */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0a66c2] text-sm font-bold text-white">
              C
            </span>
            <span className="text-lg font-semibold text-gray-900">Craft &amp; Apply</span>
          </Link>
          <Link
            href="/jobs"
            className="rounded-full border border-[#0a66c2] px-4 py-1.5 text-sm font-semibold text-[#0a66c2] hover:bg-[#e7f3ff]"
          >
            Browse Jobs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <h2 className="max-w-xl text-3xl font-bold leading-tight text-gray-900">
            Your resume, rewritten for the job you actually want.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-600">
            Paste your resume and any job description, and AI rewrites it to match
            &mdash; honestly, instantly, and built to pass ATS screening.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-500">
            <span className="rounded-full bg-white border border-gray-200 px-3 py-1">ATS-friendly format</span>
            <span className="rounded-full bg-white border border-gray-200 px-3 py-1">Tailored in seconds</span>
            <span className="rounded-full bg-white border border-gray-200 px-3 py-1">Nothing invented, ever</span>
          </div>

          <button onClick={() => setModalOpen(true)} className={`${AI_BUTTON_CLASS} mt-10`}>
            <span className="relative z-10 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
              AI Resume
            </span>
          </button>

          <div className="mt-14 grid w-full grid-cols-1 gap-6 border-t border-gray-200 pt-10 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Resume Builder</p>
              <p className="mt-1 text-xs text-gray-500">Paste your resume, no formatting needed.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Smart Job Match</p>
              <p className="mt-1 text-xs text-gray-500">Rewritten to mirror the job description.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">One-Click Export</p>
              <p className="mt-1 text-xs text-gray-500">Download as a clean PDF or Word file.</p>
            </div>
          </div>
        </section>

        {error && <p className="mt-8 text-center text-sm text-red-600">{error}</p>}

        {matchNotes && (
          <div className={`mt-10 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 ${showGate ? "pointer-events-none select-none blur-sm" : ""}`}>
            <span className="font-medium text-gray-900">What changed: </span>
            {matchNotes}
          </div>
        )}

        {result && (
          <section className={`mt-6 rounded-lg border border-gray-200 bg-white p-6 transition-all ${showGate ? "pointer-events-none select-none blur-sm" : ""}`}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{result.name || "Untitled resume"}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload("pdf")}
                  className="rounded-full border border-[#0a66c2] px-4 py-1.5 text-sm font-medium text-[#0a66c2] hover:bg-[#e7f3ff]"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => handleDownload("docx")}
                  className="rounded-full border border-[#0a66c2] px-4 py-1.5 text-sm font-medium text-[#0a66c2] hover:bg-[#e7f3ff]"
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
      </main>

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
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Craft your tailored resume</h2>
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
                  rows={6}
                  placeholder="Paste your resume text here..."
                  className="w-full rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the job description you're applying to..."
                  className="w-full rounded border border-gray-300 p-3 text-sm outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            {/* Model selector */}
            <div className="mt-5 flex flex-col items-center gap-1.5">
              <p className="text-xs text-gray-500">
                Using <span className="font-medium text-gray-700">{selectedModel}</span> &middot; free tier
              </p>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2]"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-center">
              <button onClick={handleTailor} disabled={loading || !canSubmit} className={AI_BUTTON_CLASS}>
                <span className="relative z-10 flex items-center gap-2">
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {loading ? "Generating..." : "Generate"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}