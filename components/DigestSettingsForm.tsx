"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

export default function DigestSettingsForm({
  currentKeyMasked,
  currentEmail,
  currentEnabled,
}: {
  currentKeyMasked: string | null;
  currentEmail: string;
  currentEnabled: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [email, setEmail] = useState(currentEmail);
  const [enabled, setEnabled] = useState(currentEnabled);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resendApiKey: apiKey, digestEmail: email, digestEnabled: enabled }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Couldn't save — try again.");
      return;
    }
    setApiKey("");
    setSaved(true);
    router.refresh();
  }

  const inputClasses =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const labelClasses = "block text-sm text-ink mb-1";
  const helpClasses = "text-xs text-muted mt-1";

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={labelClasses} htmlFor="resendKey">
          Resend API key
        </label>
        <input
          id="resendKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={currentKeyMasked ? currentKeyMasked : "re_xxxxxxxx"}
          className={inputClasses}
          autoComplete="off"
        />
        <p className={helpClasses}>
          From <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-accent">resend.com</a> — free tier is plenty for a weekly email. Leave blank to keep the saved key.
        </p>
      </div>
      <div>
        <label className={labelClasses} htmlFor="digestEmail">
          Send digest to
        </label>
        <input
          id="digestEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClasses}
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-accent"
        />
        Send me a weekly Search Console digest (Mondays)
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {saving && <Spinner />}
          {saving ? "Saving…" : "Save digest settings"}
        </button>
        {saved && <span className="text-xs text-rise">Saved.</span>}
        {error && <span className="text-xs text-fall">{error}</span>}
      </div>
    </form>
  );
}
