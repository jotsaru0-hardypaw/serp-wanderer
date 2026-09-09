import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keyword = await prisma.keyword.findUnique({
    where: { id: params.id },
    include: { domain: true },
  });
  if (!keyword || keyword.domain.userId !== user.id) {
    return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
  }

  await prisma.keyword.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
