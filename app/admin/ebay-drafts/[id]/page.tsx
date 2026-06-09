"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditEbayDraftPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [image, setImage] = useState<File | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [description, setDescription] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");

  const [condition, setCondition] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [postageNotes, setPostageNotes] = useState("");
  const [notes, setNotes] = useState("");

  const [buyPrice, setBuyPrice] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [finalPrice, setFinalPrice] = useState("");

  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDraft() {
      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("ebay_drafts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMessage("Error loading draft: " + error.message);
        setLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      setGeneratedTitle(data.generated_title ?? "");
      setDescription(data.description ?? "");
      setGeneratedDescription(data.generated_description ?? "");
      setCondition(data.condition ?? "");
      setCategoryId(data.category_id ?? "");
      setBrand(data.item_specifics?.Brand ?? "");
      setPostageNotes(data.postage_notes ?? "");
      setNotes(data.notes ?? "");
      setBuyPrice(data.buy_price?.toString() ?? "");
      setSuggestedPrice(data.suggested_price?.toString() ?? "");
      setFinalPrice(data.final_price?.toString() ?? "");
      setStatus(data.status ?? "draft");
      setPhotoUrls(data.photo_urls ?? []);

      setLoading(false);
    }

    if (id) loadDraft();
  }, [id]);

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    setMessage("");

    try {
      let updatedPhotoUrls = [...photoUrls];

      if (image) {
        const fileExt = image.name.split(".").pop() || "jpg";
        const fileName = `ebay-drafts/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("flip-images")
          .upload(fileName, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setMessage("Upload error: " + uploadError.message);
          setSaving(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("flip-images")
          .getPublicUrl(fileName);

        updatedPhotoUrls = [...updatedPhotoUrls, publicUrlData.publicUrl];
      }

      const { error } = await supabase
        .from("ebay_drafts")
        .update({
          title: title.trim(),
          generated_title: generatedTitle.trim() || null,
          description: description.trim() || null,
          generated_description: generatedDescription.trim() || null,
          condition: condition.trim() || null,
          category_id: categoryId.trim() || null,
          item_specifics: {
            Brand: brand.trim() || "",
          },
          postage_notes: postageNotes.trim() || null,
          notes: notes.trim() || null,
          buy_price: buyPrice ? Number(buyPrice) : null,
          suggested_price: suggestedPrice ? Number(suggestedPrice) : null,
          final_price: finalPrice ? Number(finalPrice) : null,
          photo_urls: updatedPhotoUrls,
          status: newStatus ?? status,
        })
        .eq("id", id);

      if (error) {
        setMessage("Error: " + error.message);
        setSaving(false);
        return;
      }

      setPhotoUrls(updatedPhotoUrls);
      setImage(null);
      if (newStatus) setStatus(newStatus);

      setMessage(newStatus === "ready" ? "Draft marked ready." : "Draft saved.");
    } catch (err) {
      setMessage(
        err instanceof Error ? `Error: ${err.message}` : "Unexpected error."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInventory = async () => {
    setPublishing(true);
    setMessage("");

    try {
      await handleSave("ready");

      const response = await fetch(`/api/ebay-drafts/${id}/publish`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error ?? "Failed to create eBay inventory.");
        return;
      }

      setStatus(result.status ?? "inventory_created");
      setMessage(
        result.listingId
          ? `eBay listing published. Listing ID: ${result.listingId}`
          : `eBay inventory created. SKU: ${result.sku}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unexpected publish error."
      );
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07070a] px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/10 bg-[#0f1016] p-8">
          <p className="text-sm text-white/60">Loading eBay draft...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            NoBSFlip / eBay Draft Review
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
            Review eBay draft.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
            Clean up the Discord draft, set the final price, check the photos,
            then mark it ready before publishing to eBay.
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr,0.38fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Basic Title From Discord
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Final eBay Title
                </label>
                <input
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  placeholder="Generated eBay-friendly title"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Raw Notes / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Final eBay Description
                </label>
                <textarea
                  value={generatedDescription}
                  onChange={(e) => setGeneratedDescription(e.target.value)}
                  rows={8}
                  placeholder="Clean eBay listing description..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Buy Price
                  </label>
                  <input
                    type="number"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Suggested Price
                  </label>
                  <input
                    type="number"
                    value={suggestedPrice}
                    onChange={(e) => setSuggestedPrice(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Final Price
                  </label>
                  <input
                    type="number"
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Condition
                  </label>
                  <input
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="Used, good condition"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Brand
                  </label>
                  <input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Sony"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    eBay Category ID
                  </label>
                  <input
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Postage Notes
                </label>
                <textarea
                  value={postageNotes}
                  onChange={(e) => setPostageNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                  Add Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
                />
              </div>

              {photoUrls.length > 0 && (
                <div className="grid gap-4 md:grid-cols-3">
                  {photoUrls.map((url) => (
                    <div
                      key={url}
                      className="relative h-48 overflow-hidden rounded-2xl border border-white/10 bg-black"
                    >
                      <Image
                        src={url}
                        alt="Draft photo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  disabled={saving || publishing}
                  onClick={() => handleSave()}
                  className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  disabled={saving || publishing}
                  onClick={() => handleSave("ready")}
                  className="rounded-2xl bg-[#8cff00] px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
                >
                  Mark Ready
                </button>

                <button
                  type="button"
                  disabled={saving || publishing}
                  onClick={handleCreateInventory}
                  className="rounded-2xl bg-purple-500 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {publishing ? "Creating Inventory..." : "Create eBay Inventory"}
                </button>

                {message && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Draft Status
              </p>

              <h2 className="mt-4 text-2xl font-black">{status}</h2>

              <p className="mt-4 text-sm leading-7 text-white/65">
                Draft means it still needs work. Ready means it has been
                checked. Published means it has been pushed live to eBay.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                Draft ID
              </p>

              <p className="mt-4 break-all text-sm text-white/70">{id}</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}