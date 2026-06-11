"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OnboardingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("nbf_onboarded");
      if (!seen) setShow(true);
    } catch {}
  }, []);

  function dismiss() {
    try { localStorage.setItem("nbf_onboarded", "1"); } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center px-4">
      <div className="w-full max-w-sm rounded-t-[2rem] border border-purple-500/30 bg-[#0f0d1a] p-6 sm:rounded-[2rem]">
        {/* Brand pill */}
        <div className="mb-4 inline-flex rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
          NoBSFlips
        </div>

        <h2 className="text-2xl font-black uppercase leading-tight text-white">
          G'day — welcome<br />
          <span className="text-purple-300">to the good stuff.</span>
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/60">
          No courses. No gurus. Just scan a barcode at the op shop and find out in seconds if it's worth flipping on eBay.
        </p>

        <div className="mt-5 space-y-2">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center">1</div>
            <p className="text-sm text-white/70">Hit <span className="font-black text-white">Scan</span> — point your camera at a barcode</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center">2</div>
            <p className="text-sm text-white/70">Enter what the shop's charging for it</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-purple-600 text-[10px] font-black text-white flex items-center justify-center">3</div>
            <p className="text-sm text-white/70">Get a straight <span className="font-black text-green-400">YES</span>, <span className="font-black text-yellow-400">MAYBE</span>, or <span className="font-black text-red-400">HELL NO</span></p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link href="/scan" onClick={dismiss}
            className="flex items-center justify-center rounded-2xl bg-purple-600 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_0_24px_rgba(147,51,234,0.35)] transition hover:bg-purple-500">
            Let's Go — Start Scanning
          </Link>
          <button onClick={dismiss}
            className="py-2.5 text-xs text-white/30 hover:text-white/50 transition">
            I'll look around first
          </button>
        </div>
      </div>
    </div>
  );
}
