import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const domain = await prisma.domain.findUnique({
    where: { id: params.id },
    include: {
      keywords: {
        orderBy: { createdAt: "asc" },
        include: {
          checks: {
            orderBy: { checkedAt: "desc" },
            take: 30, // enough for a simple trend line
          },
        },
      },
    },
  });

  if (!domain) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }
  return NextResponse.json(domain);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.domain.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
