"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PositionChart, { CheckPoint } from "./PositionChart";
import { Sparkline } from "./Sparkline";

export type KeywordRow = {
  id: string;
  term: string;
  country: string;
  device: string;
  tags: string[];
  checks: CheckPoint[];
};

function PositionCell({
  current,
  previous,
  url,
  maxCheckDepth,
}: {
  current: number | null;
  previous: number | null;
  url: string | null | undefined;
  maxCheckDepth: number;
}) {
  if (current == null) {
    return <span className="text-sm text-muted">Outside top {maxCheckDepth}</span>;
  }
  const delta = previous != null ? previous - current : null; // positive = improved
  let path = "";
  try {
    if (url) path = new URL(url).pathname.replace(/\/$/, "") || "/";
  } catch {
    path = "";
  }

  return (
    <div className="font-mono">
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-medium tabular-nums text-ink">{current}</span>
        {delta != null && delta !== 0 && (
          <span className={`text-xs tabular-nums ${delta > 0 ? "text-rise" : "text-fall"}`}>
            {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
          </span>
        )}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-muted hover:text-accent truncate max-w-[140px] font-sans"
          title={url}
        >
          {path || url}
        </a>
      )}
    </div>
  );
}

const gridCols = "grid grid-cols-[20px_1fr_100px_84px_88px_96px_60px] items-center gap-3";

export default function KeywordTable({
  keywords,
  maxCheckDepth,
}: {
  keywords: KeywordRow[];
  maxCheckDepth: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagFilter, setTagFilter] = useState<string>("all");
  const router = useRouter();

  const allTags = useMemo(() => {
    const set = new Set<string>();
    keywords.forEach((k) => k.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [keywords]);

  const visible = useMemo(
    () => (tagFilter === "all" ? keywords : keywords.filter((k) => k.tags.includes(tagFilter))),
    [keywords, tagFilter]
  );

  const allVisibleSelected = visible.length > 0 && visible.every((k) => selected.has(k.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visible.forEach((k) => next.delete(k.id));
        return next;
      }
      const next = new Set(prev);
      visible.forEach((k) => next.add(k.id));
      return next;
    });
  }

  async function checkOne(id: string) {
    setBusyId(id);
    setErrors((prev) => ({ ...prev, [id]: "" }));

    const res = await fetch(`/api/keywords/${id}/check`, { method: "POST" }).catch(() => null);
    const outcome = await res?.json().catch(() => null);

    setErrors((prev) => ({ ...prev, [id]: outcome?.error ?? "" }));
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

  async function bulkAction(action: "check" | "remove") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (action === "remove" && !confirm(`Remove ${ids.length} selected keyword${ids.length === 1 ? "" : "s"}?`)) {
      return;
    }
    setBulkBusy(true);
    await fetch("/api/keywords/bulk-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    }).catch(() => null);
    setBulkBusy(false);
    setSelected(new Set());
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
    <div className="min-w-[640px]">
      <div className="flex items-center justify-between pb-2">
        {allTags.length > 0 ? (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="text-xs rounded-md border border-line bg-surface px-2 py-1 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <option value="all">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}

        {selected.size > 0 && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted">{selected.size} selected</span>
            <button
              onClick={() => bulkAction("check")}
              disabled={bulkBusy}
              className="text-accent hover:underline disabled:opacity-50"
            >
              {bulkBusy ? "Working…" : "Check selected"}
            </button>
            <button
              onClick={() => bulkAction("remove")}
              disabled={bulkBusy}
              className="text-fall hover:underline disabled:opacity-50"
            >
              Remove selected
            </button>
            <button onClick={() => setSelected(new Set())} className="text-muted hover:text-ink">
              Clear
            </button>
          </div>
        )}
      </div>

      <div className={`${gridCols} border-b border-line pb-2 text-xs text-muted`}>
        <input
          type="checkbox"
          checked={allVisibleSelected}
          onChange={toggleAll}
          className="accent-accent"
          aria-label="Select all"
        />
        <span>Keyword</span>
        <span>Position</span>
        <span>Trend</span>
        <span>Last checked</span>
        <span />
        <span />
      </div>

      <div className="divide-y divide-line">
        {visible.map((kw) => {
          const [latest, prev] = kw.checks;
          const isOpen = expanded === kw.id;
          const isBusy = busyId === kw.id;
          const error = errors[kw.id];
          return (
            <div key={kw.id}>
              <div className={`${gridCols} py-3`}>
                <input
                  type="checkbox"
                  checked={selected.has(kw.id)}
                  onChange={() => toggleOne(kw.id)}
                  className="accent-accent"
                  aria-label={`Select ${kw.term}`}
                />

                <button
                  onClick={() => setExpanded(isOpen ? null : kw.id)}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm"
                >
                  <div className="text-sm text-ink">{kw.term}</div>
                  <div className="text-xs text-muted">
                    {kw.country.toUpperCase()} · {kw.device}
                  </div>
                  {kw.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {kw.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-line text-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>

                <PositionCell
                  current={latest?.position ?? null}
                  previous={prev?.position ?? null}
                  url={latest?.url}
                  maxCheckDepth={maxCheckDepth}
                />

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

              {error && (
                <div className="pb-3 -mt-1">
                  <p className="text-xs text-fall">Check failed: {error}</p>
                </div>
              )}

              {isOpen && (
                <div className="pb-4 pl-0">
                  <PositionChart checks={kw.checks} maxCheckDepth={maxCheckDepth} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
