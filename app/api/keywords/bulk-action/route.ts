import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkKeyword } from "@/lib/rank";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

// Checking several selected keywords, each potentially paging deep into
// Google's results, can take a while — give it real room.
export const maxDuration = 300;

type Action =
  | "check"
  | "remove"
  | "duplicate"
  | "duplicate-flip-device"
  | "add-tags"
  | "remove-tags"
  | "set-device"
  | "move-domain";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const ids = body?.ids as string[] | undefined;
  const action = body?.action as Action | undefined;

  if (!ids?.length || !action) {
    return NextResponse.json({ error: "ids and action are required" }, { status: 400 });
  }

  switch (action) {
    case "remove": {
      const result = await prisma.keyword.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ removed: result.count });
    }

    case "check": {
      const outcomes = [];
      for (const id of ids) {
        outcomes.push(await checkKeyword(id));
        await new Promise((r) => setTimeout(r, 250));
      }
      return NextResponse.json({ checked: outcomes.length, outcomes });
    }

    case "duplicate":
    case "duplicate-flip-device": {
      const keywords = await prisma.keyword.findMany({ where: { id: { in: ids } } });
      const created = await prisma.keyword.createMany({
        data: keywords.map((k) => ({
          domainId: k.domainId,
          term: k.term,
          country: k.country,
          language: k.language,
          device:
            action === "duplicate-flip-device" ? (k.device === "mobile" ? "desktop" : "mobile") : k.device,
          location: k.location,
          tags: k.tags,
        })),
      });
      return NextResponse.json({ duplicated: created.count });
    }

    case "add-tags": {
      const tags = (body?.tags as string[] | undefined)?.map((t) => t.trim()).filter(Boolean) ?? [];
      if (tags.length === 0) return NextResponse.json({ error: "tags are required" }, { status: 400 });

      const keywords = await prisma.keyword.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } });
      await prisma.$transaction(
        keywords.map((k) =>
          prisma.keyword.update({
            where: { id: k.id },
            data: { tags: Array.from(new Set([...k.tags, ...tags])) },
          })
        )
      );
      return NextResponse.json({ updated: keywords.length });
    }

    case "remove-tags": {
      const tags = (body?.tags as string[] | undefined)?.map((t) => t.trim()).filter(Boolean) ?? [];
      if (tags.length === 0) return NextResponse.json({ error: "tags are required" }, { status: 400 });

      const keywords = await prisma.keyword.findMany({ where: { id: { in: ids } }, select: { id: true, tags: true } });
      await prisma.$transaction(
        keywords.map((k) =>
          prisma.keyword.update({
            where: { id: k.id },
            data: { tags: k.tags.filter((t) => !tags.includes(t)) },
          })
        )
      );
      return NextResponse.json({ updated: keywords.length });
    }

    case "set-device": {
      const device = body?.device === "mobile" ? "mobile" : "desktop";
      const result = await prisma.keyword.updateMany({ where: { id: { in: ids } }, data: { device } });
      return NextResponse.json({ updated: result.count });
    }

    case "move-domain": {
      const targetDomainId = body?.targetDomainId as string | undefined;
      if (!targetDomainId) return NextResponse.json({ error: "targetDomainId is required" }, { status: 400 });

      const target = await prisma.domain.findUnique({ where: { id: targetDomainId } });
      if (!target) return NextResponse.json({ error: "Target domain not found" }, { status: 404 });

      const result = await prisma.keyword.updateMany({ where: { id: { in: ids } }, data: { domainId: targetDomainId } });
      return NextResponse.json({ moved: result.count });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
