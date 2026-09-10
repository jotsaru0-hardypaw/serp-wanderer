"use client";

import { usePathname, useRouter } from "next/navigation";
import type { DomainSummary } from "./Sidebar";

// Mobile-only stand-in for the sidebar — a plain native select rather than a
// hand-rolled dropdown, since it's free accessibility and touch handling.
export default function MobileDomainSwitcher({ domains }: { domains: DomainSummary[] }) {
  const pathname = usePathname();
  const router = useRouter();

  const currentId = pathname.startsWith("/domains/") ? pathname.split("/")[2] : "";

  if (domains.length === 0) return null;

  return (
    <div className="md:hidden border-b border-line px-4 py-2.5">
      <select
        value={currentId}
        onChange={(e) => {
          if (e.target.value) router.push(`/domains/${e.target.value}`);
          else router.push("/");
        }}
        className="w-full rounded-md border border-line bg-surface px-2 py-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <option value="">All domains</option>
        {domains.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} ({d.count})
          </option>
        ))}
      </select>
    </div>
  );
}
