import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeyword } from "@/lib/rank";

// A deep check (checking further than the top 10) pages through multiple
// Bright Data requests, which can take longer than the default timeout.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const domainId = body?.domainId as string | undefined;
  const term = (body?.term as string | undefined)?.trim();
  const country = ((body?.country as string | undefined) || "us").toLowerCase();
  const language = ((body?.language as string | undefined) || "en").toLowerCase();
  const device = (body?.device as string | undefined) === "mobile" ? "mobile" : "desktop";
  const tags = (body?.tags as string[] | undefined)?.map((t) => t.trim()).filter(Boolean) ?? [];

  if (!domainId || !term) {
    return NextResponse.json({ error: "domainId and term are required" }, { status: 400 });
  }

  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  const keyword = await prisma.keyword.create({
    data: { domainId, term, country, language, device, tags },
  });

  // Check it immediately so the UI doesn't show an empty row until the next cron run.
  const outcome = await checkKeyword(keyword.id);

  return NextResponse.json({ keyword, outcome }, { status: 201 });
}
