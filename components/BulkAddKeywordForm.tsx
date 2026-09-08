"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function BulkAddKeywordForm({
  domainId,
  defaultCountry = "us",
  defaultLanguage = "en",
}: {
  domainId: string;
  defaultCountry?: string;
  defaultLanguage?: string;
}) {
  const [terms, setTerms] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const language = defaultLanguage;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();

  const count = terms.split("\n").map((t) => t.trim()).filter(Boolean).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!terms.trim()) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const res = await fetch("/api/keywords/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domainId,
        terms,
        country,
        device,
        language,
        tags: parseTags(tagsInput),
      }),
    });

    setLoading(false);
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Something went wrong");
      return;
    }
    setTerms("");
    setTagsInput("");
    setNotice(`Added ${body.created} keyword${body.created === 1 ? "" : "s"} — hit "Refresh now" to check them.`);
    router.refresh();
  }

  const selectClasses =
    "rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const inputClasses =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={terms}
        onChange={(e) => setTerms(e.target.value)}
        placeholder={"One keyword per line, e.g.\ndog joint supplements\nbest dog probiotics\ncat dental chews"}
        rows={4}
        className={`${inputClasses} resize-y`}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="tags for all of these (comma separated)"
          className={`flex-1 min-w-[200px] ${inputClasses}`}
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
          disabled={loading || count === 0}
          className="rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors motion-reduce:transition-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {loading ? "Adding…" : count > 0 ? `Add ${count} keyword${count === 1 ? "" : "s"}` : "Add keywords"}
        </button>
      </div>
      <p className="text-xs text-muted">
        These won't be checked immediately — add them, then hit "Refresh now" to check them all at
        once (safer for large batches, avoids request timeouts).
      </p>
      {notice && <p className="text-xs text-rise">{notice}</p>}
      {error && <p className="text-xs text-fall">{error}</p>}
    </form>
  );
}
