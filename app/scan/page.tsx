"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type EbayResult = {
  search: string;
  searchType?: "BARCODE" | "QUERY";
  dataSource: string;
  warning: string;
  buyPrice: number;
  postage: number;
  resultCount: number;
  averagePrice: number;
  medianPrice: number;
  estimatedSalePrice: number;
  ebayFeeEstimate: number;
  estimatedProfit: number;
  roi: number;
  verdict: "BUY" | "MAYBE" | "SKIP";
  items: {
    title: string;
    price: string;
    currency: string;
    condition: string;
    soldDate: string;
    url: string;
  }[];
};

function formatMoney(value: number) {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = {
    AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD",
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
    JP: "JPY", IN: "INR", SG: "SGD", HK: "HKD",
  };
  const currency = map[country] ?? "USD";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

const verdictConfig = {
  BUY:   { border: "border-green-500/40",  bg: "bg-green-500/10",  text: "text-green-400",  label: "YES — BUY IT" },
  MAYBE: { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MAYBE" },
  SKIP:  { border: "border-red-500/40",    bg: "bg-red-500/10",    text: "text-red-400",    label: "HELL NO" },
};

type ScanStep = "idle" | "price" | "camera" | "manual" | "loading";

export default function ScanPage() {
  const [step, setStep] = useState<ScanStep>("idle");
  const [buyPrice, setBuyPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<EbayResult | null>(null);
  const [error, setError] = useState("");
  const scannerRef = useRef<any>(null);
  const supabase = createSupabaseBrowserClient();

  async function runCheck(scannedBarcode: string, price: string) {
    setStep("loading");
    setError("");
    setResult(null);
    try {
      const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
      const params = new URLSearchParams({ barcode: scannedBarcode, buy: price || "0", postage: "0", locale });
      const response = await fetch("/api/sold-comps?" + params.toString());
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Server error: " + text.slice(0, 150)); }
      if (!response.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      // Save to history (fire and forget — don't block UI)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from("scans").insert({
            user_id: user.id,
            barcode: scannedBarcode,
            search_term: data.search,
            buy_price: data.buyPrice,
            median_price: data.medianPrice,
            estimated_profit: data.estimatedProfit,
            roi: data.roi,
            verdict: data.verdict,
            result_count: data.resultCount,
            data_source: data.dataSource,
          });
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setStep("idle");
    }
  }

  async function startCamera() {
    setStep("camera");
    setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText: string) => {
          const scanned = decodedText.trim();
          setBarcode(scanned);
          await stopCamera();
          await runCheck(scanned, buyPrice);
        },
        () => {}
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start camera");
      setStep("price");
    }
  }

  async function stopCamera() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      scannerRef.current = null;
    }
    setStep("idle");
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_40%)]" />
      </div>

      {/* Camera overlay */}
      {step === "camera" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-purple-300">Scan Barcode</p>
              {buyPrice ? <p className="text-xs text-white/40">Buy price: {formatMoney(Number(buyPrice))}</p> : null}
            </div>
            <button onClick={stopCamera} className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-300">
              Cancel
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <div id="barcode-reader" className="w-full max-w-xs overflow-hidden rounded-2xl" />
            <p className="text-xs text-white/40">Hold the barcode steady inside the box</p>
          </div>
        </div>
      )}

      {/* Buy price modal */}
      {step === "price" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-[2rem] border border-white/10 bg-[#0f0f14] p-6 sm:rounded-[2rem]">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">What's the price in store?</h2>
            <p className="mt-1 text-sm text-white/50">Enter the price tag, then scan the barcode.</p>
            <input
              autoFocus
              type="number"
              min="0"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startCamera()}
              placeholder="0.00"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-2xl font-black text-white outline-none placeholder:text-white/20 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30"
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep("idle")}
                className="rounded-2xl border border-white/10 py-3 text-sm font-black uppercase text-white/50"
              >
                Cancel
              </button>
              <button
                onClick={startCamera}
                className="rounded-2xl bg-purple-600 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)]"
              >
                Scan Barcode
              </button>
            </div>
            <button
              onClick={() => setStep("manual")}
              className="mt-2 w-full py-2 text-xs text-white/30 underline"
            >
              Type barcode manually instead
            </button>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            NoBSFlips / Scanner
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Barcode Flip Scanner</h1>
          <p className="mt-1 text-sm text-white/50">Scan a barcode at the op shop and get an instant verdict.</p>
        </div>

        {/* Mobile: big scan button */}
        <div className="md:hidden">
          <div className="flex min-h-[40vh] items-center justify-center py-8">
            <button
              onClick={() => setStep("price")}
              disabled={step === "loading"}
              className="w-full rounded-[2rem] bg-purple-600 py-8 text-xl font-black uppercase tracking-[0.1em] text-white shadow-[0_0_40px_rgba(147,51,234,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50"
            >
              {step === "loading" ? "Checking..." : "📷  Tap to Scan"}
            </button>
          </div>
          {step === "manual" && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCheck(barcode, buyPrice)}
                placeholder="Enter barcode manually"
                inputMode="numeric"
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60"
              />
              <button
                onClick={() => runCheck(barcode, buyPrice)}
                disabled={!barcode.trim()}
                className="rounded-2xl bg-purple-600 px-5 py-3 font-black text-white disabled:opacity-50"
              >
                Go
              </button>
            </div>
          )}
        </div>

        {/* Desktop: horizontal input bar */}
        <div className="hidden md:block">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCheck(barcode, buyPrice)}
                placeholder="Barcode / GTIN"
                inputMode="numeric"
                className="flex-[2] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 transition"
              />
              <input
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="Buy price"
                type="number"
                min="0"
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 transition"
              />
              <button
                onClick={() => runCheck(barcode, buyPrice)}
                disabled={step === "loading" || !barcode.trim()}
                className="rounded-2xl bg-purple-600 px-8 py-3 font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)] transition hover:bg-purple-500 disabled:opacity-50"
              >
                {step === "loading" ? "Checking..." : "Check"}
              </button>
            </div>
          </section>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        {result && vc && (
          <div className="mt-4 space-y-3">
            {result.dataSource === "EBAY_BROWSE_ACTIVE" ? (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-300">
                <span className="font-black">Heads up:</span> Showing current asking prices, not what items actually sold for. Use as a rough guide only.
              </div>
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-300">
                <span className="font-black">✓ Real sold data</span> — prices items actually sold for on eBay.
              </div>
            )}
            <div className={"w-full rounded-[2rem] border p-6 text-center " + vc.border + " " + vc.bg}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Verdict</p>
              <h2 className={"mt-2 text-4xl font-black sm:text-5xl " + vc.text}>{vc.label}</h2>
              <p className="mt-2 text-xs text-white/50">
                {result.dataSource === "EBAY_BROWSE_ACTIVE" ? "Current listings" : "Sold listings"} · {result.resultCount} results
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label="Median" value={formatMoney(result.medianPrice)} />
              <StatCard label="Average" value={formatMoney(result.averagePrice)} />
              <StatCard label="Est. profit" value={formatMoney(result.estimatedProfit)} highlight={result.estimatedProfit > 0} />
              <StatCard label="ROI" value={result.roi.toFixed(0) + "%"} highlight={result.roi > 0} />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-tight">
                  {result.dataSource === "EBAY_BROWSE_ACTIVE" ? "Active Listings (low → high)" : "Sold Listings"}
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wide text-white/30">
                  {result.dataSource === "EBAY_BROWSE_ACTIVE" ? "Asking price" : "Sold price"}
                </span>
              </div>
              <div className="space-y-2 lg:max-h-[400px] lg:overflow-y-auto">
                {result.items.map((item, index) => (
                  <a
                    key={String(index)}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 transition hover:border-purple-400/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs text-white/40">
                        {item.condition}{item.soldDate ? " · " + item.soldDate : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-purple-300">{formatMoney(Number(item.price))}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/40">{label}</p>
      <p className={"mt-1 text-lg font-black " + (highlight ? "text-purple-300" : "text-white")}>{value}</p>
    </div>
  );
}
