"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    setMessage("");

    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAuthenticated(true);
      return;
    }

    setMessage("Wrong password");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    setLoading(true);
    setMessage("");

    try {
      let imageUrl: string | null = null;

      if (image) {
        const fileExt = image.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random()
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
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("flip-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("flip_posts").insert([
        {
          title: title.trim(),
          description: description.trim() || null,
          status: status || null,
          buy_price: buyPrice ? Number(buyPrice) : null,
          sell_price: sellPrice ? Number(sellPrice) : null,
          image_url: imageUrl,
        },
      ]);

      if (error) {
        setMessage("Error: " + error.message);
        setLoading(false);
        return;
      }

      setMessage("Post added!");
      setTitle("");
      setDescription("");
      setStatus("");
      setBuyPrice("");
      setSellPrice("");
      setImage(null);
      form.reset();
    } catch (err) {
      setMessage(
        err instanceof Error ? `Error: ${err.message}` : "Unexpected error."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,119,255,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
          <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />

          <section className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center justify-center px-6 py-16 md:px-8">
            <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                NoBSFlip / Admin
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-white">
                Admin Login
              </h1>

              <p className="mt-4 text-sm leading-7 text-white/65">
                Enter the admin password to access the private flip posting area.
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:scale-[1.01]"
                >
                  Login
                </button>
              </div>

              {message ? (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {message}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,119,255,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:40px_40px]" />

        <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
              NoBSFlip / Admin
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-white md:text-6xl">
              Add a new flip.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
              Use this page to add a new item, upload a photo, track prices, and
              post it into your flip system.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1fr,0.38fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="PS3 Controller"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Description / Notes
                    </label>
                    <textarea
                      placeholder="Condition, testing notes, bundle details, anything useful..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-white/20 focus:bg-white/[0.06]"
                      required
                    >
                      <option value="" className="bg-[#0f1016] text-white">
                        Select status
                      </option>
                      <option value="bought" className="bg-[#0f1016] text-white">
                        Bought
                      </option>
                      <option value="listed" className="bg-[#0f1016] text-white">
                        Listed
                      </option>
                      <option value="sold" className="bg-[#0f1016] text-white">
                        Sold
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-[0.8rem] text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-white/90"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Buy Price
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Sell Price
                    </label>
                    <input
                      type="number"
                      placeholder="25"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-white/20 focus:bg-white/[0.06]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Adding..." : "Add Flip"}
                  </button>

                  {message ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                      {message}
                    </div>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Quick Notes
                </p>

                <h2 className="mt-4 text-2xl font-black tracking-tight">
                  What this form does
                </h2>

                <ul className="mt-5 space-y-3 text-sm leading-7 text-white/65">
                  <li>• Uploads an image to Supabase Storage</li>
                  <li>• Saves the post into your flip posts table</li>
                  <li>• Tracks status and buy/sell values</li>
                  <li>• Gives you a quick way to update from your phone later</li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-[#0f1016]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                  Current Input
                </p>

                <div className="mt-5 space-y-4 text-sm text-white/70">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Title
                    </p>
                    <p className="mt-2 font-medium text-white/85">
                      {title || "Not set yet"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Status
                    </p>
                    <p className="mt-2 font-medium text-white/85">
                      {status || "Not selected"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Buy / Sell
                    </p>
                    <p className="mt-2 font-medium text-white/85">
                      {buyPrice || "-"} / {sellPrice || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Image
                    </p>
                    <p className="mt-2 font-medium text-white/85">
                      {image?.name || "No image selected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}