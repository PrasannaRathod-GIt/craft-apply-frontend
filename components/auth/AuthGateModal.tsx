"use client";

import { useState, type FormEvent } from "react";
import { loginWithPassword, signup, googleLoginUrl } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

type Props = {
  onAuthenticated: () => void;
  onBeforeGoogleRedirect?: () => void;
};

export default function AuthGateModal({ onAuthenticated, onBeforeGoogleRedirect }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await loginWithPassword(email, password);
      } else {
        await signup(email, password, username || undefined);
      }
      onAuthenticated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    onBeforeGoogleRedirect?.();
    window.location.href = googleLoginUrl();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
        <h2 className="text-center text-lg font-bold text-gray-900">
          {mode === "login" ? "Log in to see your resume" : "Sign up to see your resume"}
        </h2>
        <p className="mt-1 text-center text-sm text-gray-500">
          Your tailored resume is ready &mdash; create a free account to view and download it.
        </p>

        <div className="mt-5 flex rounded-full bg-gray-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-full py-1.5 transition-colors ${
              mode === "login" ? "bg-white text-gray-900 shadow" : "text-gray-500"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-1.5 transition-colors ${
              mode === "signup" ? "bg-white text-gray-900 shadow" : "text-gray-500"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="group relative mt-1 overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold text-white
                       bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-[length:200%_200%]
                       shadow-lg shadow-purple-500/30 transition-all duration-300 ease-out
                       hover:scale-105 hover:bg-[position:100%_0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-full border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}