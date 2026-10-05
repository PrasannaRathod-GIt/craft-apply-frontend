import Link from "next/link";

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: October 2026</p>

          <div className="mt-6 space-y-5 text-sm leading-relaxed text-gray-700">
            <p>
              Craft &amp; Apply (&quot;we&quot;, &quot;our&quot;) provides AI-assisted resume
              tailoring and a job listings board. This page explains what information we
              collect and how it&apos;s used.
            </p>

            <div>
              <h2 className="font-semibold text-gray-900">What we collect</h2>
              <p className="mt-1">
                Your email and name when you sign up or sign in with Google. The resume
                text and job descriptions you paste in, so we can generate a tailored
                version. Basic usage data such as which jobs you&apos;ve viewed.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">How we use it</h2>
              <p className="mt-1">
                Resume text you submit is sent to Google&apos;s Gemini API to extract and
                tailor your resume content. We store your generated resumes in your
                account so you can download or delete them later. We do not sell your
                data to third parties.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Your controls</h2>
              <p className="mt-1">
                You can download or permanently delete any saved resume from your
                profile at any time. Deleting a resume removes it from our database
                immediately and cannot be undone.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Job listings</h2>
              <p className="mt-1">
                Job postings shown on this site are sourced from public listings
                (including Adzuna, Greenhouse, and Internshala) and link back to the
                original posting. We are not the employer and are not responsible for
                the accuracy of third-party listings.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">Contact</h2>
              <p className="mt-1">
                Questions about this policy can be sent to the contact details listed
                on our About page.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}