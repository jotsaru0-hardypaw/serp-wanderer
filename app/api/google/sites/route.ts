import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getValidAccessToken, listSites, GoogleApiError } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const accessToken = await getValidAccessToken(user.id);
    const sites = await listSites(accessToken);
    return NextResponse.json({ sites });
  } catch (err) {
    const message = err instanceof GoogleApiError ? err.message : "Couldn't reach Google";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
