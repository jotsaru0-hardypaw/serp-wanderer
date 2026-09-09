"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }
    router.push("/");
    router.refresh();
  }

  const inputClasses =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-ink mb-1" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClasses}
          autoComplete="username"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm text-ink mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-xs text-fall">{error}</p>}
      <button
        type="submit"
        disabled={loading || !username || !password}
        className="flex items-center justify-center gap-1.5 w-full rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors motion-reduce:transition-none disabled:opacity-50"
      >
        {loading && <Spinner />}
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-xs text-muted text-center">
        No account? <a href="/signup" className="text-accent hover:underline">Sign up</a>
      </p>
    </form>
  );
}
