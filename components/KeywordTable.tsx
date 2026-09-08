"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PositionChart, { CheckPoint } from "./PositionChart";
import { Sparkline } from "./Sparkline";

export type KeywordRow = {
  id: string;
  term: string;
  country: string;
  device: string;
  checks: CheckPoint[];
};

function PositionCell({ current, previous }: { current: number | null; previous: number | null }) {
  if (current == null) {
    return <span className="text-sm text-muted">Outside top 10</span>;
  }
  const delta = previous != null ? previous - current : null; // positive = improved

  return (
    <div className="flex items-baseline gap-2 font-mono">
      <span className="text-[15px] font-medium tabular-nums text-ink">{current}</span>
      {delta != null && delta !== 0 && (
        <span className={`text-xs tabular-nums ${delta > 0 ? "text-rise" : "text-fall"}`}>
          {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
        </span>
      )}
    </div>
  );
}

const gridCols = "grid grid-cols-[1fr_88px_84px_88px_96px_60px] items-center gap-3";

export default function KeywordTable({ keywords }: { keywords: KeywordRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  async function checkOne(id: string) {
    setBusyId(id);
    await fetch(`/api/keywords/${id}/check`, { method: "POST" }).catch(() => null);
    setBusyId(null);
    router.refresh();
  }

  async function removeOne(id: string) {
    if (!confirm("Remove this keyword?")) return;
    setBusyId(id);
    await fetch(`/api/keywords/${id}`, { method: "DELETE" }).catch(() => null);
    setBusyId(null);
    router.refresh();
  }

  if (keywords.length === 0) {
    return (
      <p className="text-sm text-muted py-6">
        Nothing tracked here yet. Add a keyword above to start recording its position.
      </p>
    );
  }

  return (
    <div className="min-w-[560px]">
      <div className={`${gridCols} border-b border-line pb-2 text-xs text-muted`}>
        <span>Keyword</span>
        <span>Position</span>
        <span>Trend</span>
        <span>Last checked</span>
        <span />
        <span />
      </div>

      <div className="divide-y divide-line">
        {keywords.map((kw) => {
          const [latest, prev] = kw.checks;
          const isOpen = expanded === kw.id;
          const isBusy = busyId === kw.id;
          return (
            <div key={kw.id}>
              <div className={`${gridCols} py-3`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : kw.id)}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                >
                  <div className="text-sm text-ink">{kw.term}</div>
                  <div className="text-xs text-muted">
                    {kw.country.toUpperCase()} · {kw.device}
                  </div>
                </button>

                <PositionCell current={latest?.position ?? null} previous={prev?.position ?? null} />

                <Sparkline values={kw.checks.slice().reverse().map((c) => c.position)} />

                <span className="text-xs text-muted">
                  {latest ? new Date(latest.checkedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}
                </span>

                <button
                  onClick={() => checkOne(kw.id)}
                  disabled={isBusy}
                  className="text-xs text-muted hover:text-accent disabled:opacity-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                >
                  {isBusy ? "…" : "Check"}
                </button>

                <button
                  onClick={() => removeOne(kw.id)}
                  disabled={isBusy}
                  className="text-xs text-muted hover:text-fall disabled:opacity-50 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                >
                  Remove
                </button>
              </div>

              {isOpen && (
                <div className="pb-4 pl-0">
                  <PositionChart checks={kw.checks} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
