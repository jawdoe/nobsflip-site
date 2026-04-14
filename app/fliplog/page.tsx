import { supabase } from "@/lib/supabase";

type FlipPost = {
  id: string;
  title: string | null;
  description: string | null;
  status: string | null;
  buy_price: number | null;
  sell_price: number | null;
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

        <div className="mt-10 space-y-6">
          {posts.length > 0 ? (
            posts.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
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
                    Buy: ${item.buy_price ?? 0}
                  </span>
                  <span className="rounded-lg bg-gray-50 px-3 py-2">
                    Sell: ${item.sell_price ?? 0}
                  </span>
                </div>
              </article>
            ))
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