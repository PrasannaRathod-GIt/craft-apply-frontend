import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0a66c2] text-sm font-bold text-white">
              C
            </span>
            <span className="text-lg font-semibold text-gray-900">Craft &amp; Apply</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-[#0a66c2] hover:underline">
            &larr; Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">About Craft &amp; Apply</h1>
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-700">
            <p>
              Craft &amp; Apply helps job seekers tailor their resume to a specific role
              in seconds, using AI to re-weight and rephrase an existing resume &mdash;
              never inventing experience you don&apos;t have.
            </p>
            <p>
              Alongside the resume tool, we run a job board that aggregates genuine
              listings from public sources and links directly back to the original
              posting, so you always apply on the real platform.
            </p>
            <p>
              Every exported resume follows ATS-safe formatting: single-column, standard
              section headings, no tables or graphics &mdash; built to be read correctly
              by applicant tracking systems, not just to look good.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}