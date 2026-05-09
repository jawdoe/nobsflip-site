import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import SiteNav from "./SiteNav";

export const metadata: Metadata = {
  title: "NOBSFLIPS",
  description: "No Bullshit. Just Flips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070a] text-white antialiased">
        <div className="relative min-h-screen overflow-hidden">
          {/* HEADER */}
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
              {/* LOGO */}
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xs font-black tracking-[0.2em] text-white">
                  NB
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-black uppercase tracking-[0.28em] text-white">
                    NOBS
                    <span className="ml-1 text-[#8cff00]">FLIPS</span>
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                    No Bullshit. Just Flips.
                  </p>
                </div>
              </Link>

              {/* NAV */}
              <SiteNav />
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="relative z-10">{children}</div>

          {/* FOOTER */}
          <footer className="border-t border-white/10 bg-black">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-white">
                  NOBS<span className="text-[#8cff00]">FLIPS</span>
                </p>

                <p className="mt-2 text-sm text-white/50">
                  Real flips. Real numbers. No BS.
                </p>
              </div>

              <div className="flex flex-wrap gap-6 text-sm font-semibold text-white/60">
                <Link href="/" className="transition hover:text-[#8cff00]">
                  Home
                </Link>

                <Link
                  href="/fliplog"
                  className="transition hover:text-[#8cff00]"
                >
                  Flip Log
                </Link>

                <Link
                  href="/media"
                  className="transition hover:text-[#8cff00]"
                >
                  Videos
                </Link>

                <Link
                  href="/about"
                  className="transition hover:text-[#8cff00]"
                >
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