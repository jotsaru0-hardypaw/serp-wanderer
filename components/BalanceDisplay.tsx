"use client";

import { useEffect, useState } from "react";

export default function BalanceDisplay({ hasApiKey }: { hasApiKey: boolean }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "ok"; balance: number; pendingBalance: number } | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    if (!hasApiKey) return;
    fetch("/api/settings/balance")
      .then((r) => r.json())
      .then((body) => {
        if (body.error) setState({ status: "error", message: body.error });
        else setState({ status: "ok", balance: body.balance, pendingBalance: body.pendingBalance });
      })
      .catch(() => setState({ status: "error", message: "Couldn't reach Bright Data" }));
  }, [hasApiKey]);

  if (!hasApiKey) return null;

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      {state.status === "loading" && <p className="text-xs text-muted">Checking Bright Data balance…</p>}
      {state.status === "error" && (
        <p className="text-xs text-muted">Couldn't fetch Bright Data balance ({state.message}).</p>
      )}
      {state.status === "ok" && (
        <p className="text-xs text-ink">
          Bright Data account balance: <span className="font-mono">${state.balance.toFixed(2)}</span>
          {state.pendingBalance > 0 && (
            <span className="text-muted"> · ${state.pendingBalance.toFixed(2)} pending next cycle</span>
          )}
        </p>
      )}
      <p className="text-xs text-muted mt-1">
        This is your paid account balance, not your free-tier monthly credit count — Bright Data
        doesn't expose that figure through a public API, so check it on their dashboard directly.
      </p>
    </div>
  );
}
