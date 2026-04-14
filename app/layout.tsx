import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOBSFLIP",
  description: "Trial & Error Flipping Log",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <header className="border-b border-gray-200">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <h1 className="font-bold tracking-wide">NOBSFLIP</h1>

            <nav className="flex gap-6 text-sm">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <Link href="/fliplog" className="hover:underline">
                Flip Log
              </Link>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}