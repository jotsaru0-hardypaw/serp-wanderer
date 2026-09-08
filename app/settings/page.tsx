import Link from "next/link";
import { getSettings, maskSecret } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link href="/" className="text-xs text-muted hover:text-accent">
          ← All domains
        </Link>
        <h1 className="text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Your Bright Data credentials and default search location. Stored in the database —
          nothing to configure in env vars for day-to-day use.
        </p>
      </div>

      <SettingsForm
        currentKeyMasked={maskSecret(settings.brightdataApiKey)}
        currentZone={settings.brightdataZone ?? ""}
        currentCountry={settings.defaultCountry}
        currentLanguage={settings.defaultLanguage}
      />
    </div>
  );
}
