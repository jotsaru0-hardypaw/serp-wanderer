"use client";

import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";

type Row = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

const DIMENSION_LABEL: Record<string, string> = {
  query: "Query",
  page: "Page",
  date: "Date",
  country: "Country",
  device: "Device",
};

export default function InsightsView({ siteUrl }: { siteUrl: string }) {
  const [type, setType] = useState<"web" | "discover" | "news">("web");
  const [dimension, setDimension] = useState("query");
  const [days, setDays] = useState(28);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<{ startDate: string; endDate: string } | null>(null);

  // Discover/News don't support the "query" dimension — jump to "page" for
  // them automatically rather than letting the request fail.
  useEffect(() => {
    if (type !== "web" && dimension === "query") setDimension("page");
  }, [type, dimension]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/google/insights?type=${type}&dimension=${dimension}&days=${days}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? "Something went wrong");
        return body;
      })
      .then((body) => {
        setRows(body.rows);
        setRange({ startDate: body.startDate, endDate: body.endDate });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [type, dimension, days]);

  const selectClasses =
    "rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={selectClasses}>
          <option value="web">Web Search</option>
          <option value="discover">Discover</option>
          <option value="news">News</option>
        </select>
        <select value={dimension} onChange={(e) => setDimension(e.target.value)} className={selectClasses}>
          {type === "web" && <option value="query">By query</option>}
          <option value="page">By page</option>
          <option value="date">By date</option>
          <option value="country">By country</option>
          <option value="device">By device</option>
        </select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className={selectClasses}>
          <option value={7}>Last 7 days</option>
          <option value={28}>Last 28 days</option>
          <option value={90}>Last 90 days</option>
        </select>
        {loading && <Spinner className="text-muted" />}
      </div>

      {range && (
        <p className="text-xs text-muted">
          {range.startDate} → {range.endDate} · {siteUrl}
        </p>
      )}

      {error && <p className="text-sm text-fall">{error}</p>}

      {!error && rows && rows.length === 0 && (
        <p className="text-sm text-muted py-6">No data for this range/type — Search Console data can lag a day or two.</p>
      )}

      {!error && rows && rows.length > 0 && (
        <div className="min-w-[560px] overflow-x-auto">
          <div className="grid grid-cols-[1fr_90px_90px_70px_80px] gap-3 border-b border-line pb-2 text-xs text-muted">
            <span>{DIMENSION_LABEL[dimension] ?? dimension}</span>
            <span>Clicks</span>
            <span>Impressions</span>
            <span>CTR</span>
            <span>Avg. position</span>
          </div>
          <div className="divide-y divide-line">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_90px_90px_70px_80px] gap-3 py-2 text-sm">
                <span className="text-ink truncate" title={r.keys[0]}>
                  {r.keys[0]}
                </span>
                <span className="font-mono tabular-nums text-ink">{r.clicks.toLocaleString()}</span>
                <span className="font-mono tabular-nums text-muted">{r.impressions.toLocaleString()}</span>
                <span className="font-mono tabular-nums text-muted">{(r.ctr * 100).toFixed(1)}%</span>
                <span className="font-mono tabular-nums text-muted">{r.position.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
