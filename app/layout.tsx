import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import SiteNav from "./SiteNav";
import MobileBottomNav from "./MobileBottomNav";
import HeaderAvatar from "./HeaderAvatar";
import PWA from "./PWA";
import SocialLinks from "./SocialLinks";

const BRAND_NAME = "NOBSFLIPS";
const BRAND_TAGLINE = "No Bullshit. Just Flips.";

export const metadata: Metadata = {
  title: "NoBSFlips — eBay Flip Scanner",
  description: "Scan barcodes at the op shop and instantly know if it's worth flipping on eBay.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NoBSFlips",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  openGraph: {
    title: "NoBSFlips — eBay Flip Scanner",
    description: "Scan barcodes at the op shop and instantly know if it's worth flipping on eBay.",
    url: "https://nobsflipin.com",
    siteName: "NoBSFlips",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "NoBSFlips — Scan It. Know Instantly." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoBSFlips — eBay Flip Scanner",
    description: "Scan barcodes at the op shop and instantly know if it's worth flipping on eBay.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d0b16] text-white antialiased">
        <Script id="disable-scroll-restore" strategy="beforeInteractive">
          {`if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }`}
        </Script>

        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          <header className="sticky top-0 z-50 border-b border-purple-500/15 bg-black/85 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-6">
              <Link href="/" className="group">
                <div className="text-lg font-black tracking-[0.32em] text-white">{BRAND_NAME}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300/80">{BRAND_TAGLINE}</div>
              </Link>
              <SiteNav />
              <HeaderAvatar />
            </div>
          </header>

          {/* Extra bottom padding on mobile so content isn't hidden behind bottom nav */}
          <main className="flex-1 pb-20 md:pb-0">{children}</main>

          <footer className="border-t border-purple-500/15 bg-black/70">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-6 pb-28 pt-8 text-sm text-zinc-400 md:flex-row md:justify-between md:pb-8">
              <div className="text-center md:text-left">
                <div className="font-black tracking-[0.28em] text-white">{BRAND_NAME}</div>
                <div className="mt-1">{BRAND_TAGLINE}</div>
              </div>
              <SocialLinks />
            </div>
          </footer>

          <MobileBottomNav />
          <PWA />
        </div>
      </body>
    </html>
  );
}
