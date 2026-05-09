# NoBSFlip Codex Handoff

This file is a clean handoff of the current working setup.

## What is already working

- Next.js app on Vercel
- Supabase database connection
- Flip log page reading data from `flip_posts`
- Admin page adding flips
- Edit page updating existing flips
- Image uploads to Supabase Storage
- Admin password gate
- Status flow: bought / listed / sold
- Profit tracking on the flip log
- Optimized images using `next/image`

## Project structure

```text
nobsflip-site/
├── app/
│   ├── about/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── page.tsx
│   ├── fliplog/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase.ts
├── .env.local
├── next.config.ts
├── package.json
└── ...
```

## Required environment variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_ADMIN_PASSWORD=yourpassword123
```

## Required package

```bash
npm install @supabase/supabase-js
```

## Supabase database

### Table: `flip_posts`

Columns:

- `id` uuid primary key default gen_random_uuid()
- `created_at` timestamptz default now()
- `title` text
- `description` text
- `status` text
- `buy_price` numeric
- `sell_price` numeric
- `image_url` text

### SQL to create table

```sql
create table public.flip_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  status text,
  buy_price numeric,
  sell_price numeric,
  image_url text
);
```

### RLS / policies used

```sql
alter table public.flip_posts enable row level security;

create policy "Allow public read on flip_posts"
on public.flip_posts
for select
to anon
using (true);

create policy "Allow public insert on flip_posts"
on public.flip_posts
for insert
to anon
with check (true);

create policy "Allow public update on flip_posts"
on public.flip_posts
for update
to anon
using (true)
with check (true);
```

## Supabase Storage

### Bucket

Create a public bucket named:

```text
flip-images
```

### Storage policies

```sql
create policy "Allow anon upload to flip-images"
on storage.objects
for insert
to anon
with check (bucket_id = 'flip-images');

create policy "Allow public read from flip-images"
on storage.objects
for select
to anon
using (bucket_id = 'flip-images');
```

## File: `lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## File: `next.config.ts`

Replace `YOUR_PROJECT_ID` with your actual Supabase project id.

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "YOUR_PROJECT_ID.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/flip-images/**",
      },
    ],
  },
};

export default nextConfig;
```

## File: `app/admin/page.tsx`

```tsx
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

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          >
            <option value="">Select status</option>
            <option value="bought">Bought</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>

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
```

## File: `app/admin/edit/[id]/page.tsx`

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type EditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditFlipPage({ params }: EditPageProps) {
  const router = useRouter();

  const [id, setId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadParamsAndItem() {
      const resolvedParams = await params;
      const flipId = resolvedParams.id;
      setId(flipId);

      const { data, error } = await supabase
        .from("flip_posts")
        .select("*")
        .eq("id", flipId)
        .single();

      if (error) {
        setMessage("Error loading item: " + error.message);
        setLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      setDescription(data.description ?? "");
      setStatus(data.status ?? "");
      setBuyPrice(data.buy_price?.toString() ?? "");
      setSellPrice(data.sell_price?.toString() ?? "");
      setExistingImageUrl(data.image_url ?? null);
      setLoading(false);
    }

    loadParamsAndItem();
  }, [params]);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let imageUrl = existingImageUrl;

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
          setSaving(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("flip-images")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("flip_posts")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          status: status || null,
          buy_price: buyPrice ? Number(buyPrice) : null,
          sell_price: sellPrice ? Number(sellPrice) : null,
          image_url: imageUrl,
        })
        .eq("id", id);

      if (error) {
        setMessage("Error: " + error.message);
        setSaving(false);
        return;
      }

      router.push("/fliplog");
      router.refresh();
    } catch (err) {
      setMessage(
        err instanceof Error ? `Error: ${err.message}` : "Unexpected error."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-16 text-black">
        <section className="mx-auto max-w-xl">
          <p>Loading flip...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl font-bold">Edit Flip</h1>

        <form onSubmit={handleUpdate} className="mt-8 space-y-4">
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

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border p-3"
            required
          >
            <option value="">Select status</option>
            <option value="bought">Bought</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>

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

          {existingImageUrl && (
            <div className="overflow-hidden rounded-xl border">
              <img
                src={existingImageUrl}
                alt={title || "Current flip image"}
                className="h-48 w-full object-cover"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update Flip"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
      </section>
    </main>
  );
}
```

## File: `app/fliplog/page.tsx`

```tsx
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FlipPost = {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  buy_price: number | null;
  sell_price: number | null;
  image_url: string | null;
};

export default async function FlipLogPage() {
  const { data, error } = await supabase
    .from("flip_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-white text-black">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-3xl font-bold">Flip Log</h1>
          <p className="mt-4 text-red-600">Error: {error.message}</p>
        </section>
      </main>
    );
  }

  const posts = (data ?? []) as FlipPost[];

  const totalSpent = posts.reduce((sum, item) => sum + (item.buy_price ?? 0), 0);

  const soldPosts = posts.filter((item) => item.status === "sold");

  const totalSold = soldPosts.reduce(
    (sum, item) => sum + (item.sell_price ?? 0),
    0
  );

  const soldCost = soldPosts.reduce(
    (sum, item) => sum + (item.buy_price ?? 0),
    0
  );

  const totalProfit = totalSold - soldCost;

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-500">
              Live Results
            </p>
            <h1 className="text-3xl font-bold">Flip Log</h1>
          </div>

          <p className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="mt-2 text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Sold</p>
            <p className="mt-2 text-2xl font-bold">${totalSold.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Realised Profit</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                totalProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${totalProfit.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Unsold Items</p>
            <p className="mt-2 text-2xl font-bold">
              {posts.filter((item) => item.status !== "sold").length}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {posts.length > 0 ? (
            posts.map((item) => {
              const buyPrice = item.buy_price ?? 0;
              const sellPrice = item.sell_price ?? 0;
              const realisedProfit =
                item.status === "sold" ? sellPrice - buyPrice : null;

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  {item.image_url && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <Image
                        src={item.image_url}
                        alt={item.title || "Flip image"}
                        width={1200}
                        height={800}
                        sizes="(max-width: 768px) 100vw, 768px"
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-black">
                        {item.title || "Untitled item"}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-700">
                      {item.status || "unknown"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <Link
                      href={`/admin/edit/${item.id}`}
                      className="inline-flex rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >
                      Edit Flip
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Buy: ${buyPrice.toFixed(2)}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Sell: ${sellPrice.toFixed(2)}
                    </span>

                    {realisedProfit !== null ? (
                      <span
                        className={`rounded-lg px-3 py-2 font-medium ${
                          realisedProfit >= 0
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        Profit: ${realisedProfit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-yellow-50 px-3 py-2 font-medium text-yellow-700">
                        Profit pending
                      </span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-gray-500">
              No entries found in Supabase yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
```
