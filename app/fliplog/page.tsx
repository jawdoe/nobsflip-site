export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import FlipLogClient from "./FlipLogClient";

export type FlipItem = {
  id: string;
  title: string;
  buy: number;
  sell: number;
  notes: string;
  photoUrl: string | null;
  addedBy: string;
  createdAt: string;
  createdAtDisplay: string;
  status: "active" | "sold";
  soldAt: string | null;
  soldAtDisplay: string | null;
  actualSell: number | null;
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return null;

  return new Intl.DateTimeFormat("en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Australia/Melbourne",
  }).format(new Date(dateString));
}

export default async function FlipLogPage() {
  const { data, error } = await supabase
    .from("flip_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#07070a] text-white p-10">
        <h1 className="text-4xl font-black uppercase">
          Could not load flip log
        </h1>

        <p className="mt-4 text-white/70">
          Supabase returned an error while loading the live flip data.
        </p>

        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-red-200">{error.message}</p>
        </div>
      </main>
    );
  }

  const flips: FlipItem[] = (data ?? []).map((flip) => {
    const createdAt = String(
      flip.created_at ?? new Date().toISOString()
    );

    const soldAt = flip.sold_at
      ? String(flip.sold_at)
      : null;

    const isSold = flip.status === "sold";

    return {
      id: String(flip.id),

      title: String(flip.title ?? "Untitled Flip"),

      buy: Number(flip.buy_price ?? 0),

      sell: Number(flip.sell_price ?? 0),

      notes: String(flip.description ?? ""),

      photoUrl: flip.image_url ?? null,

      addedBy: String(flip.created_by ?? "jawdoe"),

      createdAt,

      createdAtDisplay:
        formatDateTime(createdAt) ?? "",

      status: isSold ? "sold" : "active",

      soldAt,

      soldAtDisplay:
        formatDateTime(soldAt),

      actualSell: isSold
        ? Number(
            flip.actual_sell ??
              flip.sell_price ??
              0
          )
        : null,
    };
  });

  return <FlipLogClient flips={flips} />;
}