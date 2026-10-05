"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  loginWithPassword,
  googleLoginUrl,
} from "@/lib/api/auth";
import { apiFetch, ApiError } from "@/lib/api/client";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (!username.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await loginWithPassword(email.trim(), password);
        router.push("/dashboard");
        return;
      }

      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      /*
       * Registration succeeded.
       *
       * Log the user in immediately so the account creation flow
       * ends with an authenticated session rather than making the
       * user enter the same credentials again.
       */
      await loginWithPassword(email.trim(), password);

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        console.error("Authentication error:", err);
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-gray-900">
      {/* Header */}
      <header className="border-b border-[#e9e6e1]">
        <div className="mx-auto flex max-w-5xl items-center px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-900">
              C
            </span>

            <span className="text-[15px] font-semibold tracking-tight text-gray-900 sm:text-base">
              Craft &amp; Apply
            </span>
          </Link>
        </div>
      </header>

      {/* Auth */}
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-[#e4e0da] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
            {/* Heading */}
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {mode === "login"
                  ? "Welcome back"
                  : "Create your account"}
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {mode === "login"
                  ? "Log in to continue with Craft & Apply."
                  : "Create an account and start your application journey."}
              </p>
            </div>

            {/* Login / Signup tabs */}
            <div className="mb-6 grid grid-cols-2 rounded-xl border border-[#e4e0da] bg-[#faf9f7] p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Log in
              </button>

              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>

                  <input
                    id="username"
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder={
                    mode === "signup"
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "signup"
                      ? "new-password"
                      : "current-password"
                  }
                  required
                  className="w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#ddd9d2] bg-[#fcfbf9] px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? mode === "login"
                    ? "Logging in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Log in"
                    : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-xs font-medium text-gray-400">
              <div className="h-px flex-1 bg-[#e9e6e1]" />
              <span>OR</span>
              <div className="h-px flex-1 bg-[#e9e6e1]" />
            </div>

            {/* Google */}
            <a
              href={googleLoginUrl()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#ddd9d2] bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-[#faf9f7]"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.23c0-.72-.06-1.41-.18-2.07H12v3.92h5.23a4.47 4.47 0 01-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.22z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0012 21.5z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.53 13.6a5.85 5.85 0 010-3.2V7.88H3.28a9.5 9.5 0 000 8.24l3.25-2.52z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.37c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.74 9.74 0 00-8.72 5.38l3.25 2.52C7.3 8.09 9.46 6.37 12 6.37z"
                />
              </svg>

              Continue with Google
            </a>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            Your account lets you save your resume work and continue your
            application journey.
          </p>
        </div>
      </div>
    </main>
  );
}