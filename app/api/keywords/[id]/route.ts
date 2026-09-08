import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.keyword.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
