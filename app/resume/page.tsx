"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  parseResumeText,
  tailorResume,
  downloadResume,
  type ResumeData,
} from "@/lib/api/resume";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/auth";
import AuthGateModal from "@/components/auth/AuthGateModal";
import { MODEL_OPTIONS, DEFAULT_MODEL } from "@/lib/models";

const GATE_DELAY_MS = 2500;
const PENDING_RESULT_KEY = "craft_pending_result";

const AI_BUTTON_CLASS =
  "group relative overflow-hidden rounded-full px-10 py-3.5 text-base font-semibold text-white " +
  "bg-[#171717] shadow-sm transition-all duration-200 ease-out " +
  "hover:bg-black hover:shadow-md active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#171717]";

type Tab = "ai" | "templates";

export default function ResumePage() {
  const [tab, setTab] = useState<Tab>("ai");
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [result, setResult] = useState<ResumeData | null>(null);
  const [matchNotes, setMatchNotes] = useState<string | null>(null);
  const [resultSubmissionId, setResultSubmissionId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const gateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSubmit =
    resumeText.trim().length > 0 && jobDescription.trim().length > 0;

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
      gateTimer.current = setTimeout(
        () => setShowGate(true),
        GATE_DELAY_MS
      );
    } else {
      setShowGate(false);
    }

    return () => {
      if (gateTimer.current) {
        clearTimeout(gateTimer.current);
      }
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

      const tailored = await tailorResume(
        parsed.submission_id,
        jobDescription,
        selectedModel
      );

      setResult(tailored.data);
      setMatchNotes(tailored.match_notes);
      setResultSubmissionId(tailored.submission_id);
      setModalOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        console.error("Unexpected error during tailor flow:", err);
        setError(
          "Could not reach the server. Check your connection and try again."
        );
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
      JSON.stringify({
        resumeText,
        jobDescription,
        result,
        matchNotes,
        resultSubmissionId,
      })
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-[#171717]">
      {/* Top nav */}
      <header className="border-b border-[#e4e0da] bg-[#fbfaf8]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8d4ce] bg-white text-sm font-bold text-[#171717] shadow-sm">
              C
            </span>

            <span className="text-lg font-semibold tracking-tight text-[#171717]">
              Craft &amp; Apply
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/jobs"
              className="rounded-full border border-[#e4e0da] bg-white px-4 py-2 text-sm font-medium text-[#4f4b46] transition-colors hover:bg-[#f4f1ec]"
            >
              Jobs
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full bg-[#171717] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[#e4e0da] bg-[#fbfaf8]">
        <div className="mx-auto flex max-w-6xl gap-7 px-5 sm:px-6 lg:px-8">
          <button
            onClick={() => setTab("ai")}
            className={`border-b-2 py-4 text-sm font-semibold transition-colors ${
              tab === "ai"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#77736d] hover:text-[#171717]"
            }`}
          >
            AI Resume
          </button>

          <button
            onClick={() => setTab("templates")}
            className={`border-b-2 py-4 text-sm font-semibold transition-colors ${
              tab === "templates"
                ? "border-[#171717] text-[#171717]"
                : "border-transparent text-[#77736d] hover:text-[#171717]"
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
        {tab === "templates" && (
          <div className="rounded-2xl border border-dashed border-[#d8d4ce] bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-[#77736d]">
              Templates are coming soon.
            </p>
          </div>
        )}

        {tab === "ai" && (
          <>
            {/* Hero */}
            <section className="flex flex-col items-center text-center">
              <div className="mb-5 inline-flex items-center rounded-full border border-[#e4e0da] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6d6861] shadow-sm">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#171717]" />
                AI-powered resume tailoring
              </div>

              <h2 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
                Your resume, rewritten for the job you actually want.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6d6861] sm:text-lg">
                Paste your resume and any job description, and AI rewrites it
                to match &mdash; honestly, instantly, and built to pass ATS
                screening.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-[#e4e0da] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6d6861] shadow-sm">
                  ATS-friendly format
                </span>

                <span className="rounded-full border border-[#e4e0da] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6d6861] shadow-sm">
                  Tailored in seconds
                </span>

                <span className="rounded-full border border-[#e4e0da] bg-white px-3.5 py-1.5 text-xs font-medium text-[#6d6861] shadow-sm">
                  Nothing invented, ever
                </span>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className={`${AI_BUTTON_CLASS} mt-9`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-white/80" />
                  AI Resume
                </span>
              </button>
            </section>

            {/* Error */}
            {error && (
              <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Match notes */}
            {matchNotes && (
              <div
                className={`mx-auto mt-10 max-w-3xl rounded-2xl border border-[#e4e0da] bg-white p-5 text-sm leading-6 text-[#514d48] shadow-sm ${
                  showGate
                    ? "pointer-events-none select-none blur-sm"
                    : ""
                }`}
              >
                <span className="font-semibold text-[#171717]">
                  What changed:
                </span>{" "}
                {matchNotes}
              </div>
            )}

            {/* Result */}
            {result && (
              <section
                className={`mx-auto mt-6 max-w-3xl rounded-2xl border border-[#e4e0da] bg-white p-6 shadow-sm transition-all sm:p-8 ${
                  showGate
                    ? "pointer-events-none select-none blur-sm"
                    : ""
                }`}
              >
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae5] pb-5">
                  <h2 className="text-2xl font-semibold tracking-tight text-[#171717]">
                    {result.name || "Untitled resume"}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDownload("pdf")}
                      className="rounded-full border border-[#d8d4ce] bg-white px-4 py-2 text-sm font-medium text-[#393633] transition-colors hover:bg-[#f5f2ed]"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => handleDownload("docx")}
                      className="rounded-full border border-[#d8d4ce] bg-white px-4 py-2 text-sm font-medium text-[#393633] transition-colors hover:bg-[#f5f2ed]"
                    >
                      Download DOCX
                    </button>
                  </div>
                </div>

                {downloadError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {downloadError}
                  </div>
                )}

                {result.title && (
                  <p className="text-base text-[#6d6861]">{result.title}</p>
                )}

                {result.summary && (
                  <p className="mt-4 text-sm leading-7 text-[#4f4b46]">
                    {result.summary}
                  </p>
                )}

                {result.skills.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Skills
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#393633]">
                      {result.skills.join(", ")}
                    </p>
                  </div>
                )}

                {result.experiences.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Experience
                    </h3>

                    {result.experiences.map((exp, i) => (
                      <div
                        key={i}
                        className="mt-4 border-t border-[#f0ece7] pt-4 first:border-0 first:pt-0"
                      >
                        <p className="font-medium text-[#171717]">
                          {exp.role}
                          {exp.company ? ` at ${exp.company}` : ""}
                        </p>

                        {(exp.start_date || exp.end_date) && (
                          <p className="mt-1 text-xs text-[#8b857e]">
                            {exp.start_date} &mdash; {exp.end_date}
                          </p>
                        )}

                        {exp.bullets.length > 0 && (
                          <ul className="ml-5 mt-2 list-disc space-y-1 text-sm leading-6 text-[#4f4b46]">
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
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Education
                    </h3>

                    {result.education.map((ed, i) => (
                      <p
                        key={i}
                        className="mt-2 text-sm leading-6 text-[#393633]"
                      >
                        {ed.degree}
                        {ed.institution ? `, ${ed.institution}` : ""}
                        {ed.year ? ` (${ed.year})` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {(result.contact.email ||
                  result.contact.phone ||
                  result.contact.location ||
                  result.contact.linkedin ||
                  result.contact.website) && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Contact
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#393633]">
                      {[
                        result.contact.email,
                        result.contact.phone,
                        result.contact.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#393633]">
                      {[
                        result.contact.linkedin,
                        result.contact.website,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                )}

                {result.projects.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Projects
                    </h3>

                    {result.projects.map((p, i) => (
                      <div
                        key={i}
                        className="mt-4 border-t border-[#f0ece7] pt-4 first:border-0 first:pt-0"
                      >
                        <p className="text-sm font-medium text-[#171717]">
                          {p.name}
                          {p.link ? ` — ${p.link}` : ""}
                        </p>

                        {p.description && (
                          <p className="mt-1 text-sm leading-6 text-[#4f4b46]">
                            {p.description}
                          </p>
                        )}

                        {p.tech_stack.length > 0 && (
                          <p className="mt-1 text-xs text-[#89837b]">
                            {p.tech_stack.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.certificates.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Certificates
                    </h3>

                    {result.certificates.map((c, i) => (
                      <p
                        key={i}
                        className="mt-2 text-sm leading-6 text-[#393633]"
                      >
                        {c.name}
                        {c.issuer ? `, ${c.issuer}` : ""}
                        {c.year ? ` (${c.year})` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {result.achievements.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Achievements
                    </h3>

                    {result.achievements.map((a, i) => (
                      <p
                        key={i}
                        className="mt-2 text-sm leading-6 text-[#393633]"
                      >
                        {a.description}
                        {a.date ? ` (${a.date})` : ""}
                      </p>
                    ))}
                  </div>
                )}

                {result.languages.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#89837b]">
                      Languages
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#393633]">
                      {result.languages.join(", ")}
                    </p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* Auth Gate */}
      {showGate && (
        <AuthGateModal
          onAuthenticated={handleAuthenticated}
          onBeforeGoogleRedirect={handleBeforeGoogleRedirect}
        />
      )}

      {/* Resume Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/45 p-4 backdrop-blur-[2px]"
          onClick={() => !loading && setModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-[#e4e0da] bg-[#fbfaf8] p-5 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#89837b]">
                  AI Resume
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#171717]">
                  Craft your tailored resume
                </h2>
              </div>

              <button
                onClick={() => !loading && setModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e4e0da] bg-white text-xl leading-none text-[#77736d] transition-colors hover:bg-[#f4f1ec] hover:text-[#171717]"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#393633]">
                  Resume Details
                </label>

                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={7}
                  placeholder="Paste your resume text here..."
                  className="w-full resize-none rounded-xl border border-[#dcd8d2] bg-white p-3.5 text-sm leading-6 text-[#171717] outline-none transition focus:border-[#8e8981] focus:ring-2 focus:ring-[#171717]/5"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#393633]">
                  Job Description
                </label>

                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={7}
                  placeholder="Paste the job description you're applying to..."
                  className="w-full resize-none rounded-xl border border-[#dcd8d2] bg-white p-3.5 text-sm leading-6 text-[#171717] outline-none transition focus:border-[#8e8981] focus:ring-2 focus:ring-[#171717]/5"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-xs text-[#89837b]">
                Using{" "}
                <span className="font-medium text-[#393633]">
                  {selectedModel}
                </span>{" "}
                &middot; free tier
              </p>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={loading}
                className="rounded-full border border-[#d8d4ce] bg-white px-4 py-2 text-xs font-medium text-[#393633] outline-none transition focus:border-[#8e8981] focus:ring-2 focus:ring-[#171717]/5"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleTailor}
                disabled={loading || !canSubmit}
                className={AI_BUTTON_CLASS}
              >
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