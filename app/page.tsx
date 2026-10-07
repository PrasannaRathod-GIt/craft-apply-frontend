"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const AI_BUTTON_CLASS =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full " +
  "bg-[#2383e2] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm " +
  "transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1f75cb] hover:shadow-md " +
  "active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45";

const SECONDARY_BUTTON_CLASS =
  "group inline-flex items-center justify-center gap-2 rounded-full border border-black/15 " +
  "bg-white px-6 py-3.5 text-[15px] font-semibold text-[#202020] " +
  "transition-all duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:bg-[#f7f7f5] " +
  "active:translate-y-0";

function LogoMark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={[
        "flex items-center justify-center rounded-[7px] border border-black/15 bg-white font-bold text-[#202020]",
        small ? "h-7 w-7 text-[13px]" : "h-8 w-8 text-sm",
      ].join(" ")}
      aria-hidden="true"
    >
      C
    </span>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
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

function StarRating({
  fullStars,
  halfStar = false,
  className = "",
}: {
  fullStars: number;
  halfStar?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${fullStars}${halfStar ? ".5" : ""} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const isFull = index < fullStars;
        const isHalf = halfStar && index === fullStars;
        return (
          <span key={index} className="relative inline-block text-[14px] leading-none">
            <span className={isFull ? "text-[#ffc400]" : "text-[#b9b9b3]"} aria-hidden="true">
              {isFull ? "★" : "☆"}
            </span>
            {isHalf && (
              <span
                className="absolute left-0 top-0 overflow-hidden text-[#ffc400]"
                style={{ width: "50%" }}
                aria-hidden="true"
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function DocumentIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <path d="M12 5h14l7 7v27H12V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M26 5v7h7M17 19h11M17 24h11M17 29h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TargetIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="m29 29 8 8M33 11l6-4M30 7l3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <path d="M22 6v21M14 19l8 8 8-8M10 31h24v7H10v-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 3.3 3.3L16 5.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LiveJobCard({ role, company, tag }: { role: string; company: string; tag: string }) {
  return (
    <div className="flex min-w-[290px] items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f5f9] text-sm font-semibold text-[#334155]">
        {company.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#202020]">{role}</p>
        <p className="mt-0.5 truncate text-[13px] text-[#7a7a76]">{company}</p>
      </div>
      <span className="rounded-full bg-[#f5f8ff] px-2.5 py-1 text-[11px] font-medium text-[#2371bf]">{tag}</span>
    </div>
  );
}

function LiveMatchPreview() {
  const jobs = [
    { role: "Frontend Developer", company: "Northstar Labs", tag: "94% match" },
    { role: "React Engineer", company: "Paperplane", tag: "89% match" },
    { role: "Software Engineer", company: "Vertex Systems", tag: "86% match" },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % jobs.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [jobs.length]);

  return (
    <div className="relative w-full max-w-[470px]">
      <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-[#f7f6f2] p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#8a8a84]">Live match</p>
            <p className="mt-1 text-[15px] font-semibold text-[#202020]">Finding the best job match</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-medium text-[#555]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#31a24c]" />
            live
          </span>
        </div>

        <div className="space-y-2.5">
          {jobs.map((job, index) => (
            <div
              key={job.role}
              className={[
                "transition-all duration-500",
                index === active ? "translate-x-0 opacity-100" : "translate-x-1 opacity-65",
              ].join(" ")}
            >
              <LiveJobCard {...job} />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/[0.07] pt-3">
          <p className="text-[12px] text-[#85857f]">Matches update as your resume changes.</p>
          <div className="flex gap-1">
            {jobs.map((job, index) => (
              <span
                key={job.role}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  index === active ? "w-5 bg-[#202020]" : "w-1.5 bg-black/[0.15]",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CraftPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#202020] selection:bg-[#dbeafe] selection:text-[#1e3a5f]">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        @keyframes craftFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-6px) rotate(1deg); }
        }
        .craft-float { animation: craftFloat 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .craft-float { animation: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[#fbfbf9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Craft & Apply home">
            <LogoMark />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Craft &amp; Apply</span>
          </Link>

          <nav className="hidden items-center gap-7 text-[14px] text-[#686863] md:flex">
            <a href="#features" className="transition-colors hover:text-[#202020]">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-[#202020]">
              How it works
            </a>
            <Link href="/jobs" className="transition-colors hover:text-[#202020]">
              Jobs
            </Link>
            <Link href="/about" className="transition-colors hover:text-[#202020]">
              About
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/privacy" className="text-[13px] font-medium text-[#686863] transition-colors hover:text-[#202020]">
              Privacy
            </Link>
            <Link
              href="/resume"
              className="rounded-full bg-[#202020] px-5 py-2.5 text-[13px] font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-black active:translate-y-0"
            >
              Start crafting
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] font-semibold md:hidden"
          >
            Menu
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-black/[0.07] bg-[#fbfbf9] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-[15px]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#555550]">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#555550]">
                How it works
              </a>
              <Link href="/jobs" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#555550]">
                Jobs
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#555550]">
                About
              </Link>
              <Link
                href="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-[#202020] px-4 py-3 font-semibold text-white"
              >
                Start crafting
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-6">
        <section className="relative pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute inset-0 opacity-45">
            <div className="absolute left-[-4rem] top-24 h-48 w-48 rounded-full bg-[#eef3f8] blur-3xl" />
            <div className="absolute right-[-4rem] top-28 h-56 w-56 rounded-full bg-[#f3eee7] blur-3xl" />
          </div>

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[12px] font-medium text-[#66665f] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#31a24c]" />
                Tailor your resume in minutes
              </div>

              <h1 className="mt-7 max-w-[690px] text-[42px] font-bold leading-[1.05] tracking-[-0.045em] text-[#202020] sm:text-[54px] lg:text-[62px]">
                Make your resume fit the job you want.
              </h1>

              <p className="mt-6 max-w-[610px] text-[17px] leading-8 text-[#66665f] sm:text-[18px]">
                Paste your resume and a job description. Craft &amp; Apply highlights your
                real experience, matches key job requirements, and gives you an ATS-ready
                resume you can send with confidence.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/resume" className={AI_BUTTON_CLASS}>
                  Craft my resume
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href="/jobs" className={SECONDARY_BUTTON_CLASS}>
                  Explore jobs
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#777770]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-[#4f7c58]" />
                  ATS-friendly
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-[#4f7c58]" />
                  100% real experience
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-[#4f7c58]" />
                  Download PDF or Word
                </span>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="craft-float relative w-full max-w-[480px]">
                <div className="rounded-[32px] border border-black/[0.09] bg-white/95 p-4 shadow-[0_30px_80px_-12px_rgba(0,0,0,0.12),_24px_24px_70px_-18px_rgba(0,0,0,0.08)] sm:p-6">
                  <div className="flex items-center justify-between border-b border-black/[0.07] pb-4">
                    <div className="flex items-center gap-2">
                      <LogoMark small />
                      <span className="text-[13px] font-semibold">Resume workspace</span>
                    </div>
                    <span className="text-[11px] text-[#8a8a84]">preview</span>
                  </div>

                  <div className="grid gap-4 pt-5 sm:grid-cols-[1fr_0.9fr]">
                    <div className="flex h-full flex-col">
                      <div className="flex-1 rounded-2xl border border-black/[0.10] bg-[#fcfcfa] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999992]">
                            Original
                          </p>
                          <StarRating fullStars={2} className="shrink-0" />
                        </div>

                        <div className="mt-4 space-y-2.5">
                          <div>
                            <p className="text-[14px] font-semibold tracking-[-0.01em] text-[#343430]">
                              Joe Charles
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#8b8b84]">Software Developer</p>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999992]">
                              Experience
                            </p>
                            <div className="mt-1.5 space-y-1.5">
                              <div className="h-1.5 w-[92%] rounded bg-black/[0.10]" />
                              <div className="h-1.5 w-[82%] rounded bg-black/[0.08]" />
                              <div className="h-1.5 w-[95%] rounded bg-black/[0.08]" />
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999992]">
                              Education
                            </p>
                            <div className="mt-1.5 space-y-1.5">
                              <div className="h-1.5 w-[78%] rounded bg-black/[0.09]" />
                              <div className="h-1.5 w-[66%] rounded bg-black/[0.08]" />
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#999992]">
                              Skills
                            </p>
                            <div className="mt-1.5 flex gap-1.5">
                              <div className="h-1.5 w-12 rounded bg-black/[0.10]" />
                              <div className="h-1.5 w-14 rounded bg-black/[0.08]" />
                              <div className="h-1.5 w-10 rounded bg-black/[0.08]" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2.5 text-center text-[15px] font-semibold text-[#555550]">
                        ATS Score = <span className="text-[18px] font-bold text-[#dc2626]">20%</span>
                      </p>
                    </div>

                    <div className="flex h-full flex-col">
                      <div className="relative flex-1 rounded-2xl border border-[#c6ddef] bg-[#f8fbff] p-4">
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-[#cfe4f7] bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#42729b]">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2383e2]" />
                          AI
                        </div>

                        <div className="flex items-start justify-between gap-3 pr-11">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6e9bc1]">
                            Tailored
                          </p>
                          <StarRating fullStars={4} halfStar className="shrink-0" />
                        </div>

                        <div className="mt-4 space-y-2.5">
                          <div>
                            <p className="text-[14px] font-semibold tracking-[-0.01em] text-[#293b4d]">
                              Joe Charles
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#7890a5]">Software Developer</p>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6e9bc1]">
                              Experience
                            </p>
                            <div className="mt-1.5 space-y-1.5">
                              <div className="h-1.5 w-[95%] rounded bg-[#2383e2]/[0.22]" />
                              <div className="h-1.5 w-[88%] rounded bg-[#2383e2]/[0.20]" />
                              <div className="h-1.5 w-[94%] rounded bg-[#2383e2]/[0.20]" />
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6e9bc1]">
                              Education
                            </p>
                            <div className="mt-1.5 space-y-1.5">
                              <div className="h-1.5 w-[82%] rounded bg-[#2383e2]/[0.20]" />
                              <div className="h-1.5 w-[70%] rounded bg-[#2383e2]/[0.19]" />
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6e9bc1]">
                              Skills
                            </p>
                            <div className="mt-1.5 flex gap-1.5">
                              <div className="h-1.5 w-12 rounded bg-[#2383e2]/[0.20]" />
                              <div className="h-1.5 w-14 rounded bg-[#2383e2]/[0.19]" />
                              <div className="h-1.5 w-10 rounded bg-[#2383e2]/[0.19]" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2.5 text-center text-[15px] font-semibold text-[#555550]">
                        ATS Score = <span className="text-[18px] font-bold text-[#16a34a]">85%</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/[0.07] py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#8c8c86]">
              One workflow. Simple steps.
            </p>
            <div className="flex min-w-0 items-center gap-2.5 overflow-x-auto pb-1">
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] text-[#66665f]">
                Upload resume
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a0a09b]" />
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] text-[#66665f]">
                Match job description
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#a0a09b]" />
              <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] text-[#66665f]">
                Apply with confidence
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 py-20 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8c8c86]">
              Features
            </p>
            <h2 className="mt-3 text-[34px] font-bold tracking-[-0.035em] sm:text-[44px]">
              Simple, fast, and effective.
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[#6c6c66]">
              No complex dashboards. Just the essential tools you need to tailor your resume and apply faster.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              { icon: DocumentIcon, title: "Craft a clear resume", body: "Paste your current resume. We clean up the structure and rewrite key points to highlight your strengths." },
              { icon: TargetIcon, title: "Match the job listing", body: "Add the job description so your resume automatically highlights the exact skills recruiters look for." },
              { icon: ExportIcon, title: "Easy export", body: "Download an ATS-friendly PDF or Word document in seconds, ready to submit." },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-[24px] border border-black/[0.08] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/14 hover:shadow-[0_18px_40px_rgba(0,0,0,0.05)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5f5f2] text-[#454541] transition-colors group-hover:bg-[#eef4fa] group-hover:text-[#3973a7]">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.015em]">{title}</h3>
                <p className="mt-2.5 text-[15px] leading-7 text-[#6c6c66]">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="relative overflow-hidden rounded-[26px] border border-black/[0.08] bg-[#f3f0ea] p-6 sm:p-8">
              <div className="relative max-w-lg">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#85857f]">
                  Honest &amp; Real
                </p>
                <h3 className="mt-3 text-[27px] font-semibold tracking-[-0.03em] sm:text-[31px]">
                  Better wording, real experience.
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#656560]">
                  Craft &amp; Apply sharpens your actual work history — highlighting your
                  real achievements without inventing fake experience.
                </p>
              </div>
            </div>

            <div className="rounded-[26px] border border-black/[0.08] bg-white p-6 sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#85857f]">
                Next steps
              </p>
              <h3 className="mt-3 text-[27px] font-semibold tracking-[-0.03em]">
                Go from resume to job search.
              </h3>
              <Link
                href="/jobs"
                className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#202020] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black/60"
              >
                Browse open jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-t border-black/[0.07] py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8c8c86]">
                How it works
              </p>
              <h2 className="mt-3 text-[34px] font-bold tracking-[-0.035em] sm:text-[44px]">
                3 simple steps.
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-7 text-[#6c6c66]">
                Create a job-ready resume in just a few clicks.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["01", "Paste your resume", "Upload or paste your current resume. Any format works."],
                ["02", "Paste the job description", "Add the job listing you want to target so we can match key skills."],
                ["03", "Review and download", "Get your tailored resume, check the improvements, and download your file."],
              ].map(([number, title, body]) => (
                <div
                  key={number}
                  className="flex gap-4 rounded-[22px] border border-black/[0.08] bg-white p-5 sm:gap-6 sm:p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5f5f2] text-[12px] font-semibold text-[#656560]">
                    {number}
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h3>
                    <p className="mt-1.5 text-[14px] leading-6 text-[#6f6f69]">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/[0.07] py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8c8c86]">
                Job search
              </p>
              <h2 className="mt-3 text-[34px] font-bold tracking-[-0.035em] sm:text-[44px]">
                Tailor your resume and apply right away.
              </h2>
              <p className="mt-4 max-w-xl text-[16px] leading-7 text-[#6c6c66]">
                Once your resume is ready, explore open job listings and start applying immediately.
              </p>
              <Link href="/jobs" className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-[#202020]">
                See available jobs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <LiveMatchPreview />
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-black/[0.07] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark small />
                <span className="text-[15px] font-semibold">Craft &amp; Apply</span>
              </div>
              <p className="mt-4 max-w-sm text-[14px] leading-6 text-[#777770]">
                A simple way to build a tailored, ATS-friendly resume and land your next job faster.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#202020]">Product</p>
              <div className="mt-3 space-y-2.5 text-[13px] text-[#777770]">
                <a href="#features" className="block hover:text-[#202020]">
                  Features
                </a>
                <Link href="/jobs" className="block hover:text-[#202020]">
                  Jobs
                </Link>
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#202020]">Company</p>
              <div className="mt-3 space-y-2.5 text-[13px] text-[#777770]">
                <Link href="/about" className="block hover:text-[#202020]">
                  About us
                </Link>
                <a href="#how-it-works" className="block hover:text-[#202020]">
                  How it works
                </a>
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-[#202020]">Legal</p>
              <div className="mt-3 space-y-2.5 text-[13px] text-[#777770]">
                <Link href="/privacy" className="block hover:text-[#202020]">
                  Privacy policy
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-black/[0.07] pt-8 text-[13px] text-[#888880] sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Craft &amp; Apply. All rights reserved.</p>
            <p>Designed for clarity and focus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}