import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const siteUrl = body?.siteUrl as string | undefined;
  if (!siteUrl) return NextResponse.json({ error: "siteUrl is required" }, { status: 400 });

  await prisma.googleConnection.update({ where: { userId: user.id }, data: { siteUrl } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
