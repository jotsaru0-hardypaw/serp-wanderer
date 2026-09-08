import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeyword } from "@/lib/rank";

export const maxDuration = 300;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const keywords = await prisma.keyword.findMany({
    where: { domainId: params.id },
    select: { id: true },
  });

  const outcomes = [];
  for (const { id } of keywords) {
    outcomes.push(await checkKeyword(id));
    await new Promise((r) => setTimeout(r, 200));
  }

  return NextResponse.json({ checked: outcomes.length, outcomes });
}
