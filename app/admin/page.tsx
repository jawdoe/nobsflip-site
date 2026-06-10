"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminPage() {
  const supabase = createSupabaseBrowserClient();
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [actualSell, setActualSell] = useState("");
  const [listedAt, setListedAt] = useState("");
  const [soldAt, setSoldAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fromDateTimeLocal = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const resetForm = (form: HTMLFormElement) => {
    setTitle(""); setDescription(""); setStatus(""); setCategory("");
    setListingUrl(""); setBuyPrice(""); setSellPrice(""); setActualSell("");
    setListedAt(""); setSoldAt(""); setImage(null);
    form.reset();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMessage("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMessage("Not signed in."); setLoading(false); return; }

      let imageUrl: string | null = null;

      if (image) {
        const fileExt = image.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("flip-images").upload(fileName, image, { cacheControl: "3600", upsert: false });
        if (uploadError) { setMessage("Upload error: " + uploadError.message); setLoading(false); return; }
        const { data: publicUrlData } = supabase.storage.from("flip-images").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("flip_posts").insert([{
        user_id: user.id,
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
      }]);

      if (error) { setMessage("Error: " + error.message); setLoading(false); return; }

      setMessage("Flip added!");
      resetForm(form);
    } catch (err) {
      setMessage(err instanceof Error ? `Error: ${err.message}` : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_32%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#07070a] to-[#07070a]" />
        <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-8 md:py-16">
        <div className="max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-300">
            NoBSFlip / Add Flip
          </div>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-white md:text-6xl">Add a new flip.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg">Track what you bought, what you listed it for, what it sold for, and what you learned.</p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr,0.42fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Title</label>
                  <input type="text" placeholder="PS3 Controller" value={title} onChange={(e) => setTitle(e.target.value)} required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Notes / Lesson Learned</label>
                  <textarea placeholder="Condition, testing notes, what worked, what failed..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                    className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]">
                    <option value="" className="bg-[#0f1016]">Select status</option>
                    <option value="bought" className="bg-[#0f1016]">Bought</option>
                    <option value="listed" className="bg-[#0f1016]">Listed</option>
                    <option value="sold" className="bg-[#0f1016]">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]">
                    <option value="" className="bg-[#0f1016]">Select category</option>
                    <option value="Video Games" className="bg-[#0f1016]">Video Games</option>
                    <option value="DVDs" className="bg-[#0f1016]">DVDs</option>
                    <option value="Electronics" className="bg-[#0f1016]">Electronics</option>
                    <option value="Collectibles" className="bg-[#0f1016]">Collectibles</option>
                    <option value="Books" className="bg-[#0f1016]">Books</option>
                    <option value="Clothing" className="bg-[#0f1016]">Clothing</option>
                    <option value="Other" className="bg-[#0f1016]">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Buy Price</label>
                  <input type="number" placeholder="5" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Listed / Target Price</label>
                  <input type="number" placeholder="25" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Actual Sold Price</label>
                  <input type="number" placeholder="20" value={actualSell} onChange={(e) => setActualSell(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Listed Date</label>
                  <input type="datetime-local" value={listedAt} onChange={(e) => setListedAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Sold Date</label>
                  <input type="datetime-local" value={soldAt} onChange={(e) => setSoldAt(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">eBay Listing URL</label>
                  <input type="url" placeholder="https://www.ebay.com.au/itm/..." value={listingUrl} onChange={(e) => setListingUrl(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-[0.8rem] text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-purple-500" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={loading}
                  className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:scale-[1.01] hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Adding..." : "Add Flip"}
                </button>
                {message && (
                  <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-100">{message}</div>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">Current Input</p>
              <div className="mt-5 space-y-4 text-sm text-white/70">
                <Summary label="Title" value={title || "Not set yet"} />
                <Summary label="Status" value={status || "Not selected"} />
                <Summary label="Category" value={category || "Not set"} />
                <Summary label="Buy / Listed / Sold" value={`${buyPrice || "-"} / ${sellPrice || "-"} / ${actualSell || "-"}`} />
                <Summary label="Listed / Sold Dates" value={`${listedAt || "-"} / ${soldAt || "-"}`} />
                <Summary label="Image" value={image?.name || "No image selected"} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 break-all font-medium text-white/85">{value}</p>
    </div>
  );
}
