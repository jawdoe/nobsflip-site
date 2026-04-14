import Image from "next/image";
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

  const totalSpent = posts.reduce(
    (sum, item) => sum + (item.buy_price ?? 0),
    0
  );

  const totalSold = posts.reduce(
    (sum, item) => sum + (item.sell_price ?? 0),
    0
  );

  const totalProfit = totalSold - totalSpent;

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
            <p className="text-sm text-gray-500">Total Profit</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                totalProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${totalProfit.toFixed(2)}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Flips</p>
            <p className="mt-2 text-2xl font-bold">{posts.length}</p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {posts.length > 0 ? (
            posts.map((item) => {
              const buyPrice = item.buy_price ?? 0;
              const sellPrice = item.sell_price ?? 0;
              const profit = sellPrice - buyPrice;

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

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Buy: ${buyPrice.toFixed(2)}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Sell: ${sellPrice.toFixed(2)}
                    </span>
                    <span
                      className={`rounded-lg px-3 py-2 font-medium ${
                        profit >= 0
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      Profit: ${profit.toFixed(2)}
                    </span>
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