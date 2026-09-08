import { NextRequest, NextResponse } from "next/server";
import { checkKeyword } from "@/lib/rank";

// A deep check (checking further than the top 10) pages through multiple
// Bright Data requests, which can take longer than the default timeout.
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const outcome = await checkKeyword(params.id);
  return NextResponse.json(outcome);
}
