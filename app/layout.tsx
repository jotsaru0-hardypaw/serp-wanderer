import type { Metadata } from "next";
import { Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { APP_VERSION, LAST_UPDATED } from "@/lib/version";
import { getSessionUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SERP Wanderer",
  description: "Keyword rank tracking powered by Bright Data's SERP API",
};

const lastUpdatedFormatted = new Date(LAST_UPDATED).toLocaleDateString(undefined, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className={`${publicSans.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <header className="border-b border-line">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-semibold tracking-tight text-ink">SERP Wanderer</span>
              <span
                className="text-xs text-muted cursor-default"
                title={`Last updated ${lastUpdatedFormatted}`}
              >
                · {APP_VERSION}
              </span>
            </a>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">{user.username}</span>
                <a href="/settings" className="text-sm text-muted hover:text-accent">
                  Settings
                </a>
                <LogoutButton />
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
