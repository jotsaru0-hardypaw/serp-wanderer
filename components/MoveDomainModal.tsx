"use client";

import { useEffect, useState } from "react";

type Domain = { id: string; name: string };

export default function MoveDomainModal({
  currentDomainId,
  onClose,
  onConfirm,
}: {
  currentDomainId: string;
  onClose: () => void;
  onConfirm: (targetDomainId: string) => void;
}) {
  const [domains, setDomains] = useState<Domain[] | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((list: Domain[]) => {
        const others = list.filter((d) => d.id !== currentDomainId);
        setDomains(others);
        if (others.length > 0) setSelected(others[0].id);
      })
      .catch(() => setDomains([]));
  }, [currentDomainId]);

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center pt-24 bg-ink/20" onClick={onClose}>
      <div
        className="w-80 rounded-md border border-line bg-surface shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-ink">Move to domain</h2>
          <button onClick={onClose} className="text-xs text-muted hover:text-ink">
            Close
          </button>
        </div>

        {domains == null && <p className="text-xs text-muted">Loading…</p>}
        {domains?.length === 0 && (
          <p className="text-xs text-muted">No other domains to move these to — add one first.</p>
        )}
        {domains && domains.length > 0 && (
          <>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => onConfirm(selected)}
              className="w-full rounded-md bg-ink text-white text-sm px-4 py-2 hover:bg-accent transition-colors"
            >
              Move
            </button>
          </>
        )}
      </div>
    </div>
  );
}
