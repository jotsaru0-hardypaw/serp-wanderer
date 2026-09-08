import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const domains = await prisma.domain.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { keywords: true } } },
  });
  return NextResponse.json(domains);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = (body?.name as string | undefined)?.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

  if (!name) {
    return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
  }

  const existing = await prisma.domain.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "Domain already tracked" }, { status: 409 });
  }

  const domain = await prisma.domain.create({ data: { name } });
  return NextResponse.json(domain, { status: 201 });
}
