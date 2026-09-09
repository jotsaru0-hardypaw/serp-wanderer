"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime, formatFullLocal } from "@/lib/relative-time";

// Keeps "5m ago" honest while the tab stays open, instead of freezing at
// whatever it said when the page last loaded.
export default function RelativeTime({ iso, className }: { iso: string; className?: string }) {
  const [label, setLabel] = useState(() => formatRelativeTime(iso));

  useEffect(() => {
    setLabel(formatRelativeTime(iso));
    const id = setInterval(() => setLabel(formatRelativeTime(iso)), 30_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <span className={className} title={formatFullLocal(iso)}>
      {label}
    </span>
  );
}
