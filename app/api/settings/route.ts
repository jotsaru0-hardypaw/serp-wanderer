import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, maskSecret } from "@/lib/settings";

// Never statically prerendered — this route always reads/writes live
// database state, and some deployments run before the schema migration
// that adds newer columns has been applied, which would otherwise break
// the production build.
export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    brightdataApiKeyMasked: maskSecret(settings.brightdataApiKey),
    brightdataZone: settings.brightdataZone, // zone names aren't secret, safe to show in full
    defaultCountry: settings.defaultCountry,
    defaultLanguage: settings.defaultLanguage,
    defaultLocation: settings.defaultLocation,
    maxCheckDepth: settings.maxCheckDepth,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  await updateSettings({
    brightdataApiKey: (body.brightdataApiKey as string | undefined)?.trim(),
    brightdataZone: (body.brightdataZone as string | undefined)?.trim(),
    defaultCountry: (body.defaultCountry as string | undefined)?.trim().toLowerCase(),
    defaultLanguage: (body.defaultLanguage as string | undefined)?.trim().toLowerCase(),
    defaultLocation: (body.defaultLocation as string | undefined)?.trim(),
    maxCheckDepth: Number(body.maxCheckDepth) || undefined,
  });

  return NextResponse.json({ ok: true });
}
