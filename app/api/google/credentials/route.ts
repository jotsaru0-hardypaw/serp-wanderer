import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Saves the user's own Google OAuth client ID/secret (from their own Google
// Cloud project) — the "Connect" step is separate, this just stores what's
// needed to start it.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const clientId = (body?.clientId as string | undefined)?.trim();
  const clientSecret = (body?.clientSecret as string | undefined)?.trim();

  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  const existing = await prisma.googleConnection.findUnique({ where: { userId: user.id } });

  await prisma.googleConnection.upsert({
    where: { userId: user.id },
    create: { userId: user.id, clientId, clientSecret: clientSecret || null },
    update: {
      clientId,
      // Blank secret on an update means "leave unchanged" — same pattern as the Bright Data key field.
      clientSecret: clientSecret ? clientSecret : existing?.clientSecret,
    },
  });

  return NextResponse.json({ ok: true });
}
