import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import AddDomainForm from "@/components/AddDomainForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [domains, settings] = await Promise.all([
    prisma.domain.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        keywords: {
          select: {
            checks: {
              orderBy: { checkedAt: "desc" },
              take: 2,
              select: { position: true },
            },
          },
        },
      },
    }),
    getSettings(),
  ]);

  const needsSetup = !settings.brightdataApiKey || !settings.brightdataZone;

  const summaries = domains.map((d) => {
    let improved = 0;
    let declined = 0;
    for (const kw of d.keywords) {
      const [latest, prev] = kw.checks;
      if (latest?.position != null && prev?.position != null && latest.position !== prev.position) {
        if (latest.position < prev.position) improved++;
        else declined++;
      }
    }
    return { id: d.id, name: d.name, count: d.keywords.length, improved, declined };
  });

  return (
    <div className="space-y-10">
      {needsSetup && (
        <div className="rounded-md border border-line bg-surface px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-ink">
            Add your Bright Data API key and zone before adding keywords — checks won't run without them.
          </p>
          <Link href="/settings" className="text-sm text-accent whitespace-nowrap ml-4">
            Go to Settings
          </Link>
        </div>
      )}

      <section>
        <h1 className="text-xl font-semibold text-ink mb-1">Domains</h1>
        <p className="text-sm text-muted mb-5">
          Positions update on the daily schedule, or refresh a domain any time.
        </p>
        <AddDomainForm />
      </section>

      <section>
        {summaries.length === 0 ? (
          <p className="text-sm text-muted">No domains yet — add one above.</p>
        ) : (
          <div className="divide-y divide-line border-t border-line">
            {summaries.map((d) => (
              <Link
                key={d.id}
                href={`/domains/${d.id}`}
                className="flex items-center justify-between py-4 group focus-visible:outline-none"
              >
                <div>
                  <div className="text-sm font-medium text-ink group-hover:text-accent">{d.name}</div>
                  <div className="text-xs text-muted">
                    {d.count} keyword{d.count === 1 ? "" : "s"} tracked
                  </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                  {d.improved > 0 && <span className="text-rise">▲{d.improved}</span>}
                  {d.declined > 0 && <span className="text-fall">▼{d.declined}</span>}
                  {d.improved === 0 && d.declined === 0 && (
                    <span className="text-muted">no change</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
