"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

// Progressive disclosure: a plain "+ Add domain" link by default, the actual
// input only appears once clicked — keeps the sidebar quiet.
export default function AddDomainInline() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }
    setName("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-accent hover:underline">
        + Add domain
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="hardypaw.com"
        autoFocus
        className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      />
      {error && <p className="text-xs text-fall">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md bg-ink text-white text-xs px-3 py-1.5 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading && <Spinner />}
          {loading ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-xs text-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
