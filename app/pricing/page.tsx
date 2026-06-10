"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const FREE_FEATURES = [
  "Barcode scanner with eBay comps",
  "Manual flip tracking (buy / list / sell)",
  "Profit & ROI dashboard",
  "Country-aware eBay fee rates",
  "Postage cost calculator",
  "Scan history",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Real sold prices — what items actually sold for",
  "Price range on scan (low / median / high)",
  "Connect your eBay account",
  "Auto-mark flips as sold when they sell on eBay",
  "Flip analytics — best categories, avg ROI, trends",
];

export default function PricingPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("is_premium").eq("id", user.id).single();
      setIsPremium(data?.is_premium ?? false);
      setLoading(false);
    });
  }, []);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const res = await fetch("/api/lemonsqueezy/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, email: user.email }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Something went wrong. Please try again.");
    } catch { alert("Something went wrong. Please try again."); }
    finally { setCheckoutLoading(false); }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 text-center">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">NoBSFlips / Pricing</div>
          <h1 className="mt-4 text-4xl font-black uppercase tracking-tight md:text-5xl">Simple Pricing</h1>
          <p className="mt-3 text-white/50">Start free. Upgrade when the flips pay for it.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Free</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black">$0</span>
              <span className="mb-1.5 text-white/40">/month</span>
            </div>
            <p className="mt-2 text-sm text-white/40">Everything you need to get started flipping.</p>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <span className="mt-0.5 text-white/30">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/scan" className="mt-8 block w-full rounded-2xl border border-white/10 py-3 text-center text-sm font-black uppercase tracking-[0.08em] text-white/50 transition hover:text-white">
              Start Scanning Free
            </Link>
          </div>

          {/* Premium */}
          <div className="relative rounded-[2rem] border border-purple-500/40 bg-purple-500/10 p-8 shadow-[0_0_60px_rgba(147,51,234,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full border border-purple-400/40 bg-purple-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">Best Value</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">Premium</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-5xl font-black">$9</span>
              <span className="mb-1.5 text-white/40">/month</span>
            </div>
            <p className="mt-2 text-sm text-white/40">For flippers who are serious about the numbers.</p>
            <ul className="mt-6 space-y-3">
              {PREMIUM_FEATURES.map((f, i) => (
                <li key={f} className={"flex items-start gap-2.5 text-sm " + (i === 0 ? "text-white/40" : "text-white")}>
                  <span className={"mt-0.5 " + (i === 0 ? "text-white/30" : "text-purple-400")}>✓</span>{f}
                </li>
              ))}
            </ul>
            {loading ? (
              <div className="mt-8 h-12 rounded-2xl bg-white/10 animate-pulse" />
            ) : isPremium ? (
              <div className="mt-8 rounded-2xl border border-green-500/30 bg-green-500/10 py-3 text-center text-sm font-black text-green-300">
                ✓ You&apos;re on Premium
              </div>
            ) : (
              <button onClick={handleUpgrade} disabled={checkoutLoading}
                className="mt-8 w-full rounded-2xl bg-purple-600 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_0_24px_rgba(147,51,234,0.4)] transition hover:bg-purple-500 disabled:opacity-60">
                {checkoutLoading ? "Loading..." : "Upgrade to Premium →"}
              </button>
            )}
            <p className="mt-3 text-center text-xs text-white/25">Cancel anytime. No lock-in.</p>
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-white/30">The math</p>
          <p className="mt-3 text-2xl font-black">One good flip pays for a whole year.</p>
          <p className="mt-2 text-sm text-white/40">At $9/month, you need one extra flip per month to break even. The sold data alone should find you that.</p>
        </div>
      </div>
    </main>
  );
}
