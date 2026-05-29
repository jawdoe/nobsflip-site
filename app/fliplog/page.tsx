export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

type FilterStatus = "all" | "active" | "sold";
type SortMode =
  | "newest"
  | "oldest"
  | "highestProfit"
  | "highestROI"
  | "lowestBuy";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

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

function getProfit(flip: FlipItem) {
  const saleValue =
    flip.status === "sold" ? flip.actualSell ?? flip.sell : flip.sell;

  return saleValue - flip.buy;
}

function getROI(flip: FlipItem) {
  if (flip.buy <= 0) return 0;
  return (getProfit(flip) / flip.buy) * 100;
}

function FloatingBackButton() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-purple-300/30 bg-purple-600 text-white shadow-[0_0_28px_rgba(147,51,234,0.55)] transition hover:scale-105 hover:bg-purple-500 active:scale-95 md:bottom-8 md:right-8"
    >
      <ArrowLeft className="h-6 w-6" />
    </Link>
  );
}

export default async function FlipLogPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};

  const rawStatus = getParam(params, "status");
  const rawSort = getParam(params, "sort");

  const status: FilterStatus =
    rawStatus === "active" || rawStatus === "sold" ? rawStatus : "all";

  const sort: SortMode =
    rawSort === "oldest" ||
    rawSort === "highestProfit" ||
    rawSort === "highestROI" ||
    rawSort === "lowestBuy"
      ? rawSort
      : "newest";

  const { data, error } = await supabase
    .from("flip_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#07070a] px-4 py-10 text-white">
        <div className="mx-auto max-w-[640px]">
          <h1 className="text-3xl font-black uppercase sm:text-4xl">
            Could not load flip log
          </h1>

          <p className="mt-4 text-white/70">
            Supabase returned an error while loading the live flip data.
          </p>

          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-200">{error.message}</p>
          </div>
        </div>

        <FloatingBackButton />
      </main>
    );
  }

  const flips: FlipItem[] = (data ?? []).map((flip) => {
    const createdAt = String(flip.created_at ?? new Date().toISOString());
    const soldAt = flip.sold_at ? String(flip.sold_at) : null;
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
      createdAtDisplay: formatDateTime(createdAt) ?? "",
      status: isSold ? "sold" : "active",
      soldAt,
      soldAtDisplay: formatDateTime(soldAt),
      actualSell: isSold ? Number(flip.actual_sell ?? flip.sell_price ?? 0) : null,
    };
  });

  const filteredFlips = flips
    .filter((flip) => {
      if (status !== "all" && flip.status !== status) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sort === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (sort === "highestProfit") return getProfit(b) - getProfit(a);
      if (sort === "highestROI") return getROI(b) - getROI(a);
      if (sort === "lowestBuy") return a.buy - b.buy;

      return 0;
    });

  const sold = flips.filter((flip) => flip.status === "sold");
  const active = flips.filter((flip) => flip.status === "active");
  const totalProfit = sold.reduce((sum, flip) => sum + getProfit(flip), 0);

  return (
    <>
      <FlipLogClient
        flips={filteredFlips}
        totalFlips={flips.length}
        activeFlips={active.length}
        soldFlips={sold.length}
        totalProfit={totalProfit}
        status={status}
        sort={sort}
      />
      <FloatingBackButton />
    </>
  );
}