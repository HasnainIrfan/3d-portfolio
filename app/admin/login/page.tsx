"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FC, type FormEvent } from "react";

const LoginForm: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Could not sign in.");
        setPending(false);
        return;
      }

      // `next` comes from the URL, so it must be treated as untrusted: only a
      // same-site absolute path is allowed through, or this becomes an open
      // redirect that sends a freshly-signed-in admin to another origin.
      const next = searchParams.get("next");
      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

      // refresh() so the Server Component re-runs and sees the new cookie.
      router.replace(safeNext);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className="field-label">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input field-input-focus"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="field-label">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input field-input-focus"
          placeholder="••••••••••••"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm text-coral"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>{pending ? "Signing in…" : "Sign in"}</span>
      </button>
    </form>
  );
};

const AdminLoginPage: FC = () => (
  <main className="flex min-h-screen items-center justify-center px-5 py-16">
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-royal to-coral text-lg font-black text-white">
          H
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Admin sign in
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Contact submissions for hasnainirfan.dev
        </p>
      </div>

      <div className="glass gradient-border p-6">
        {/* useSearchParams needs a Suspense boundary to keep the route from
            opting the whole page into client-side rendering. */}
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-lg bg-white/5" />}
        >
          <LoginForm />
        </Suspense>
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Protected area · repeated failures are rate limited
      </p>
    </div>
  </main>
);

export default AdminLoginPage;
