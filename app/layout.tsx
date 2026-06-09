import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SiteNav from "./SiteNav";

const BRAND_NAME = "NOBSFLIPS";
const BRAND_TAGLINE = "No Bullshit. Just Flips.";

export const metadata: Metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070a] text-white antialiased">
        <Script id="disable-scroll-restore" strategy="beforeInteractive">
          {`
            if ('scrollRestoration' in history) {
              history.scrollRestoration = 'manual';
            }
          `}
        </Script>

        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <header className="sticky top-0 z-50 hidden border-b border-purple-500/15 bg-black/85 backdrop-blur-xl md:block">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
              <Link href="/" className="group">
                <div className="text-lg font-black tracking-[0.32em] text-white">
                  {BRAND_NAME}
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300/80">
                  {BRAND_TAGLINE}
                </div>
              </Link>

              <SiteNav />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-purple-500/15 bg-black/70">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-black tracking-[0.28em] text-white">
                  {BRAND_NAME}
                </div>
                <div className="mt-1">{BRAND_TAGLINE}</div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}