"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./Spinner";

type Site = { siteUrl: string; permissionLevel: string };

export default function GoogleConnectionForm({
  hasClientId,
  isConnected,
  selectedSite,
}: {
  hasClientId: boolean;
  isConnected: boolean;
  selectedSite: string | null;
}) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sites, setSites] = useState<Site[] | null>(null);
  const [loadingSites, setLoadingSites] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const router = useRouter();

  async function saveCredentials(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/google/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, clientSecret }),
    });

    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't save");
      return;
    }
    setClientId("");
    setClientSecret("");
    setSaved(true);
    router.refresh();
  }

  async function loadSites() {
    setLoadingSites(true);
    setError(null);
    const res = await fetch("/api/google/sites");
    const body = await res.json().catch(() => ({}));
    setLoadingSites(false);
    if (!res.ok) {
      setError(body.error ?? "Couldn't load properties");
      return;
    }
    setSites(body.sites ?? []);
  }

  async function selectSite(siteUrl: string) {
    await fetch("/api/google/select-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteUrl }),
    }).catch(() => null);
    setSites(null);
    router.refresh();
  }

  async function disconnect() {
    setDisconnecting(true);
    await fetch("/api/google/disconnect", { method: "POST" }).catch(() => null);
    setDisconnecting(false);
    router.refresh();
  }

  const inputClasses =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";
  const labelClasses = "block text-sm text-ink mb-1";
  const helpClasses = "text-xs text-muted mt-1";

  return (
    <div className="space-y-4">
      <form onSubmit={saveCredentials} className="space-y-3">
        <div>
          <label className={labelClasses} htmlFor="gClientId">
            Google OAuth Client ID
          </label>
          <input
            id="gClientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder={hasClientId ? "Already saved — paste a new one to replace it" : "xxxx.apps.googleusercontent.com"}
            className={inputClasses}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClasses} htmlFor="gClientSecret">
            Google OAuth Client Secret
          </label>
          <input
            id="gClientSecret"
            type="password"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Leave blank to keep the saved one"
            className={inputClasses}
            autoComplete="off"
          />
        </div>
        <p className={helpClasses}>
          From your own Google Cloud project (console.cloud.google.com) — create an OAuth Client ID
          (type: Web application) with authorized redirect URI ending in{" "}
          <code className="font-mono">/api/google/callback</code> on this domain, and enable the
          Search Console API.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || (!clientId && !clientSecret)}
            className="flex items-center gap-1.5 rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving && <Spinner />}
            {saving ? "Saving…" : "Save credentials"}
          </button>
          {saved && <span className="text-xs text-rise">Saved.</span>}
        </div>
      </form>

      {error && <p className="text-xs text-fall">{error}</p>}

      <div className="border-t border-line pt-4">
        {!hasClientId && (
          <p className="text-xs text-muted">Save your Client ID above before connecting.</p>
        )}
        {hasClientId && !isConnected && (
          <a
            href="/api/google/connect"
            className="inline-block rounded-md border border-line bg-surface text-sm px-4 py-2 text-ink hover:border-accent hover:text-accent"
          >
            Connect Search Console
          </a>
        )}
        {hasClientId && isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink">
                Connected{selectedSite ? ` — tracking ${selectedSite}` : " — no property selected yet"}
              </p>
              <button onClick={disconnect} disabled={disconnecting} className="text-xs text-muted hover:text-fall">
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
            <button
              onClick={loadSites}
              disabled={loadingSites}
              className="flex items-center gap-1.5 text-xs text-accent hover:underline disabled:opacity-50"
            >
              {loadingSites && <Spinner />}
              {selectedSite ? "Change property" : "Choose a property"}
            </button>
            {sites && (
              <div className="space-y-1">
                {sites.length === 0 && (
                  <p className="text-xs text-muted">No verified properties found on this Google account.</p>
                )}
                {sites.map((s) => (
                  <button
                    key={s.siteUrl}
                    onClick={() => selectSite(s.siteUrl)}
                    className="block w-full text-left text-xs px-2 py-1.5 rounded hover:bg-paper text-ink"
                  >
                    {s.siteUrl}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
