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

const verdictConfig = {
  BUY:   { border: "border-green-500/30",  bg: "bg-green-500/10",  text: "text-green-400",  label: "YES" },
  MAYBE: { border: "border-yellow-500/30", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MAYBE" },
  SKIP:  { border: "border-red-500/30",    bg: "bg-red-500/10",    text: "text-red-400",    label: "HELL NO" },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  bought: { color: "text-blue-400",   label: "Bought" },
  listed: { color: "text-yellow-400", label: "Listed" },
  sold:   { color: "text-green-400",  label: "Sold" },
};

function formatMoney(value: number | null) {
  if (value == null) return "???";
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = {
    AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  };
  return new Intl.NumberFormat(locale, { style: "currency", currency: map[country] ?? "USD" }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function StatCard({ label, value, highlight = false, negative = false }: { label: string; value: string; highlight?: boolean; negative?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/40">{label}</p>
      <p className={"mt-1 text-lg font-black " + (negative ? "text-red-400" : highlight ? "text-purple-300" : "text-white")}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [flips, setFlips] = useState<FlipPost[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "bought" | "listed" | "sold">("all");
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    Promise.all([
      supabase.from("flip_posts").select("id,title,status,buy_price,sell_price,actual_sell,image_url,created_at").order("created_at", { ascending: false }),
      supabase.from("scans").select("*").order("created_at", { ascending: false }).limit(50),
    ]).then(([flipsRes, scansRes]) => {
      setFlips((flipsRes.data as FlipPost[]) ?? []);
      setScans((scansRes.data as Scan[]) ?? []);
      setLoading(false);
    });
  }, []);

  const EBAY_FEE = 0.134;
  const totalInvested = flips.reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const soldFlips = flips.filter((f) => f.status === "sold");
  const totalReturned = soldFlips.reduce((s, f) => { const sell = f.actual_sell ?? f.sell_price ?? 0; return s + sell - sell * EBAY_FEE; }, 0);
  const soldCost = soldFlips.reduce((s, f) => s + (f.buy_price ?? 0), 0);
  const netProfit = totalReturned - soldCost;
  const roi = soldCost > 0 ? (netProfit / soldCost) * 100 : 0;
  const boughtCount = flips.filter((f) => f.status === "bought").length;
  const listedCount = flips.filter((f) => f.status === "listed").length;
  const soldCount = soldFlips.length;
  const avgDays =
    soldFlips.length > 0
      ? Math.round(soldFlips.reduce((s, f) => s + Math.floor((Date.now() - new Date(f.created_at).getTime()) / 86400000), 0) / soldFlips.length)
      : null;

  const filteredFlips = activeTab === "all" ? flips : flips.filter((f) => f.status === activeTab);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_40%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            NoBSFlips / Dashboard
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">Your flip performance at a glance.</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-white/30">Loading...</div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label="Total Invested" value={formatMoney(totalInvested)} />
              <StatCard label="Total Returned" value={formatMoney(totalReturned)} />
              <StatCard label="Net Profit" value={formatMoney(netProfit)} highlight={netProfit > 0} negative={netProfit < 0} />
              <StatCard label="ROI" value={roi > 0 ? roi.toFixed(1) + "%" : "???"} highlight={roi > 0} />
            </div>

            <div className={"mb-6 grid gap-2 " + (avgDays !== null ? "grid-cols-4" : "grid-cols-3")}>
              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-center">
                <div className="text-2xl font-black text-blue-400">{boughtCount}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-blue-300/60">Bought</div>
              </div>
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
                <div className="text-2xl font-black text-yellow-400">{listedCount}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-yellow-300/60">Listed</div>
              </div>
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-center">
                <div className="text-2xl font-black text-green-400">{soldCount}</div>
                <div className="text-[10px] font-black uppercase tracking-wide text-green-300/60">Sold</div>
              </div>
              {avgDays !== null && (
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-3 text-center">
                  <div className="text-2xl font-black text-purple-400">{avgDays}d</div>
                  <div className="text-[10px] font-black uppercase tracking-wide text-purple-300/60">Avg Days</div>
                </div>
              )}
            </div>

            <section className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-tight text-white/70">Flips</h2>
                <Link href="/admin" className="text-xs font-black text-purple-400 underline">+ Add Flip</Link>
              </div>
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {(["all", "bought", "listed", "sold"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={"shrink-0 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] transition " + (activeTab === tab ? "border border-purple-400/40 bg-purple-500/20 text-purple-200" : "border border-white/10 text-white/40 hover:text-white")}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {filteredFlips.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-12 text-center">
                  <p className="text-sm text-white/30">No flips here yet.</p>
                  <Link href="/admin" className="mt-4 inline-flex rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white">Add flip</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFlips.map((flip) => {
                    const sc = statusConfig[flip.status ?? ""] ?? { color: "text-white/40", label: flip.status ?? "Unknown" };
                    const sellPrice = flip.actual_sell ?? flip.sell_price ?? 0;
                    const profit =
                      flip.status === "sold" && flip.buy_price != null && (flip.actual_sell ?? flip.sell_price) != null
                        ? sellPrice - sellPrice * 0.134 - flip.buy_price
                        : null;
                    return (
                      <div key={flip.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-start gap-3">
                          {flip.image_url && (
                            <img src={flip.image_url} alt={flip.title ?? ""} className="h-12 w-12 shrink-0 rounded-xl object-cover border border-white/10" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-white">{flip.title ?? "Untitled"}</p>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                              <span>Paid {formatMoney(flip.buy_price)}</span>
                              {flip.status === "sold" && <span>Sold {formatMoney(flip.sell_price)}</span>}
                              {profit !== null && (
                                <span className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                                  {profit >= 0 ? "+" : ""}{formatMoney(profit)} profit
                                </span>
                              )}
                              <span>{daysAgo(flip.created_at)} ago &middot; {formatDate(flip.created_at)}</span>
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <span className={"text-xs font-black uppercase " + sc.color}>{sc.label}</span>
                            <Link href={"/admin/edit/" + flip.id} className="text-[10px] text-white/25 underline hover:text-white/50">Edit</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-tight text-white/70">Scan History</h2>
                <Link href="/scan" className="text-xs font-black text-purple-400 underline">New Scan</Link>
              </div>
              {scans.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-12 text-center">
                  <p className="text-sm text-white/30">No scans yet.</p>
                  <Link href="/scan" className="mt-4 inline-flex rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-white">Start scanning</Link>
                </div>
              ) : (
                <>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-center">
                      <div className="text-xl font-black text-green-400">{scans.filter((s) => s.verdict === "BUY").length}</div>
                      <div className="text-[10px] font-black uppercase tracking-wide text-green-300/60">Yes</div>
                    </div>
                    <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
                      <div className="text-xl font-black text-yellow-400">{scans.filter((s) => s.verdict === "MAYBE").length}</div>
                      <div className="text-[10px] font-black uppercase tracking-wide text-yellow-300/60">Maybe</div>
                    </div>
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-center">
                      <div className="text-xl font-black text-red-400">{scans.filter((s) => s.verdict === "SKIP").length}</div>
                      <div className="text-[10px] font-black uppercase tracking-wide text-red-300/60">Hell No</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {scans.map((scan) => {
                      const vc = verdictConfig[scan.verdict];
                      return (
                        <div key={scan.id} className={"rounded-2xl border p-4 " + vc.border + " " + vc.bg}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-black text-white">{scan.search_term}</p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                                {scan.barcode && <span>#{scan.barcode}</span>}
                                <span>Paid {formatMoney(scan.buy_price)}</span>
                                <span>Median {formatMoney(scan.median_price)}</span>
                                <span className={scan.estimated_profit > 0 ? "text-purple-300" : ""}>
                                  Profit {formatMoney(scan.estimated_profit)}
                                </span>
                                <span>ROI {scan.roi.toFixed(0)}%</span>
                                <span>{formatDate(scan.created_at)}</span>
                              </div>
                            </div>
                            <div className={"shrink-0 text-sm font-black " + vc.text}>{vc.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
