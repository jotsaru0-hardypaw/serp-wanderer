import { NextRequest, NextResponse } from "next/server";
import { checkKeyword } from "@/lib/rank";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

// A deep check (checking further than the top 10) pages through multiple
// Bright Data requests, which can take longer than the default timeout.
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const outcome = await checkKeyword(params.id);
  return NextResponse.json(outcome);
}
