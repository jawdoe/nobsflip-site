"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type EbayResult = {
  search: string; resolvedFrom: string | null; searchType?: string; dataSource: string; warning: string;
  buyPrice: number; postage: number; feeRate: number; resultCount: number;
  averagePrice: number; medianPrice: number; estimatedSalePrice: number;
  ebayFeeEstimate: number; estimatedProfit: number; roi: number;
  lowPrice: number; highPrice: number; isPremium: boolean;
  verdict: "BUY" | "MAYBE" | "SKIP";
  _debug?: { findingApiStatus: string; country: string; marketplace: string };
  items: { title: string; price: string; currency: string; condition: string; soldDate: string; url: string; }[];
};

const freePostageOptions: Record<string, { label: string; value: string; hint: string }[]> = {
  AU: [{ label: "XS", value: "10.05", hint: "up to 250g · $10.05" },{ label: "Small", value: "11.50", hint: "up to 500g · $11.50" },{ label: "Medium", value: "15.65", hint: "up to 1kg · $15.65" },{ label: "Large", value: "19.75", hint: "up to 3kg · $19.75" },{ label: "XL", value: "23.80", hint: "up to 5kg · $23.80" }],
  US: [{ label: "Letter", value: "4", hint: "USPS First Class · ~$4" },{ label: "Small", value: "6", hint: "USPS First Class parcel · ~$6" },{ label: "Medium", value: "10", hint: "USPS Priority · ~$10" },{ label: "Large", value: "15", hint: "USPS Priority · ~$15" }],
  GB: [{ label: "Small", value: "3", hint: "Royal Mail large letter · ~£3" },{ label: "Medium", value: "5", hint: "Royal Mail small parcel · ~£5" },{ label: "Large", value: "8", hint: "Royal Mail medium parcel · ~£8" }],
  CA: [{ label: "Small", value: "10", hint: "Canada Post · ~$10" },{ label: "Medium", value: "15", hint: "Canada Post · ~$15" },{ label: "Large", value: "20", hint: "Canada Post · ~$20" }],
  NZ: [{ label: "Small", value: "6", hint: "NZ Post · ~$6" },{ label: "Medium", value: "9", hint: "NZ Post · ~$9" },{ label: "Large", value: "14", hint: "NZ Post · ~$14" }],
};
const defaultPostageOptions = [{ label: "Small", value: "5", hint: "~$5" },{ label: "Medium", value: "10", hint: "~$10" },{ label: "Large", value: "15", hint: "~$15" }];

function getCountry() { if (typeof navigator === "undefined") return "AU"; return (navigator.language ?? "en-AU").split("-")[1]?.toUpperCase() ?? "AU"; }

