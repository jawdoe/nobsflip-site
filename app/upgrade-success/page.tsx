"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UpgradeSuccessPage() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0b16] text-white px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),transparent_50%)]" />
      </div>
      <div className="relative text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-4xl font-black uppercase tracking-tight">You&apos;re Premium!</h1>
        <p className="mt-3 text-white/50">Your account is being upgraded{dots}</p>
        <p className="mt-1 text-sm text-white/30">This only takes a few seconds.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/scan" className="rounded-2xl bg-purple-600 px-8 py-3 font-black uppercase tracking-[0.08em] text-white shadow-[0_0_24px_rgba(147,51,234,0.4)] transition hover:bg-purple-500">
            Start Scanning
          </Link>
          <Link href="/dashboard" className="rounded-2xl border border-white/10 px-8 py-3 font-black uppercase tracking-[0.08em] text-white/60 transition hover:text-white">
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
