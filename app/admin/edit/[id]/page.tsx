"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/compress-image";

const EBAY_FEE = 0.134;

export default function EditFlipPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("bought");
  const [buyPrice, setBuyPrice] = useState("");
  const [actualSell, setActualSell] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [category, setCategory] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [description, setDescription] = useState("");
  const [listedAt, setListedAt] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const actualSellRef = useRef<HTMLInputElement>(null);

  const toDateTimeLocal = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  };

  const fromDateTimeLocal = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  useEffect(() => {
    supabase.from("flip_posts").select("*").eq("id", id).single().then(({ data, error }) => {
      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setStatus(data.status ?? "bought");
      setCategory(data.category ?? "");
      setListingUrl(data.listing_url ?? "");
      setBuyPrice(data.buy_price != null ? String(data.buy_price) : "");
      setSellPrice(data.sell_price != null ? String(data.sell_price) : "");
      setActualSell(data.actual_sell != null ? String(data.actual_sell) : "");
      setListedAt(toDateTimeLocal(data.listed_at));
      setSoldAt(toDateTimeLocal(data.sold_at));
      setExistingImageUrl(data.image_url ?? null);
      setLoading(false);
    });
  }, [id]);

  function handleStatusChange(s: string) {
    setStatus(s);
    if (s === "sold") setTimeout(() => actualSellRef.current?.focus(), 50);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);

    try {
      let imageUrl = existingImageUrl;

      if (newImage) {
        const fileExt = newImage.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const toUpload = await compressImage(newImage);
        const { error: uploadError } = await supabase.storage.from("flip-images").upload(fileName, toUpload, { cacheControl: "3600", upsert: false });
        if (uploadError) { setError("Photo upload failed: " + uploadError.message); setSaving(false); return; }
        const { data: publicUrlData } = supabase.storage.from("flip-images").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error: updateError } = await supabase.from("flip_posts").update({
        title: title.trim(),
        description: description.trim() || null,
        status: status || null,
        category: category.trim() || null,
        listing_url: listingUrl.trim() || null,
        buy_price: buyPrice ? Number(buyPrice) : null,
        sell_price: sellPrice ? Number(sellPrice) : null,
        actual_sell: actualSell ? Number(actualSell) : null,
        listed_at: fromDateTimeLocal(listedAt),
        sold_at: fromDateTimeLocal(soldAt),
        image_url: imageUrl,
      }).eq("id", id);

      if (updateError) { setError("Couldn't save: " + updateError.message); return; }
      setSaved(true);
      setNewImage(null);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this flip? Can't undo this.")) return;
    setDeleting(true);
    const { error } = await supabase.from("flip_posts").delete().eq("id", id);
    if (error) { setError("Delete failed: " + error.message); setDeleting(false); return; }
    router.push("/dashboard");
  };

  const estProfit = actualSell && buyPrice
    ? Number(actualSell) - Number(actualSell) * EBAY_FEE - Number(buyPrice)
    : null;

  if (loading) return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b16] text-white/30 text-sm">
      Loading flip...
    </main>
  );

  if (notFound) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0d0b16] text-white px-4">
      <p className="text-white/50">Can't find that flip.</p>
      <Link href="/dashboard" className="rounded-2xl bg-purple-600 px-6 py-2.5 text-sm font-black text-white">← Back to Dashboard</Link>
    </main>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.14),transparent_38%)]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-8 pb-36 md:pb-12">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
              NoBSFlips / Edit
            </div>
            <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">Edit Flip</h1>
          </div>
          <Link href="/dashboard" className="mt-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/40 transition hover:text-white">
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">What is it?</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-500/20 transition" />
          </div>

          {/* Buy price + status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">You paid</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/30">$</span>
                <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="0.00" min="0" step="0.01"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-8 pr-4 text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-500/20 transition" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Status</label>
              <div className="flex gap-1.5">
                {(["bought", "listed", "sold"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => handleStatusChange(s)}
                    className={"flex-1 rounded-xl border py-3 text-[10px] font-black uppercase tracking-wide transition " +
                      (status === s
                        ? s === "bought" ? "border-blue-400/40 bg-blue-500/20 text-blue-300"
                          : s === "listed" ? "border-yellow-400/40 bg-yellow-500/20 text-yellow-300"
                          : "border-green-400/40 bg-green-500/20 text-green-300"
                        : "border-white/10 text-white/30 hover:text-white/60")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sold price — shown when status is sold */}
          {status === "sold" && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-green-400">
                What did it sell for?
                {!actualSell && <span className="ml-2 normal-case font-normal text-green-400/60">← enter the sale price</span>}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-green-400/50">$</span>
                <input ref={actualSellRef} type="number" value={actualSell} onChange={(e) => setActualSell(e.target.value)} placeholder="0.00" min="0" step="0.01"
                  className="w-full rounded-2xl border border-green-500/40 bg-black/40 py-3 pl-8 pr-4 text-xl font-black text-white outline-none placeholder:text-white/20 focus:border-green-400/60 transition" />
              </div>
              {estProfit !== null && (
                <p className={"mt-2 text-xs font-black " + (estProfit >= 0 ? "text-green-300" : "text-red-300")}>
                  {estProfit >= 0 ? "+" : ""}${estProfit.toFixed(2)} after eBay fees
                </p>
              )}
            </div>
          )}

          {/* Photo */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Photo</label>
            {existingImageUrl && !newImage && (
              <img src={existingImageUrl} alt="Current photo" className="mb-2 h-20 w-20 rounded-xl object-cover border border-white/10" />
            )}
            <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)} className="hidden" />
            <label htmlFor="photo-upload" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-purple-400/40 hover:bg-purple-500/10">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white/70">{newImage ? newImage.name : existingImageUrl ? "Replace photo" : "Add a photo"}</p>
                {!newImage && <p className="text-xs text-white/30">Camera · Photos · Files</p>}
              </div>
              {newImage && <span className="shrink-0 text-[10px] font-black uppercase text-green-400">Ready ✓</span>}
            </label>
          </div>

          {/* More details toggle */}
          <button type="button" onClick={() => setShowMore((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-wide text-white/40 transition hover:text-white/60">
            <span>{showMore ? "Hide extra details" : "More details"}</span>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className={"h-4 w-4 transition-transform " + (showMore ? "rotate-180" : "")}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showMore && (
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-purple-400/50 transition">
                  <option value="" className="bg-[#0d0b16]">Select category</option>
                  {["Video Games", "DVDs", "Electronics", "Collectibles", "Books", "Clothing", "Other"].map((c) => (
                    <option key={c} value={c} className="bg-[#0d0b16]">{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Target sell price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/30">$</span>
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="0.00" min="0" step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-8 pr-4 text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 transition" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">eBay listing URL</label>
                <input type="url" value={listingUrl} onChange={(e) => setListingUrl(e.target.value)} placeholder="https://ebay.com.au/itm/..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Listed date</label>
                <input type="datetime-local" value={listedAt} onChange={(e) => setListedAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-purple-400/50 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Sold date</label>
                <input type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-purple-400/50 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Notes</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Condition, faults, anything worth remembering..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 transition" />
              </div>
            </div>
          )}

          {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <button type="submit" disabled={saving || !title.trim()}
            className={"w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.1em] shadow-lg transition " +
              (saved
                ? "border border-green-500/30 bg-green-500/10 text-green-400"
                : "bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 shadow-purple-900/40")}>
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save Changes"}
          </button>

          <button type="button" onClick={handleDelete} disabled={deleting}
            className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 py-3 text-sm font-black uppercase tracking-[0.08em] text-red-400/70 transition hover:bg-red-500/15 hover:text-red-300 disabled:opacity-50">
            {deleting ? "Deleting..." : "Delete Flip"}
          </button>
        </form>
      </div>
    </main>
  );
}