function formatMoney(value: number) {
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
  const country = locale.split("-")[1] ?? "AU";
  const map: Record<string, string> = { AU: "AUD", US: "USD", GB: "GBP", CA: "CAD", NZ: "NZD", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR" };
  return new Intl.NumberFormat(locale, { style: "currency", currency: map[country] ?? "USD" }).format(value);
}

const verdictConfig = {
  BUY:   { border: "border-green-500/40",  bg: "bg-green-500/10",  text: "text-green-400",  label: "YES - BUY IT" },
  MAYBE: { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400", label: "MAYBE" },
  SKIP:  { border: "border-red-500/40",    bg: "bg-red-500/10",    text: "text-red-400",    label: "HELL NO" },
};

type ScanStep = "idle" | "price" | "camera" | "manual" | "loading";
type PostageMode = "buyer" | "free";
type FlipSaveState = null | "saving" | "saved" | "failed";

export default function ScanPage() {
  const [step, setStep] = useState<ScanStep>("idle");
  const [buyPrice, setBuyPrice] = useState("");
  const [postageMode, setPostageMode] = useState<PostageMode>("buyer");
  const [postageAmount, setPostageAmount] = useState("");

  // Persist postage settings across sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nbf_postage");
      if (saved) { const p = JSON.parse(saved); setPostageMode(p.mode ?? "buyer"); setPostageAmount(p.amount ?? ""); }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("nbf_postage", JSON.stringify({ mode: postageMode, amount: postageAmount })); } catch {}
  }, [postageMode, postageAmount]);
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<EbayResult | null>(null);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "failed" | null>(null);
  const [flipSave, setFlipSave] = useState<FlipSaveState>(null);
  const [flipId, setFlipId] = useState<string | null>(null);
  const [country, setCountry] = useState("AU");
  const scannerRef = useRef<any>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => { setCountry(getCountry()); }, []);

  const satchelOptions = freePostageOptions[country] ?? defaultPostageOptions;
  const effectivePostage = postageMode === "buyer" ? "0" : (postageAmount || "0");

  async function runCheck(scannedBarcode: string, price: string, post: string) {
    setStep("loading"); setError(""); setResult(null); setSaveStatus(null); setFlipSave(null); setFlipId(null);
    try {
      const locale = typeof navigator !== "undefined" ? navigator.language : "en-AU";
      const { data: { user } } = await supabase.auth.getUser();
      const params = new URLSearchParams({ barcode: scannedBarcode, buy: price || "0", postage: post, locale, ...(user ? { userId: user.id } : {}) });
      const response = await fetch("/api/sold-comps?" + params.toString());
      const text = await response.text();
      let data: any;
      try { data = JSON.parse(text); } catch { throw new Error("Server error: " + text.slice(0, 150)); }
      if (!response.ok) throw new Error(data.error ?? "Something went wrong");
      setResult(data);
      try {
        if (user) {
          const { error: insertError } = await supabase.from("scans").insert({ user_id: user.id, barcode: scannedBarcode || null, search_term: data.search, buy_price: data.buyPrice ?? 0, median_price: data.medianPrice ?? 0, estimated_profit: data.estimatedProfit ?? 0, roi: data.roi ?? 0, verdict: data.verdict, result_count: data.resultCount ?? 0, data_source: data.dataSource });
          if (insertError) { console.error("Scan save error:", insertError); setSaveStatus("failed"); }
          else setSaveStatus("saved");
        } else setSaveStatus("failed");
      } catch { setSaveStatus("failed"); }
    } catch (err) { setError(err instanceof Error ? err.message : "Unknown error"); }
    finally { setStep("idle"); }
  }

  async function handleBoughtThis() {
    if (!result) return;
    setFlipSave("saving");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setFlipSave("failed"); return; }
      const { data: inserted, error: insertError } = await supabase
        .from("flip_posts")
        .insert({ user_id: user.id, title: result.search, buy_price: result.buyPrice, status: "bought" })
        .select("id")
        .single();
      if (insertError) { console.error("Flip insert error:", insertError); setFlipSave("failed"); return; }
      setFlipId(inserted.id);
      setFlipSave("saved");
    } catch { setFlipSave("failed"); }
  }

  async function startCamera() {
    setStep("camera"); setError("");
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;
      await scanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decodedText: string) => { const scanned = decodedText.trim(); setBarcode(scanned); await stopCamera(); await runCheck(scanned, buyPrice, effectivePostage); },
        () => {}
      );
    } catch (err) { setError(err instanceof Error ? err.message : "Could not start camera"); setStep("price"); }
  }

  async function stopCamera() {
    try { if (scannerRef.current) { await scannerRef.current.stop(); await scannerRef.current.clear(); scannerRef.current = null; } } catch { scannerRef.current = null; }
    setStep("idle");
  }

  useEffect(() => { return () => { if (scannerRef.current) { scannerRef.current.stop().catch(() => {}); scannerRef.current.clear().catch(() => {}); } }; }, []);

  const vc = result ? verdictConfig[result.verdict] : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_40%)]" />
      </div>

      {step === "camera" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.15em] text-purple-300">Find the barcode</p>
              <p className="text-xs text-white/40">
                Paying: {buyPrice ? formatMoney(Number(buyPrice)) : "—"}
                {postageMode === "buyer" ? " · buyer pays post" : ` · you cover post (${formatMoney(Number(postageAmount || 0))})`}
              </p>
            </div>
            <button onClick={stopCamera} className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-black text-red-300">Cancel</button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <div id="barcode-reader" className="w-full max-w-xs overflow-hidden rounded-2xl" />
            <p className="text-xs text-white/40">Hold it steady — it'll grab it in a sec</p>
          </div>
        </div>
      )}

      {step === "price" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-t-[2rem] border border-white/10 bg-[#0f0f14] p-6 sm:rounded-[2rem]">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">Quick one first</h2>
            <p className="mt-1 text-sm text-white/50">What's the op shop charging for it? And who's covering postage?</p>

            <label className="mt-5 block text-xs font-black uppercase tracking-[0.18em] text-white/40">Store price</label>
            <input autoFocus type="number" min="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startCamera()} placeholder="0.00"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-2xl font-black text-white outline-none placeholder:text-white/20 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30" />

            <label className="mt-5 block text-xs font-black uppercase tracking-[0.18em] text-white/40">Postage</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setPostageMode("buyer")}
                className={"rounded-2xl border py-3 text-sm font-black transition " + (postageMode === "buyer" ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                Buyer pays
              </button>
              <button type="button" onClick={() => setPostageMode("free")}
                className={"rounded-2xl border py-3 text-sm font-black transition " + (postageMode === "free" ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                I offer free post
              </button>
            </div>

            {postageMode === "buyer" && <p className="mt-2 text-xs text-white/30">Beauty — buyer sorts postage, nothing comes off ya profit.</p>}

            {postageMode === "free" && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-white/30">Pick ya satchel size — comes off ya profit:</p>
                <div className="flex flex-wrap gap-2">
                  {satchelOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setPostageAmount(opt.value)}
                      className={"rounded-xl border px-3 py-1.5 text-xs font-black transition " + (postageAmount === opt.value ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/50 hover:text-white")}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {postageAmount && <p className="mt-1.5 text-xs text-white/30">{satchelOptions.find((o) => o.value === postageAmount)?.hint ?? formatMoney(Number(postageAmount)) + " postage"}</p>}
                <input type="number" min="0" value={postageAmount} onChange={(e) => setPostageAmount(e.target.value)} placeholder="or enter custom amount"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-purple-400/60" />
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => setStep("idle")} className="rounded-2xl border border-white/10 py-3 text-sm font-black uppercase text-white/50">Cancel</button>
              <button onClick={startCamera} className="rounded-2xl bg-purple-600 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)]">Scan Barcode</button>
            </div>
            <button onClick={() => setStep("manual")} className="mt-2 w-full py-2 text-xs text-white/30 underline">Can't scan it? Chuck the barcode in manually</button>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-36 md:px-8 md:py-12 md:pb-12">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">NoBSFlips / Scanner</div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight md:text-4xl">Barcode Flip Scanner</h1>
          <p className="mt-1 text-sm text-white/50">Point ya phone at a barcode, get a deadset answer. No BS, no waffle.</p>
        </div>

        <div className="md:hidden">
          <div className="flex min-h-[40vh] items-center justify-center py-8">
            <button onClick={() => setStep("price")} disabled={step === "loading"}
              className="w-full rounded-[2rem] bg-purple-600 py-8 text-xl font-black uppercase tracking-[0.1em] text-white shadow-[0_0_40px_rgba(147,51,234,0.5)] transition hover:bg-purple-500 active:scale-[0.98] disabled:opacity-50">
              {step === "loading" ? "Checking eBay..." : "Tap to Scan"}
            </button>
          </div>
          {step === "manual" && (
            <div className="mt-3 space-y-2">
              <input autoFocus value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCheck(barcode, buyPrice, effectivePostage)} placeholder="Enter barcode manually" inputMode="numeric"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60" />
              <button onClick={() => runCheck(barcode, buyPrice, effectivePostage)} disabled={!barcode.trim()} className="w-full rounded-2xl bg-purple-600 px-5 py-3 font-black text-white disabled:opacity-50">Go</button>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <input value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCheck(barcode, buyPrice, effectivePostage)} placeholder="Barcode / GTIN" inputMode="numeric"
                className="flex-[2] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 transition" />
              <input value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="Buy price" type="number" min="0"
                className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-purple-400/60 transition" />
              <button onClick={() => runCheck(barcode, buyPrice, effectivePostage)} disabled={step === "loading" || !barcode.trim()}
                className="rounded-2xl bg-purple-600 px-8 py-3 font-black uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)] transition hover:bg-purple-500 disabled:opacity-50">
                {step === "loading" ? "Checking eBay..." : "Check"}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">Postage:</span>
              <button type="button" onClick={() => setPostageMode("buyer")}
                className={"rounded-xl border px-3 py-1.5 text-xs font-black transition " + (postageMode === "buyer" ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                Buyer pays
              </button>
              <button type="button" onClick={() => setPostageMode("free")}
                className={"rounded-xl border px-3 py-1.5 text-xs font-black transition " + (postageMode === "free" ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                I offer free post
              </button>
              {postageMode === "free" && (
                <>
                  <span className="text-white/20">→</span>
                  {satchelOptions.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setPostageAmount(opt.value)} title={opt.hint}
                      className={"rounded-xl border px-3 py-1.5 text-xs font-black transition " + (postageAmount === opt.value ? "border-purple-400/50 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                      {opt.label}
                    </button>
                  ))}
                  <input type="number" min="0" value={postageAmount} onChange={(e) => setPostageAmount(e.target.value)} placeholder="custom"
                    className="w-20 rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-purple-400/60" />
                  {postageAmount && <span className="text-xs text-white/30">{satchelOptions.find((o) => o.value === postageAmount)?.hint ?? formatMoney(Number(postageAmount)) + " off profit"}</span>}
                </>
              )}
            </div>
          </section>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {result && vc && (
          <div className="mt-4 space-y-3">
            {result.resolvedFrom && (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-xs text-purple-300">
                Barcode <span className="font-black">{result.resolvedFrom}</span> → <span className="font-black">{result.search}</span>
              </div>
            )}
            {result.dataSource === "EBAY_BROWSE_ACTIVE" ? (
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs leading-5 text-yellow-300">
                <span className="font-black">Heads up:</span> These are active listings, not sold prices. Anyone can ask whatever they reckon — take it with a grain of salt.
              </div>
            ) : (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-xs text-green-300">
                <span className="font-black">Deadset sold data</span> — what punters actually paid, not what some bloke's hoping for.
              </div>
            )}

            <div className={"w-full rounded-[2rem] border p-6 text-center " + vc.border + " " + vc.bg}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">NoBSFlips Reckons</p>
              <h2 className={"mt-2 text-4xl font-black sm:text-5xl " + vc.text}>{vc.label}</h2>
              <p className="mt-2 text-xs text-white/50">{result.dataSource === "EBAY_BROWSE_ACTIVE" ? "Current listings" : "Sold listings"} — {result.resultCount} results</p>

              {(result.verdict === "BUY" || result.verdict === "MAYBE") && (
                <div className="mt-4">
                  {flipSave === null && (
                    <button onClick={handleBoughtThis}
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-black shadow-lg transition hover:bg-white/90 active:scale-[0.97]">
                      Yeah nah — I grabbed it
                    </button>
                  )}
                  {flipSave === "saving" && (
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-black text-white/50">
                      Logging it...
                    </div>
                  )}
                  {flipSave === "saved" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-green-500/20 px-4 py-2 text-sm font-black text-green-300">
                        ✓ Ripper. Logged — now let's flog it.
                      </div>
                      {flipId && (
                        <Link href={"/admin/edit/" + flipId} className="text-xs text-white/40 underline hover:text-white/60">
                          Add more details →
                        </Link>
                      )}
                    </div>
                  )}
                  {flipSave === "failed" && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-xs text-red-400">No good — ya signed in, mate?</div>
                      <button onClick={handleBoughtThis} className="text-xs text-white/40 underline">Have another crack</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatCard label="Median sale" value={formatMoney(result.medianPrice)} />
              <StatCard label={`eBay fees (${((result.feeRate ?? 0.135) * 100).toFixed(1)}%)`} value={formatMoney(result.ebayFeeEstimate)} />
              <StatCard label="Est. profit" value={formatMoney(result.estimatedProfit)} highlight={result.estimatedProfit > 0} />
              <StatCard label="ROI" value={result.roi.toFixed(0) + "%"} highlight={result.roi > 0} />
            </div>
            {result.isPremium && result.lowPrice > 0 && result.highPrice > 0 && (
              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-purple-300/60">Price Range (sold)</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/50">Low {formatMoney(result.lowPrice)}</span>
                  <div className="flex-1 rounded-full bg-white/10 h-1.5 relative">
                    <div className="absolute inset-y-0 rounded-full bg-purple-400"
                      style={{ left: "0%", right: `${100 - ((result.medianPrice - result.lowPrice) / (result.highPrice - result.lowPrice || 1)) * 100}%` }} />
                  </div>
                  <span className="text-sm text-white/50">High {formatMoney(result.highPrice)}</span>
                </div>
                <p className="mt-1.5 text-center text-xs text-purple-200">Median {formatMoney(result.medianPrice)}</p>
              </div>
            )}
            {!result.isPremium && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-white/30">Unlock price range + real sold data</p>
                  <p className="text-[10px] text-white/20">See exactly what things sell for — low, median, high</p>
                </div>
                <a href="/pricing" className="shrink-0 rounded-xl border border-purple-500/30 bg-purple-500/15 px-3 py-1.5 text-xs font-black text-purple-300 transition hover:bg-purple-500/25">
                  Upgrade →
                </a>
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/40">
              Costs: buy {formatMoney(result.buyPrice)}
              {result.postage > 0 ? ` + postage ${formatMoney(result.postage)} (you cover)` : " + buyer pays post"}
              {` + eBay ${formatMoney(result.ebayFeeEstimate)}`}
            </div>
            {result._debug && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2 font-mono text-[10px] text-white/25">
                debug: finding={result._debug.findingApiStatus} · country={result._debug.country} · market={result._debug.marketplace}
              </div>
            )}

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <h3 className="mb-3 text-sm font-black uppercase tracking-tight">{result.dataSource === "EBAY_BROWSE_ACTIVE" ? "Active Listings" : "Sold Listings"}</h3>
              <div className="space-y-2 lg:max-h-[400px] lg:overflow-y-auto">
                {result.items.map((item, index) => (
                  <a key={String(index)} href={item.url} target="_blank" rel="noreferrer"
                    className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 transition hover:border-purple-400/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs text-white/40">{item.condition}{item.soldDate ? " — " + item.soldDate : ""}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-purple-300">{formatMoney(Number(item.price))}</p>
                  </a>
                ))}
              </div>
            </div>

            <button onClick={() => setStep("price")}
              className="w-full rounded-2xl border border-white/10 py-4 text-sm font-black uppercase tracking-[0.08em] text-white/50 transition hover:border-purple-400/30 hover:text-white">
              Chuck Another One At Me
            </button>
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
