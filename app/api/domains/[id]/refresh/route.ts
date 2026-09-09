import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeyword } from "@/lib/rank";
import { getSessionUser } from "@/lib/auth";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

export const maxDuration = 300;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const domain = await prisma.domain.findUnique({ where: { id: params.id } });
  if (!domain || domain.userId !== user.id) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  const keywords = await prisma.keyword.findMany({
    where: { domainId: params.id },
    select: { id: true },
  });

  const outcomes = [];
  for (const { id } of keywords) {
    outcomes.push(await checkKeyword(id));
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({ checked: outcomes.length, outcomes });
}
