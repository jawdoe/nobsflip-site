import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SiteNav from "./SiteNav";

const BRAND_NAME = "NoBSFlips";
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
          <header className="sticky top-0 z-50 hidden border-b border-white/10 bg-black/80 backdrop-blur-xl md:block">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 md:px-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-xs font-black tracking-[0.2em]">
                  NB
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-black uppercase tracking-[0.18em]">
                    NoBS<span className="text-[#39FF14]">Flips</span>
                  </p>

                  <p className="hidden text-[10px] uppercase tracking-[0.18em] text-white/45 sm:block">
                    {BRAND_TAGLINE}
                  </p>
                </div>
              </Link>

              <SiteNav />
            </div>
          </header>

          <main className="relative z-10 flex-1">{children}</main>

          <footer className="hidden border-t border-white/10 bg-black md:block">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em]">
                  NoBS<span className="text-[#39FF14]">Flips</span>
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Real flips. Real numbers. No BS.
                </p>
              </div>

              <div className="flex gap-6 text-sm font-semibold text-white/60">
                <Link href="/" className="transition hover:text-[#39FF14]">
                  Home
                </Link>

                <Link href="/fliplog" className="transition hover:text-[#39FF14]">
                  Flip Log
                </Link>

                <Link href="/media" className="transition hover:text-[#39FF14]">
                  Videos
                </Link>

                <Link href="/about" className="transition hover:text-[#39FF14]">
                  About
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}