"use client";

import { useState } from "react";

type EbayResult = {
  search: string;
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
  const [search, setSearch] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [postage, setPostage] = useState("0");
  const [result, setResult] = useState<EbayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkItem() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const params = new URLSearchParams({
        query: search,
        buy: buyPrice || "0",
        postage: postage || "0",
      });

      const response = await fetch(`/api/ebay?${params.toString()}`);
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
            Flip Scanner
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            Search an item or paste a barcode, add your buy price, and get a
            quick reseller verdict.
          </p>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
          <div className="grid gap-4 md:grid-cols-[1fr_160px_160px_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item or barcode, e.g. ps2 console"
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
              onClick={checkItem}
              disabled={loading || !search.trim()}
              className="rounded-2xl bg-green-400 px-6 py-3 font-black text-black transition hover:bg-green-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>
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
                Based on {result.resultCount} matching eBay listings.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard
                label="Est. sale"
                value={formatMoney(result.estimatedSalePrice)}
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
              <h3 className="text-xl font-black">Matching Listings</h3>

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
                        <p className="mt-1 text-sm text-white/50">
                          {item.condition}
                        </p>
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