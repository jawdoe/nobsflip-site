"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

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

function formatMoney(value: number) {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = {
    AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR",
  };
  const currency = map[country] ?? "USD";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export default function HistoryPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) console.error("History fetch error:", error);
        setScans((data as Scan[]) ?? []);
        setLoading(false);
      });
  }, []);

  const buys = scans.filter((s) => s.verdict === "BUY").length;
  const maybes = scans.filter((s) => s.verdict === "MAYBE").length;
  const skips = scans.filter((s) => s.verdict === "SKIP").length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_40%)]" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            NoBSFlips / History
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Scan History</h1>
          <p className="mt-1 text-sm text-white/50">Every barcode ya've hit — all saved, no dramas.</p>
        </div>

        {!loading && scans.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-center">
              <div className="text-2xl font-black text-green-400">{buys}</div>
              <div className="text-[10px] font-black uppercase tracking-wide text-green-300/60">Yes</div>
            </div>
            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-center">
              <div className="text-2xl font-black text-yellow-400">{maybes}</div>
              <div className="text-[10px] font-black uppercase tracking-wide text-yellow-300/60">Maybe</div>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-center">
              <div className="text-2xl font-black text-red-400">{skips}</div>
              <div className="text-[10px] font-black uppercase tracking-wide text-red-300/60">Hell No</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-20 text-center text-sm text-white/30">Pulling ya scan history...</div>
        )}

        {!loading && scans.length === 0 && (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] py-20 text-center">
            <p className="text-lg font-black uppercase text-white/30">Sweet FA yet</p>
            <p className="mt-2 text-sm text-white/20">Get out there and suss something out.</p>
            <Link href="/scan" className="mt-6 inline-flex rounded-2xl bg-purple-600 px-8 py-3 text-sm font-black uppercase tracking-[0.1em] text-white">
              Hit the Scanner
            </Link>
          </div>
        )}

        {!loading && scans.length > 0 && (
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
                        <span>Profit {formatMoney(scan.estimated_profit)}</span>
                        <span>ROI {scan.roi.toFixed(0)}%</span>
                        <span>{scan.result_count} listings</span>
                        <span>{formatDate(scan.created_at)}</span>
                      </div>
                    </div>
                    <div className={"shrink-0 text-lg font-black " + vc.text}>{vc.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
