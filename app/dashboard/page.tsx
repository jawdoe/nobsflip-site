"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type FlipPost = {
  id: string;
  title: string | null;
  status: string | null;
  buy_price: number | null;
  sell_price: number | null;
  actual_sell: number | null;
  image_url: string | null;
  created_at: string;
};

type Scan = {
  id: string;
  barcode: string | null;
  search_term: string;
  buy_price: number;
  median_price: number;
  estimated_profit: number;
  roi: number;
  verdict: "BUY" | "MAYBE" | "SKIP";
  result_count: number;
  data_source: string;
  created_at: string;
};

const STATUS_CYCLE: Record<string, string> = {
  bought: "listed",
  listed: "sold",
  sold: "bought",
};

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  bought: { color: "text-blue-300",   bg: "bg-blue-500/15",   border: "border-blue-400/30",   label: "Bought" },
  listed: { color: "text-yellow-300", bg: "bg-yellow-500/15", border: "border-yellow-400/30", label: "Listed" },
  sold:   { color: "text-green-300",  bg: "bg-green-500/15",  border: "border-green-400/30",  label: "Sold ✓" },
};

const verdictConfig = {
  BUY:   { border: "border-green-500/30",  bg: "bg-green-500/10",  text: "text-green-400",  label: "BUY" },
  MAYBE: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MAYBE" },
  SKIP:  { border: "border-red-500/30",    bg: "bg-red-500/10",    text: "text-red-400",    label: "SKIP" },
};

const EBAY_FEE = 0.134;

