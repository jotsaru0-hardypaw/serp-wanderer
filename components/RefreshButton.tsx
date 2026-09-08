"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton({ domainId }: { domainId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function refresh() {
    setLoading(true);
    await fetch(`/api/domains/${domainId}/refresh`, { method: "POST" }).catch(() => null);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={refresh}
      disabled={loading}
      className="rounded-md border border-line bg-surface text-sm px-3 py-1.5 text-ink hover:border-accent hover:text-accent transition-colors motion-reduce:transition-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      {loading ? "Checking all keywords…" : "Refresh now"}
    </button>
  );
}
