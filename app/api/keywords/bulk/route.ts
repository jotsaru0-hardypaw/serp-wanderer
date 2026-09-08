import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Bulk-added keywords are NOT checked immediately (unlike single add) —
// checking dozens of keywords synchronously risks hitting function
// timeouts, especially with a deep check-depth configured. They'll pick up
// a position on the next "Refresh now" or scheduled cron run.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domainId = body?.domainId as string | undefined;
  const rawTerms = body?.terms as string | undefined;
  const country = ((body?.country as string | undefined) || "us").toLowerCase();
  const language = ((body?.language as string | undefined) || "en").toLowerCase();
  const device = (body?.device as string | undefined) === "mobile" ? "mobile" : "desktop";
  const tags = (body?.tags as string[] | undefined)?.map((t) => t.trim()).filter(Boolean) ?? [];

  if (!domainId || !rawTerms?.trim()) {
    return NextResponse.json({ error: "domainId and at least one keyword are required" }, { status: 400 });
  }

  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  // One keyword per line; blank lines ignored.
  const terms = rawTerms
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return NextResponse.json({ error: "No valid keywords found" }, { status: 400 });
  }

  const result = await prisma.keyword.createMany({
    data: terms.map((term) => ({ domainId, term, country, language, device, tags })),
  });

  return NextResponse.json({ created: result.count }, { status: 201 });
}
