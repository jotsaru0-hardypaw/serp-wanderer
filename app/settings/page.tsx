import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings, maskSecret } from "@/lib/settings";
import { getSessionUser } from "@/lib/auth";
import SettingsForm from "@/components/SettingsForm";
import BalanceDisplay from "@/components/BalanceDisplay";
import GoogleConnectionForm from "@/components/GoogleConnectionForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { google_error?: string; google_connected?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [settings, googleConn] = await Promise.all([
    getSettings(user.id),
    prisma.googleConnection.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="space-y-10 max-w-lg">
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

      <section className="space-y-4">
        <BalanceDisplay hasApiKey={!!settings.brightdataApiKey} />

        <SettingsForm
          currentKeyMasked={maskSecret(settings.brightdataApiKey)}
          currentZone={settings.brightdataZone ?? ""}
          currentCountry={settings.defaultCountry}
          currentLanguage={settings.defaultLanguage}
          currentLocation={settings.defaultLocation ?? ""}
          currentDepth={settings.maxCheckDepth}
        />
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <div>
          <h2 className="text-lg font-semibold text-ink">Search Console</h2>
          <p className="text-sm text-muted mt-1">
            Connect Google Search Console for clicks, impressions, and Discover performance —
            separate from Bright Data's rank checks.
          </p>
        </div>

        {searchParams.google_error && (
          <p className="text-xs text-fall">{decodeURIComponent(searchParams.google_error)}</p>
        )}
        {searchParams.google_connected && <p className="text-xs text-rise">Connected to Google.</p>}

        <GoogleConnectionForm
          hasClientId={!!googleConn?.clientId}
          isConnected={!!googleConn?.accessToken}
          selectedSite={googleConn?.siteUrl ?? null}
        />
      </section>
    </div>
  );
}
