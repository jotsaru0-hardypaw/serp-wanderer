import { NextRequest, NextResponse } from "next/server";
import { checkAllKeywords } from "@/lib/rank";

// Allow this route to run long enough to check many keywords sequentially.
export const maxDuration = 300;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // Vercel automatically sends CRON_SECRET as this exact header on scheduled
  // invocations of routes listed in vercel.json — no extra setup needed.
  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;

  // Render (or curl, or any other scheduler) — pass ?secret=... instead,
  // since not every scheduler lets you set a custom header.
  const query = req.nextUrl.searchParams.get("secret");
  if (query === secret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const outcomes = await checkAllKeywords();
  return NextResponse.json({ checked: outcomes.length, outcomes });
}
