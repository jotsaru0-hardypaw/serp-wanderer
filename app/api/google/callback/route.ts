import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { exchangeCodeForTokens, getRedirectUri, GoogleApiError } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get("google_oauth_state")?.value;
  const settingsUrl = new URL("/settings", req.url);

  if (!code || !state || !expectedState || state !== expectedState) {
    settingsUrl.searchParams.set("google_error", "Connection failed — please try again");
    return NextResponse.redirect(settingsUrl);
  }

  const conn = await prisma.googleConnection.findUnique({ where: { userId: user.id } });
  if (!conn?.clientId || !conn.clientSecret) {
    settingsUrl.searchParams.set("google_error", "Add your Client ID and Secret first");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, conn.clientId, conn.clientSecret, getRedirectUri(req));
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.googleConnection.update({
      where: { userId: user.id },
      data: {
        accessToken: tokens.access_token,
        // Google only returns a refresh_token on first consent (or when
        // prompt=consent forces it, which we always send) — keep the
        // existing one if this response somehow omits it.
        refreshToken: tokens.refresh_token || conn.refreshToken,
        tokenExpiry,
      },
    });
  } catch (err) {
    const message = err instanceof GoogleApiError ? err.message : "Connection failed";
    settingsUrl.searchParams.set("google_error", message);
    return NextResponse.redirect(settingsUrl);
  }

  const resp = NextResponse.redirect(new URL("/settings?google_connected=1", req.url));
  resp.cookies.delete("google_oauth_state");
  return resp;
}
