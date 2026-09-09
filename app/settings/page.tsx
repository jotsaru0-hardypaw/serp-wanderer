import Link from "next/link";
import { redirect } from "next/navigation";
import { getSettings, maskSecret } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";
import BalanceDisplay from "@/components/BalanceDisplay";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const settings = await getSettings(user.id);

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

      <BalanceDisplay hasApiKey={!!settings.brightdataApiKey} />

      <SettingsForm
        currentKeyMasked={maskSecret(settings.brightdataApiKey)}
        currentZone={settings.brightdataZone ?? ""}
        currentCountry={settings.defaultCountry}
        currentLanguage={settings.defaultLanguage}
        currentLocation={settings.defaultLocation ?? ""}
        currentDepth={settings.maxCheckDepth}
      />
    </div>
  );
}
