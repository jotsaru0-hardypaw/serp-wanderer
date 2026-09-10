"use client";

import { usePathname } from "next/navigation";
import AddDomainInline from "./AddDomainInline";

export type DomainSummary = { id: string; name: string; count: number; improved: number; declined: number };

export default function Sidebar({ domains }: { domains: DomainSummary[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-line min-h-[calc(100vh-49px)]">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs text-muted">Domains</div>
        <nav className="space-y-0.5">
          {domains.map((d) => {
            const active = pathname === `/domains/${d.id}`;
            return (
              <a
                key={d.id}
                href={`/domains/${d.id}`}
                className={`flex items-center justify-between px-4 py-2 text-sm ${
                  active ? "bg-line/60 text-ink font-medium" : "text-ink hover:bg-line/30"
                }`}
              >
                <span className="truncate">{d.name}</span>
                <span className="flex items-center gap-1.5 shrink-0 ml-2 font-mono text-[11px] tabular-nums">
                  {d.improved > 0 && <span className="text-rise">▲{d.improved}</span>}
                  {d.declined > 0 && <span className="text-fall">▼{d.declined}</span>}
                </span>
              </a>
            );
          })}
          {domains.length === 0 && (
            <p className="px-4 text-xs text-muted">No domains yet.</p>
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-line">
        <AddDomainInline />
      </div>
    </aside>
  );
}
