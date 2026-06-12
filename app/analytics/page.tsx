"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type FlipPost = {
  id: string;
  title: string | null;
  status: string | null;
  buy_price: number | null;
  sell_price: number | null;
  actual_sell: number | null;
  created_at: string;
};

const EBAY_FEE = 0.134;

function money(value: number) {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = { AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD" };
  return new Intl.NumberFormat(locale, { style: "currency", currency: map[country] ?? "USD", maximumFractionDigits: 0 }).format(value);
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: "good" | "bad" }) {
  const tone = highlight === "good" ? "text-green-400" : highlight === "bad" ? "text-red-400" : "text-white";
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">{label}</p>
      <p className={"mt-2 text-3xl font-black " + tone}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/30">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [flips, setFlips] = useState<FlipPost[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) { router.push("/login?redirectTo=/analytics"); return; }
      const { data: profile } = await supabase.from("profiles").select("is_premium").eq("id", u.id).single();
      if (profile?.is_premium !== true) { router.push("/pricing"); return; }
      const { data: rows } = await supabase
        .from("flip_posts")
        .select("id,title,status,buy_price,sell_price,actual_sell,created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });
      setFlips((rows ?? []) as FlipPost[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0d0b16] text-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="h-8 w-48 rounded-xl bg-white/10 animate-pulse" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-[1.5rem] bg-white/5 animate-pulse" />)}
          </div>
        </div>
      </main>
    );
  }

  const sold = flips.filter((f) => f.status === "sold");
  const bought = flips.filter((f) => f.status === "bought");
  const listed = flips.filter((f) => f.status === "listed");

  const netReturn = (f: FlipPost) => {
    const sell = f.actual_sell ?? f.sell_price ?? 0;
    return sell - sell * EBAY_FEE - (f.buy_price ?? 0);
  };

  const totalProfit = sold.reduce((s, f) => s + netReturn(f), 0);
  const soldCost = sold.reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const avgRoi = soldCost > 0 ? (totalProfit / soldCost) * 100 : 0;
  const wins = sold.filter((f) => netReturn(f) > 0).length;
  const winRate = sold.length > 0 ? (wins / sold.length) * 100 : 0;
  const tiedUp = [...bought, ...listed].reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const bestFlip = sold.reduce<{ title: string; profit: number } | null>((best, f) => {
    const p = netReturn(f);
    return !best || p > best.profit ? { title: f.title ?? "Untitled", profit: p } : best;
  }, null);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
      </div>
      <div className="relative mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            Premium / Analytics
          </div>
          <h1 className="mt-4 text-3xl font-black uppercase tracking-tight md:text-4xl">Your Flip Numbers</h1>
          <p className="mt-2 text-sm text-white/40">How your flipping's actually going — after eBay fees.</p>
        </div>

        {flips.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center">
            <p className="text-lg font-black">No flips logged yet.</p>
            <p className="mt-2 text-sm text-white/40">Scan something and tap “Snagged It” to start tracking. Your stats will show up here.</p>
            <Link href="/scan" className="mt-6 inline-block rounded-2xl bg-purple-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-purple-500">
              Start Scanning →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total profit" value={money(totalProfit)} sub={`${sold.length} sold`} highlight={totalProfit >= 0 ? "good" : "bad"} />
              <Stat label="Avg ROI" value={avgRoi.toFixed(0) + "%"} sub="per sold flip" highlight={avgRoi >= 0 ? "good" : "bad"} />
              <Stat label="Win rate" value={winRate.toFixed(0) + "%"} sub={`${wins} of ${sold.length} profitable`} />
              <Stat label="Cash tied up" value={money(tiedUp)} sub={`${bought.length + listed.length} not yet sold`} />
            </div>

            <div className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">Pipeline</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-2xl font-black text-blue-300">{bought.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Bought</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-yellow-300">{listed.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Listed</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-green-300">{sold.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40">Sold</p>
                </div>
              </div>
            </div>

            {bestFlip && bestFlip.profit > 0 && (
              <div className="mt-6 rounded-[2rem] border border-green-500/20 bg-green-500/10 p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-green-300/60">Best flip</p>
                <p className="mt-2 truncate text-lg font-black">{bestFlip.title}</p>
                <p className="mt-1 text-2xl font-black text-green-400">{money(bestFlip.profit)} profit</p>
              </div>
            )}

            <p className="mt-8 text-center text-xs text-white/25">Profit is net of eBay fees ({(EBAY_FEE * 100).toFixed(1)}%). Based on {flips.length} logged flip{flips.length === 1 ? "" : "s"}.</p>
          </>
        )}
      </div>
    </main>
  );
}
