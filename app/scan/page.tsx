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
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

export default function ScanPage() {
  const [barcode, setBarcode] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [postage, setPostage] = useState("0");

  const [result, setResult] = useState<EbayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [error, setError] = useState("");

  const scannerRef = useRef<any>(null);

  async function checkItem(scannedBarcode?: string) {
    const finalBarcode = (scannedBarcode || barcode).trim();

    if (!finalBarcode) {
      setError("Scan or enter a barcode first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = new URLSearchParams({
        barcode: finalBarcode,
        buy: buyPrice || "0",
        postage: postage || "0",
      });

      const response = await fetch(`/api/sold-search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

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
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
        },
        async (decodedText: string) => {
          const scanned = decodedText.trim();

          setBarcode(scanned);
          await stopScanner();
          await checkItem(scanned);
        },
        () => {}
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not start barcode scanner"
      );
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

  const verdictStyles =
    result?.verdict === "BUY"
      ? "border-green-500/40 bg-green-500/10 text-green-300"
      : result?.verdict === "MAYBE"
        ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
        : "border-red-500/40 bg-red-500/10 text-red-300";

  return (
    <main className="min-h-screen bg-[#07070a] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-green-400">
            NOBSFLIPS
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Barcode Flip Scanner
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            Scan a barcode, enter your buy price, and check sold eBay AU results
            before you buy.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <div className="grid gap-4 md:grid-cols-[1fr_160px_160px_auto_auto]">
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Barcode / GTIN"
              inputMode="numeric"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400"
            />

            <input
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="Buy price"
              type="number"
              min="0"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400"
            />

            <input
              value={postage}
              onChange={(e) => setPostage(e.target.value)}
              placeholder="Postage"
              type="number"
              min="0"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400"
            />

            <button
              onClick={startScanner}
              disabled={scannerOpen || scannerLoading}
              className="rounded-2xl border border-green-400/40 bg-green-400/10 px-6 py-3 font-black text-green-300 transition hover:bg-green-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scannerLoading ? "Opening..." : "Scan"}
            </button>

            <button
              onClick={() => checkItem()}
              disabled={loading || !barcode.trim()}
              className="rounded-2xl bg-green-400 px-6 py-3 font-black text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>

          {scannerOpen && (
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/40 p-4">
              <div id="barcode-reader" className="overflow-hidden rounded-2xl" />

              <button
                onClick={stopScanner}
                className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-300"
              >
                Stop Scanner
              </button>
            </div>
          )}
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {result && (
          <section className="mt-8 space-y-6">
            <div className={`rounded-3xl border p-6 ${verdictStyles}`}>
              <p className="text-sm font-bold uppercase tracking-[0.35em]">
                Verdict
              </p>

              <h2 className="mt-2 text-6xl font-black">{result.verdict}</h2>

              <p className="mt-3 text-white/70">
                Based on {result.resultCount} sold eBay AU barcode matches.
              </p>
            </div>

            <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-5 text-green-200">
              <p className="font-bold uppercase tracking-[0.2em]">
                Sold Data Notice
              </p>

              <p className="mt-2 text-sm text-green-100/80">
                {result.warning}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
              <StatCard
                label="Median sold"
                value={formatMoney(result.medianPrice)}
              />

              <StatCard
                label="Average sold"
                value={formatMoney(result.averagePrice)}
              />

              <StatCard
                label="Est. profit"
                value={formatMoney(result.estimatedProfit)}
              />

              <StatCard label="ROI" value={`${result.roi.toFixed(0)}%`} />

              <StatCard
                label="eBay fee est."
                value={formatMoney(result.ebayFeeEstimate)}
              />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-xl font-black">Sold eBay Items</h3>

              <div className="mt-4 space-y-3">
                {result.items.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-green-400/60"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-bold text-white">{item.title}</p>

                        <div className="mt-1 space-y-1 text-sm text-white/50">
                          <p>{item.condition}</p>

                          <p className="font-bold text-green-400">
                            {item.soldDate || "Sold date unavailable"}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 text-lg font-black text-green-300">
                        {formatMoney(Number(item.price))}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-white/50">{label}</p>

      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}