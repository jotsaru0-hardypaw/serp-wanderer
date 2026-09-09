import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Clears tokens and the selected property, but keeps the saved Client
// ID/Secret so reconnecting doesn't require re-entering them.
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.googleConnection
    .update({
      where: { userId: user.id },
      data: { accessToken: null, refreshToken: null, tokenExpiry: null, siteUrl: null },
    })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
