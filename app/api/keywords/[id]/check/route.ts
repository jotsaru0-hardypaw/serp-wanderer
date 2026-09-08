import { NextRequest, NextResponse } from "next/server";
import { checkKeyword } from "@/lib/rank";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const outcome = await checkKeyword(params.id);
  return NextResponse.json(outcome);
}
