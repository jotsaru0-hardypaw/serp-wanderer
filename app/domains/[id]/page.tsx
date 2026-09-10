import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import { tryGetQueryMetricsForUser } from "@/lib/google";
import AddKeywordTrigger from "@/components/AddKeywordTrigger";
import KeywordTable from "@/components/KeywordTable";
import RefreshButton from "@/components/RefreshButton";
import DiscoverKeywords from "@/components/DiscoverKeywords";

export const dynamic = "force-dynamic";

export default async function DomainPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [domain, settings, gscMetricsMap] = await Promise.all([
    prisma.domain.findUnique({
      where: { id: params.id },
      include: {
        keywords: {
          orderBy: { createdAt: "asc" },
          include: {
            checks: {
              orderBy: { checkedAt: "desc" },
              take: 30,
            },
          },
        },
      },
    }),
    getSettings(user.id),
    tryGetQueryMetricsForUser(user.id),
  ]);

  if (!domain || domain.userId !== user.id) notFound();

  const keywords = domain.keywords.map((k) => ({
    id: k.id,
    term: k.term,
    country: k.country,
    device: k.device,
    location: k.location,
    tags: k.tags,
    checks: k.checks.map((c) => ({
      checkedAt: c.checkedAt.toISOString(),
      position: c.position,
      url: c.url,
    })),
  }));

  // Server Components can't pass a Map across to Client Components — flatten
  // to a plain object.
  const gscMetrics = gscMetricsMap ? Object.fromEntries(gscMetricsMap) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink truncate">{domain.name}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton domainId={domain.id} />
          <AddKeywordTrigger
            domainId={domain.id}
            defaultCountry={settings.defaultCountry}
            defaultLanguage={settings.defaultLanguage}
            defaultLocation={settings.defaultLocation ?? ""}
          />
        </div>
      </div>

      <section className="overflow-x-auto">
        <KeywordTable
          keywords={keywords}
          maxCheckDepth={settings.maxCheckDepth}
          domainId={domain.id}
          gscMetrics={gscMetrics}
        />
      </section>

      {gscMetrics && (
        <section className="border-t border-line pt-6">
          <DiscoverKeywords domainId={domain.id} />
        </section>
      )}
    </div>
  );
}
