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
          status: status.trim() || null,
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
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
        <section className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Admin Login</h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter the admin password to post flips.
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border p-3"
            />

            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-lg bg-black p-3 text-white"
            >
              Login
            </button>
          </div>

          {message && (
            <p className="mt-4 text-center text-sm text-red-600">{message}</p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl font-bold">Add Flip</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border p-3"
            rows={4}
          />

          <input
            type="text"
            placeholder="Status (bought, listed, sold)"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="number"
            placeholder="Buy Price"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
            min="0"
            step="0.01"
          />

          <input
            type="number"
            placeholder="Sell Price"
            value={sellPrice}
            onChange={(e) => setSellPrice(e.target.value)}
            className="w-full rounded-lg border p-3"
            min="0"
            step="0.01"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Flip"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </section>
    </main>
  );
}