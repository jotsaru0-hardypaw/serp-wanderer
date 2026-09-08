import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings, maskSecret } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    brightdataApiKeyMasked: maskSecret(settings.brightdataApiKey),
    brightdataZone: settings.brightdataZone, // zone names aren't secret, safe to show in full
    defaultCountry: settings.defaultCountry,
    defaultLanguage: settings.defaultLanguage,
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
  });

  return NextResponse.json({ ok: true });
}