function fmt(value: number | null) {
  if (value == null) return "—";
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = { AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR" };
  return new Intl.NumberFormat(locale, { style: "currency", currency: map[country] ?? "USD" }).format(value);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function PlaceholderImg() {
  return (
    <div className="h-14 w-14 shrink-0 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white/20">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 18h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v10.5a1.5 1.5 0 001.5 1.5z" />
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [flips, setFlips] = useState<FlipPost[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "bought" | "listed" | "sold">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    Promise.all([
      supabase.from("flip_posts").select("id,title,status,buy_price,sell_price,actual_sell,image_url,created_at").order("created_at", { ascending: false }),
      supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(30),
    ]).then(([flipsRes, scansRes]) => {
      setFlips((flipsRes.data as FlipPost[]) ?? []);
      setScans((scansRes.data as Scan[]) ?? []);
      setLoading(false);
    });
  }, []);

  async function cycleStatus(flip: FlipPost) {
    const next = STATUS_CYCLE[flip.status ?? "bought"] ?? "listed";
    setUpdatingId(flip.id);
    await supabase.from("flip_posts").update({ status: next }).eq("id", flip.id);
    setFlips((prev) => prev.map((f) => f.id === flip.id ? { ...f, status: next } : f));
    setUpdatingId(null);
  }

  // Stats
  const totalInvested = flips.reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const soldFlips = flips.filter((f) => f.status === "sold");
  const totalReturned = soldFlips.reduce((s, f) => { const sell = f.actual_sell ?? f.sell_price ?? 0; return s + sell - sell * EBAY_FEE; }, 0);
  const soldCost = soldFlips.reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const netProfit = totalReturned - soldCost;
  const roi = soldCost > 0 ? (netProfit / soldCost) * 100 : 0;

  const counts = {
    all: flips.length,
    bought: flips.filter((f) => f.status === "bought").length,
    listed: flips.filter((f) => f.status === "listed").length,
    sold: soldFlips.length,
  };

  const filteredFlips = activeTab === "all" ? flips : flips.filter((f) => f.status === activeTab);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_40%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-36 md:px-8 md:py-12 md:pb-12">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">Your Flips</h1>
          <p className="mt-1 text-sm text-white/40">Every bit of gear ya snagged and what it's worth.</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-white/30">Pulling your flips...</div>
        ) : (
          <>
            {/* Stats — single unified row */}
            <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Invested</p>
                <p className="mt-1 text-xl font-black text-white">{fmt(totalInvested)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Returned</p>
                <p className="mt-1 text-xl font-black text-white">{fmt(totalReturned)}</p>
              </div>
              <div className={"rounded-2xl border p-4 " + (netProfit > 0 ? "border-green-500/20 bg-green-500/[0.07]" : netProfit < 0 ? "border-red-500/20 bg-red-500/[0.07]" : "border-white/10 bg-white/[0.04]")}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Profit</p>
                <p className={"mt-1 text-xl font-black " + (netProfit > 0 ? "text-green-400" : netProfit < 0 ? "text-red-400" : "text-white")}>
                  {netProfit !== 0 ? (netProfit > 0 ? "+" : "") + fmt(netProfit) : "—"}
                </p>
              </div>
              <div className={"rounded-2xl border p-4 " + (roi > 0 ? "border-purple-500/20 bg-purple-500/[0.07]" : "border-white/10 bg-white/[0.04]")}>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">ROI</p>
                <p className={"mt-1 text-xl font-black " + (roi > 0 ? "text-purple-300" : "text-white")}>{soldCost > 0 ? roi.toFixed(0) + "%" : "—"}</p>
              </div>
            </div>

            {/* Flips section */}
            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-tight text-white/60">Flips</h2>
                <Link href="/admin" className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-purple-300 transition hover:bg-purple-500/20">
                  + Add
                </Link>
              </div>

              {/* Tabs with counts */}
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {(["all", "bought", "listed", "sold"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={"shrink-0 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] transition " +
                      (activeTab === tab ? "border border-purple-400/40 bg-purple-500/20 text-purple-200" : "border border-white/10 text-white/40 hover:text-white")}>
                    {tab} {counts[tab] > 0 && <span className="ml-1 opacity-60">({counts[tab]})</span>}
                  </button>
                ))}
              </div>

              {filteredFlips.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-12 text-center">
                  <p className="text-sm text-white/30">Bugger all here yet — get out there and suss something out.</p>
                  <Link href="/admin" className="mt-4 inline-flex rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white">
                    Log a flip
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFlips.map((flip) => {
                    const sc = statusConfig[flip.status ?? "bought"] ?? statusConfig.bought;
                    const sellPrice = flip.actual_sell ?? flip.sell_price ?? 0;
                    const profit = flip.status === "sold" && flip.buy_price != null && sellPrice > 0
                      ? sellPrice - sellPrice * EBAY_FEE - flip.buy_price
                      : null;

                    return (
                      <div key={flip.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <div className="flex items-center gap-3">
                          {/* Image or placeholder */}
                          {flip.image_url
                            ? <img src={flip.image_url} alt={flip.title ?? ""} className="h-14 w-14 shrink-0 rounded-xl object-cover border border-white/10" />
                            : <PlaceholderImg />
                          }

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-white text-sm">{flip.title ?? "Untitled"}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/40">
                              <span>Paid {fmt(flip.buy_price)}</span>
                              {profit !== null && (
                                <span className={profit >= 0 ? "font-black text-green-400" : "font-black text-red-400"}>
                                  {profit >= 0 ? "+" : ""}{fmt(profit)}
                                </span>
                              )}
                              <span>{fmtDate(flip.created_at)}</span>
                            </div>
                          </div>

                          {/* Right side — tappable status + edit */}
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <button
                              onClick={() => cycleStatus(flip)}
                              disabled={updatingId === flip.id}
                              title="Tap to change status"
                              className={"rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition active:scale-95 " + sc.bg + " " + sc.border + " " + sc.color + (updatingId === flip.id ? " opacity-50" : " hover:brightness-125")}>
                              {updatingId === flip.id ? "..." : sc.label}
                            </button>
                            <Link href={"/admin/edit/" + flip.id}
                              className="text-[10px] font-black uppercase tracking-wide text-white/25 transition hover:text-purple-300">
                              Edit →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Scan history — simplified */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-tight text-white/60">Recent Scans</h2>
                <Link href="/scan" className="rounded-lg border border-purple-400/30 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-purple-300 transition hover:bg-purple-500/20">
                  Scan
                </Link>
              </div>

              {scans.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-12 text-center">
                  <p className="text-sm text-white/30">Haven't scanned a bloody thing yet. What are ya waiting for?</p>
                  <Link href="/scan" className="mt-4 inline-flex rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white">
                    Go suss something out
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {scans.map((scan) => {
                    const vc = verdictConfig[scan.verdict];
                    return (
                      <div key={scan.id} className={"flex items-center gap-3 rounded-2xl border p-3 " + vc.border + " " + vc.bg}>
                        <div className={"shrink-0 w-14 text-center text-xs font-black uppercase " + vc.text}>{vc.label}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-white">{scan.search_term}</p>
                          <p className="text-xs text-white/30">{fmtDate(scan.created_at)} · paid {fmt(scan.buy_price)} · profit {fmt(scan.estimated_profit)}</p>
                        </div>
                      </div>
                    );
                  })}
                     </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
