import { prisma } from "./db";

const SETTINGS_ID = "singleton";

export type ResolvedSettings = {
  brightdataApiKey: string | null;
  brightdataZone: string | null;
  defaultCountry: string;
  defaultLanguage: string;
};

/**
 * Read settings entered in the UI. If a value hasn't been filled in there,
 * fall back to the matching environment variable — so a deployment can
 * still be configured entirely through env vars if that's preferred.
 */
export async function getSettings(): Promise<ResolvedSettings> {
  const row = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });

  return {
    brightdataApiKey: row?.brightdataApiKey || process.env.BRIGHTDATA_API_KEY || null,
    brightdataZone: row?.brightdataZone || process.env.BRIGHTDATA_SERP_ZONE || null,
    defaultCountry: row?.defaultCountry || "us",
    defaultLanguage: row?.defaultLanguage || "en",
  };
}

/**
 * Update settings. Blank/omitted fields for the secret values are treated as
 * "leave unchanged" so the form never needs to round-trip the real key back
 * to the browser just to preserve it.
 */
export async function updateSettings(input: {
  brightdataApiKey?: string;
  brightdataZone?: string;
  defaultCountry?: string;
  defaultLanguage?: string;
}) {
  const existing = await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });

  return prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      brightdataApiKey: input.brightdataApiKey || null,
      brightdataZone: input.brightdataZone || null,
      defaultCountry: input.defaultCountry || "us",
      defaultLanguage: input.defaultLanguage || "en",
    },
    update: {
      brightdataApiKey: input.brightdataApiKey ? input.brightdataApiKey : existing?.brightdataApiKey,
      brightdataZone: input.brightdataZone ? input.brightdataZone : existing?.brightdataZone,
      defaultCountry: input.defaultCountry || existing?.defaultCountry || "us",
      defaultLanguage: input.defaultLanguage || existing?.defaultLanguage || "en",
    },
  });
}

/** "brd_a1b2c3..." -> "••••••c3d4" — enough to confirm which key is saved without exposing it. */
export function maskSecret(value: string | null): string | null {
  if (!value) return null;
  if (value.length <= 4) return "•".repeat(value.length);
  return "••••" + value.slice(-4);
}
