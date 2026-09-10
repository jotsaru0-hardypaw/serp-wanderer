"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";
import LocationInput from "./LocationInput";

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Splits on commas AND newlines, so pasting a column copied from Excel/Sheets
// (which pastes as one line per cell) is treated as one keyword per line,
// same as typing several comma-separated on one line.
function parseTerms(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export default function AddKeywordForm({
  domainId,
  defaultCountry = "us",
  defaultLanguage = "en",
  defaultLocation = "",
  onSuccess,
}: {
  domainId: string;
  defaultCountry?: string;
  defaultLanguage?: string;
  defaultLocation?: string;
  onSuccess?: () => void;
}) {
  const [terms, setTerms] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [country, setCountry] = useState(defaultCountry);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [location, setLocation] = useState(defaultLocation);
  const language = defaultLanguage; // per-keyword language override isn't exposed in the UI yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const termList = parseTerms(terms);
  const termCount = termList.length;

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (termCount === 0) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const tags = parseTags(tagsInput);
    const isSingle = termCount === 1;

    // A single keyword checks immediately for instant feedback. Several at
    // once go through the bulk endpoint, which skips the immediate check to
    // avoid timing out — run "Refresh now" afterward to check them.
    const res = await fetch(isSingle ? "/api/keywords" : "/api/keywords/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isSingle
          ? { domainId, term: termList[0], country, device, language, location, tags }
          : { domainId, terms: termList.join("\n"), country, device, language, location, tags }
      ),
    });

    setLoading(false);
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(body.error ?? "Something went wrong");
      return;
    }
    let clean = true;
    if (isSingle) {
      if (body.duplicate) {
        setNotice(`"${termList[0]}" is already tracked for this country/device/location.`);
        clean = false;
      } else if (body.outcome?.error) {
        setError(`Added, but the first check failed: ${body.outcome.error}`);
        clean = false;
      }
    } else {
      const skipped = body.skipped ?? 0;
      setNotice(
        `Added ${body.created} keyword${body.created === 1 ? "" : "s"}` +
          (skipped > 0 ? ` (skipped ${skipped} already tracked)` : "") +
          ` — hit "Refresh now" to check them.`
      );
      clean = skipped === 0;
    }
    setTerms("");
    setTagsInput("");
    requestAnimationFrame(autoGrow);
    router.refresh();
    // Auto-close the modal on a clean add; leave it open when there's a
    // notice/error worth reading first (duplicate, failed check, skips).
    if (clean) onSuccess?.();
  }

  const selectClasses =
    "rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const inputClasses =
    "rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-wrap gap-2 items-start">
        <textarea
          ref={textareaRef}
          value={terms}
          onChange={(e) => {
            setTerms(e.target.value);
            autoGrow();
          }}
          onKeyDown={(e) => {
            // Enter submits (matches a single-line bar's feel); Shift+Enter
            // adds a line, for pasting/typing several keywords.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={"dog joint supplements\n(paste a column from Excel, or comma-separate on one line)"}
          rows={1}
          className={`flex-1 min-w-[220px] resize-none overflow-hidden leading-normal ${inputClasses}`}
        />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="tags (comma separated)"
          className={`min-w-[160px] ${inputClasses}`}
        />
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClasses}>
          <option value="us">US</option>
          <option value="in">IN</option>
          <option value="gb">GB</option>
          <option value="ca">CA</option>
          <option value="au">AU</option>
        </select>
        {country === "us" && (
          <LocationInput
            id="keyword-location"
            value={location}
            onChange={setLocation}
            className={`min-w-[180px] ${inputClasses}`}
          />
        )}
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
          disabled={loading || termCount === 0}
          className="flex items-center gap-1.5 rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors motion-reduce:transition-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          {loading && <Spinner />}
          {loading
            ? "Adding…"
            : termCount > 1
            ? `Add ${termCount} keywords`
            : "Add keyword"}
        </button>
      </div>
      <p className="text-xs text-muted">
        Paste a column of keywords from Excel/Sheets, or comma-separate them on one line — either
        way, each one is added separately. More than one skips the instant check (to avoid
        timeouts); hit "Refresh now" afterward to check them.
      </p>
      {notice && <p className="text-xs text-rise">{notice}</p>}
      {error && <p className="text-xs text-fall">{error}</p>}
    </form>
  );
}
