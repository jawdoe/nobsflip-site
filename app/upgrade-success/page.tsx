"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UpgradeSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(t); router.push("/scan"); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0b16] text-white px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.2),transparent_50%)]" />
      </div>
      <div className="relative w-full max-w-sm text-center">
        <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
          NoBSFlips / Premium
        </div>

        <h1 className="mt-4 text-4xl font-black uppercase tracking-tight">
          Ripper.<br />
          <span className="text-purple-300">You&apos;re on Premium.</span>
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/50">
          Real sold prices, full price ranges, the whole bloody lot. No more guessing — just facts.
        </p>

        <div className="mt-6 rounded-[2rem] border border-purple-500/20 bg-purple-500/[0.07] p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-black">✓</span>
            <span className="text-sm text-white/80">Real eBay sold prices — what punters actually paid</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-black">✓</span>
            <span className="text-sm text-white/80">Price range on every scan — low, median, high</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-black">✓</span>
            <span className="text-sm text-white/80">Flip analytics — ROI, trends, best categories</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link href="/scan"
            className="flex items-center justify-center rounded-2xl bg-purple-600 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(147,51,234,0.4)] transition hover:bg-purple-500">
            Let&apos;s Scan Something
          </Link>
          <Link href="/dashboard"
            className="py-2.5 text-xs text-white/30 hover:text-white/50 transition">
            View my flips
          </Link>
        </div>

        <p className="mt-4 text-xs text-white/20">Sending ya to the scanner in {countdown}s...</p>
      </div>
    </main>
  );
}
