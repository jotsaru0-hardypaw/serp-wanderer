import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import AddKeywordForm from "@/components/AddKeywordForm";
import KeywordTable from "@/components/KeywordTable";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function DomainPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [domain, settings] = await Promise.all([
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-muted hover:text-accent">
            ← All domains
          </Link>
          <h1 className="text-xl font-semibold text-ink">{domain.name}</h1>
        </div>
        <RefreshButton domainId={domain.id} />
      </div>

      <section>
        <AddKeywordForm
          domainId={domain.id}
          defaultCountry={settings.defaultCountry}
          defaultLanguage={settings.defaultLanguage}
          defaultLocation={settings.defaultLocation ?? ""}
        />
      </section>

      <section className="overflow-x-auto">
        <KeywordTable keywords={keywords} maxCheckDepth={settings.maxCheckDepth} domainId={domain.id} />
      </section>
    </div>
  );
}
