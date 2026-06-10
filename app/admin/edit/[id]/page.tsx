"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function EditFlipPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);

  const toDateTimeLocal = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // format: YYYY-MM-DDTHH:MM
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
      setStatus(data.status ?? "");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let imageUrl = existingImageUrl;

      if (newImage) {
        const fileExt = newImage.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("flip-images").upload(fileName, newImage, { cacheControl: "3600", upsert: false });
        if (uploadError) { setMessage("Upload error: " + uploadError.message); setSaving(false); return; }
        const { data: publicUrlData } = supabase.storage.from("flip-images").getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("flip_posts").update({
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

      if (error) { setMessage("Error: " + error.message); setSaving(false); return; }
      setMessage("Saved!");
      setNewImage(null);
    } catch (err) {
      setMessage(err instanceof Error ? `Error: ${err.message}` : "Unexpected error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this flip? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("flip_posts").delete().eq("id", id);
    if (error) { setMessage("Delete failed: " + error.message); setDeleting(false); return; }
    router.push("/dashboard");
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#07070a] text-white/30 text-sm">Loading...</main>;

  if (notFound) return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07070a] text-white">
      <p className="text-white/50">Flip not found.</p>
      <Link href="/dashboard" className="rounded-2xl bg-purple-600 px-6 py-2.5 text-sm font-black text-white">Back to Dashboard</Link>
    </main>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#07070a] to-[#07070a]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-8 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-purple-300">
              NoBSFlip / Edit Flip
            </div>
            <h1 className="mt-4 text-3xl font-black uppercase tracking-tight text-white md:text-5xl">Edit Flip</h1>
          </div>
          <Link href="/dashboard" className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-black text-white/50 hover:text-white transition">
            ← Dashboard
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr,0.42fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Notes</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                    className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
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
                  <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Listed / Target Price</label>
                  <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/45">Actual Sold Price</label>
                  <input type="number" value={actualSell} onChange={(e) => setActualSell(e.target.value)} min="0" step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-white outline-none transition focus:border-purple-400/45 focus:bg-purple-500/[0.08]" />
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
                  {existingImageUrl && !newImage && (
                    <img src={existingImageUrl} alt="Current photo" className="mb-3 h-24 w-24 rounded-2xl object-cover border border-white/10" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-[0.8rem] text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-purple-500" />
                  {existingImageUrl && <p className="mt-1.5 text-xs text-white/30">Pick a new file to replace the existing photo.</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" disabled={saving}
                  className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:scale-[1.01] hover:bg-purple-500 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={handleDelete} disabled={deleting}
                  className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-red-300 transition hover:bg-red-500/20 disabled:opacity-60">
                  {deleting ? "Deleting..." : "Delete Flip"}
                </button>
                {message && (
                  <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-3 text-sm font-bold text-purple-100">{message}</div>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">Quick Status</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["bought", "listed", "sold"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={"rounded-2xl border py-3 text-xs font-black uppercase tracking-[0.08em] transition " + (status === s ? "border-purple-400/40 bg-purple-500/20 text-purple-200" : "border-white/10 text-white/40 hover:text-white")}>
                  {s}
                </button>
              ))}
            </div>
            {existingImageUrl && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-white/40">Current Photo</p>
                <img src={existingImageUrl} alt="Flip photo" className="w-full rounded-2xl object-cover border border-white/10 max-h-48" />
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
