import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeyword } from "@/lib/rank";

// Checking several selected keywords, each potentially paging deep into
// Google's results, can take a while — give it real room.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids = body?.ids as string[] | undefined;
  const action = body?.action as "check" | "remove" | undefined;

  if (!ids?.length || !action) {
    return NextResponse.json({ error: "ids and action are required" }, { status: 400 });
  }

  if (action === "remove") {
    const result = await prisma.keyword.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ removed: result.count });
  }

  if (action === "check") {
    const outcomes = [];
    for (const id of ids) {
      outcomes.push(await checkKeyword(id));
      await new Promise((r) => setTimeout(r, 250));
    }
    return NextResponse.json({ checked: outcomes.length, outcomes });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
