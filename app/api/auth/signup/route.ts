import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const username = (body?.username as string | undefined)?.trim().toLowerCase();
  const password = body?.password as string | undefined;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }
  if (!/^[a-z0-9_.@+-]{3,64}$/.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-64 characters: letters, numbers, and _ . @ + -" },
      { status: 400 }
    );
  }
  if (password.length < 5) {
    return NextResponse.json({ error: "Password must be at least 5 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
  }

  // The very first account on a fresh deployment automatically inherits any
  // pre-existing domains/settings created before auth was added — so
  // upgrading an already-deployed single-user instance doesn't strand data.
  const isFirstUser = (await prisma.user.count()) === 0;

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { username, passwordHash } });

  if (isFirstUser) {
    await prisma.domain.updateMany({ where: { userId: null }, data: { userId: user.id } });
    await prisma.settings.updateMany({ where: { userId: null }, data: { userId: user.id } });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true }, { status: 201 });
}
