"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddKeywordForm({
  domainId,
  defaultCountry = "us",
  defaultLanguage = "en",
}: {
  domainId: string;
  defaultCountry?: string;
  defaultLanguage?: string;
}) {
  const [term, setTerm] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const language = defaultLanguage; // per-keyword language override isn't exposed in the UI yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId, term, country, device, language }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }
    setTerm("");
    router.refresh();
  }

  const selectClasses =
    "rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2 items-start">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="dog joint supplements"
        className="flex-1 min-w-[200px] rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClasses}>
        <option value="us">US</option>
        <option value="in">IN</option>
        <option value="gb">GB</option>
        <option value="ca">CA</option>
        <option value="au">AU</option>
      </select>
      <select
        value={device}
        onChange={(e) => setDevice(e.target.value as "desktop" | "mobile")}
        className={selectClasses}
      >
        <option value="desktop">Desktop</option>
        <option value="mobile">Mobile</option>
      </select>
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors motion-reduce:transition-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        {loading ? "Checking…" : "Add keyword"}
      </button>
      {error && <p className="w-full text-xs text-fall">{error}</p>}
    </form>
  );
}
