import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { buildAuthUrl, getRedirectUri } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const conn = await prisma.googleConnection.findUnique({ where: { userId: user.id } });
  if (!conn?.clientId) {
    const url = new URL("/settings", req.url);
    url.searchParams.set("google_error", "Add your Google Client ID first");
    return NextResponse.redirect(url);
  }

  // CSRF protection: a random state value round-tripped through Google,
  // verified against this cookie when the callback comes back.
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(conn.clientId, getRedirectUri(req), state);

  const resp = NextResponse.redirect(authUrl);
  resp.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return resp;
}
