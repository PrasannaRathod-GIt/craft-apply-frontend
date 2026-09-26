"use client";

import { useEffect, useState } from "react";
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
        // 401 means the cookie loop isn't working, or the user really isn't logged in -
        // either way, send them to login rather than showing a broken page.
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
      <main className="flex min-h-screen items-center justify-center">
        <p>Checking session...</p>
      </main>
    );
  }

  if (!user) {
    return null; // redirect is already in flight
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Welcome, {user.username ?? user.email}</h1>
      <p className="mt-2 text-gray-600">
        This page loaded your session via the FastAPI /me endpoint using the httpOnly
        cookie set at login - confirming the cross-origin auth loop works.
      </p>
      <button
        onClick={handleLogout}
        className="mt-6 rounded border px-4 py-2 hover:bg-gray-50"
      >
        Log out
      </button>
    </main>
  );
}
