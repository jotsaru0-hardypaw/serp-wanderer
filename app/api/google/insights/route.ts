import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getValidAccessToken, querySearchAnalytics, GoogleApiError } from "@/lib/google";

export const dynamic = "force-dynamic";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conn = await prisma.googleConnection.findUnique({ where: { userId: user.id } });
  if (!conn?.siteUrl) {
    return NextResponse.json({ error: "No Search Console property selected yet" }, { status: 400 });
  }

  const url = req.nextUrl;
  const type = (url.searchParams.get("type") || "web") as
    | "web"
    | "discover"
    | "news"
    | "googleNews"
    | "image"
    | "video";
  const dimension = url.searchParams.get("dimension") || "query";
  const days = Number(url.searchParams.get("days") || 28);

  // Google's Discover and News reports don't support the "query" dimension —
  // catching this here gives a clearer message than Google's raw API error.
  if ((type === "discover" || type === "news" || type === "googleNews") && dimension === "query") {
    return NextResponse.json(
      { error: `Google doesn't provide per-query data for ${type} — try grouping by page or date instead.` },
      { status: 400 }
    );
  }

  const end = new Date();
  end.setDate(end.getDate() - 2); // Search Console data typically lags 1-2 days
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  try {
    const accessToken = await getValidAccessToken(user.id);
    const rows = await querySearchAnalytics({
      accessToken,
      siteUrl: conn.siteUrl,
      startDate: isoDate(start),
      endDate: isoDate(end),
      dimensions: [dimension],
      type,
      rowLimit: 25,
    });
    return NextResponse.json({ rows, siteUrl: conn.siteUrl, startDate: isoDate(start), endDate: isoDate(end) });
  } catch (err) {
    const message = err instanceof GoogleApiError ? err.message : "Couldn't reach Google";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
