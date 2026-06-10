import Link from "next/link";
import { supabase } from "@/lib/supabase";

type EbayDraft = {
  id: string;
  title: string;
  generated_title: string | null;
  buy_price: number | null;
  suggested_price: number | null;
  final_price: number | null;
  status: string;
  created_at: string;
};

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return "-";

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Melbourne",
  }).format(new Date(value));
}

export const dynamic = "force-dynamic";

export default async function EbayDraftsPage() {
  const { data: drafts, error } = await supabase
    .from("ebay_drafts")
    .select(
      "id, title, generated_title, buy_price, suggested_price, final_price, status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#0d0b16] p-8 text-white">
        <h1 className="text-3xl font-black">eBay Drafts</h1>
        <p className="mt-4 text-red-300">Error loading drafts: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b16] text-white">
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            NoBSFlip / eBay Drafts
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
            eBay Draft Review Queue
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
            Review Discord-created drafts before pushing them to eBay.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1016]/90">
          {!drafts || drafts.length === 0 ? (
            <div className="p-8 text-white/65">No eBay drafts found yet.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {(drafts as EbayDraft[]).map((draft) => (
                <div
                  key={draft.id}
                  className="grid gap-4 p-6 md:grid-cols-[1fr,120px,120px,120px,120px]"
                >
                  <div>
                    <p className="text-lg font-black">
                      {draft.generated_title || draft.title}
                    </p>

                    <p className="mt-2 text-sm text-white/50">
                      Created {formatDate(draft.created_at)}
                    </p>

                    <p className="mt-1 break-all text-xs text-white/35">
                      {draft.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Status
                    </p>
                    <p className="mt-2 font-semibold text-white/80">
                      {draft.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Buy
                    </p>
                    <p className="mt-2 font-semibold text-white/80">
                      {formatMoney(draft.buy_price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      Final
                    </p>
                    <p className="mt-2 font-semibold text-white/80">
                      {formatMoney(draft.final_price)}
                    </p>
                  </div>

                  <div className="flex items-center md:justify-end">
                    <Link
                      href={`/admin/ebay-drafts/${draft.id}`}
                      className="rounded-2xl bg-[#8cff00] px-5 py-3 text-sm font-bold text-black transition hover:scale-[1.02]"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}