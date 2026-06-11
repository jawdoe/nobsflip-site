"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/compress-image";

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [status, setStatus] = useState("bought");
  // extra fields
  const [showMore, setShowMore] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDone(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not signed in."); setLoading(false); return; }

      let imageUrl: string | null = null;
      if (image) {
        const ext = image.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const compressed = await compressImage(image);
        const { error: uploadError } = await supabase.storage.from("flip-images").upload(fileName, compressed, { cacheControl: "3600", upsert: false });
        if (uploadError) { setError("Photo upload failed: " + uploadError.message); setLoading(false); return; }
        const { data: urlData } = supabase.storage.from("flip-images").getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error: insertError } = await supabase.from("flip_posts").insert([{
        user_id: user.id,
        title: title.trim(),
        buy_price: buyPrice ? Number(buyPrice) : null,
        status,
        description: description.trim() || null,
        category: category || null,
        listing_url: listingUrl.trim() || null,
        sell_price: sellPrice ? Number(sellPrice) : null,
        image_url: imageUrl,
      }]);

      if (insertError) { setError("Error: " + insertError.message); setLoading(false); return; }

      // Reset
      setTitle(""); setBuyPrice(""); setStatus("bought"); setImage(null);
      setDescription(""); setCategory(""); setListingUrl(""); setSellPrice("");
      setShowMore(false);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_40%)]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pt-8 pb-36 md:pb-12">
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight">Add a Flip</h1>
          <p className="mt-1 text-sm text-white/40">Log what you just picked up.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Core fields */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">What is it?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="PS3 Controller, Nike Air Max, etc."
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-500/20 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">You paid</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-white/30">$</span>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-8 pr-4 text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 focus:ring-1 focus:ring-purple-500/20 transition"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Status</label>
              <div className="flex gap-1.5">
                {(["bought", "listed", "sold"] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
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

          {/* Photo */}
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Photo</label>
            <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="hidden" />
            <label htmlFor="photo-upload" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-purple-400/40 hover:bg-purple-500/10">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5 shrink-0 text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-white/70">{image ? image.name : "Take photo or choose from library"}</p>
                {!image && <p className="text-xs text-white/30">Camera · Photos · Files</p>}
              </div>
              {image && <span className="shrink-0 text-[10px] font-black uppercase text-green-400">Ready ✓</span>}
            </label>
          </div>

          {/* More details toggle */}
          <button type="button" onClick={() => setShowMore((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-wide text-white/40 transition hover:text-white/60">
            <span>{showMore ? "Hide extra details" : "Add more details"}</span>
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
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">Notes</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                  placeholder="Condition, what to watch out for, anything useful..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/50 transition" />
              </div>
            </div>
          )}

          {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

          <button type="submit" disabled={loading || !title.trim()}
            className={"w-full rounded-2xl py-4 text-sm font-black uppercase tracking-[0.1em] shadow-lg transition " +
              (done
                ? "border border-green-500/30 bg-green-500/10 text-green-400"
                : "bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 shadow-purple-900/40")}>
            {done ? "Flip Added ✓" : loading ? "Adding..." : "Add Flip"}
          </button>
        </form>
      </div>
    </main>
  );
}
