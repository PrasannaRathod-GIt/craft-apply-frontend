"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, type CurrentUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.push("/login");
        }
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

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

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-gray-900">
      {/* Navigation */}
      <header className="border-b border-[#e9e6e1] bg-[#fbfaf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900">
              C
            </span>

            <span className="text-[15px] font-semibold tracking-tight text-gray-900 sm:text-base">
              Craft &amp; Apply
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
        {/* Welcome */}
        <section>
          <p className="text-sm font-medium tracking-wide text-gray-500">
            Your workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Welcome, {user.username ?? user.email}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-[17px]">
            Everything you need to find an opportunity and put your best
            application forward.
          </p>
        </section>

        {/* Main actions */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/resume"
            className="group rounded-2xl border border-[#e4e0da] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d8d3cb] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4e0da] bg-[#faf9f7] text-lg font-semibold text-gray-700">
                C
              </div>

              <span className="text-lg text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-600">
                →
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Craft your resume
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-[15px]">
              Tailor your resume to the role you want and create an
              application-ready version.
            </p>
          </Link>

          <Link
            href="/jobs"
            className="group rounded-2xl border border-[#e4e0da] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d8d3cb] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4e0da] bg-[#faf9f7] text-gray-700">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </div>

              <span className="text-lg text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-gray-600">
                →
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Explore jobs
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-[15px]">
              Browse internships and jobs, filter by location, and discover
              your next opportunity.
            </p>
          </Link>
        </section>

        {/* Account */}
        <section className="mt-8 rounded-2xl border border-[#e4e0da] bg-white p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
                Account
              </p>

              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {user.username ?? "Your account"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
            >
              Log out
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}