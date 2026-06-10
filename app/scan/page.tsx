"use client";

import { useEffect, useRef, useState } from "react";

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

export default function ScanPage() {
  const [barcode, setBarcode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [result, setResult] = useState<EbayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef<any>(null);

  async function checkItem(scannedBarcode?: string) {
    const finalBarcode = (scannedBarcode || barcode).trim();
    if (!finalBarcode) { setError("Scan or enter a barcode first."); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
      const params = new URLSearchParams({ barcode: finalBarcode, buy: buyPrice || "0", postage: "0", locale });
      const response = await fetch("/api/sold-comps?" + params.toString());
      let data: any;
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error: " + text.slice(0, 200));
      }
      if (!response.ok) throw new Error(data.error + (data.details ? " — " + JSON.stringify(data.details).slice(0, 200) : ""));
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function startScanner() {
    setError("");
    setScannerOpen(true);
    setScannerLoading(true);
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
          await stopScanner();
          await checkItem(scanned);
        },
        () => {}
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start barcode scanner");
    } finally {
      setScannerLoading(false);
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      scannerRef.current = null;
    } finally {
      setScannerOpen(false);
    }
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
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            NoBSFlips / Scanner
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Barcode Flip Scanner</h1>
          <p className="mt-1 text-sm text-white/50">Scan a barcode, enter your buy price, get a real verdict from actual eBay sold listings.</p>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkItem()}
              placeholder="Barcode / GTIN"
              inputMode="numeric"
              className="flex-[2] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition"
            />
            <input
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="Buy price"
              type="number"
              min="0"
              className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition"
            />
            <div className="flex gap-3 md:contents">
              <button
                onClick={startScanner}
                disabled={scannerOpen || scannerLoading}
                className="md:hidden flex-1 rounded-2xl bg-purple-600 px-6 py-3 font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.35)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {scannerLoading ? "Opening..." : "📷 Scan"}
              </button>
              <button
                onClick={() => checkItem()}
                disabled={loading || !barcode.trim()}
                className="flex-1 rounded-2xl bg-purple-600 px-8 py-3 font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Checking..." : "Check"}
              </button>
            </div>
          </div>
          {scannerOpen && (
            <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <p className="text-sm font-black uppercase tracking-[0.15em] text-purple-300">
                  {scannerLoading ? "Opening camera..." : "Point at barcode"}
                </p>
                <button onClick={stopScanner} className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-300">
                  Cancel
                </button>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                <div id="barcode-reader" className="w-full max-w-xs overflow-hidden rounded-2xl" />
                <p className="text-xs text-white/40 tracking-wide">Hold the barcode steady inside the box</p>
              </div>
            </div>
          )}
        </section>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
        )}

        {result && vc && (
          <div className="mt-6 grid w-full gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="space-y-3">
              <div className={"rounded-[2rem] border p-6 text-center " + vc.border + " " + vc.bg}>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Verdict</p>
                <h2 className={"mt-2 text-4xl font-black sm:text-5xl md:text-6xl " + vc.text}>{vc.label}</h2>
                <p className="mt-2 text-xs text-white/50">Based on {result.resultCount} real sold listings</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Median" value={formatMoney(result.medianPrice)} />
                <StatCard label="Average" value={formatMoney(result.averagePrice)} />
                <StatCard label="Est. profit" value={formatMoney(result.estimatedProfit)} highlight={result.estimatedProfit > 0} />
                <StatCard label="ROI" value={result.roi.toFixed(0) + "%"} highlight={result.roi > 0} />
              </div>
              {result.warning && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-5 text-white/45">{result.warning}</div>
              )}
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:p-5">
              <h3 className="mb-3 text-base font-black uppercase tracking-tight">Sold Listings</h3>
              <div className="space-y-2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
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
                      <p className="mt-0.5 text-xs text-white/40">{item.condition} · {item.soldDate || "Date unknown"}</p>
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
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40">{label}</p>
      <p className={"mt-1 text-lg font-black " + (highlight ? "text-purple-300" : "text-white")}>{value}</p>
    </div>
  );
}
