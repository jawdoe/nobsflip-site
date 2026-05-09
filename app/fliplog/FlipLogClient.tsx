"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { FlipItem } from "./page";

type FilterStatus = "all" | "active" | "sold";
type SortMode =
  | "newest"
  | "oldest"
  | "highestProfit"
  | "highestROI"
  | "lowestBuy";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
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

export default function FlipLogClient({ flips }: { flips: FlipItem[] }) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const sold = flips.filter((flip) => flip.status === "sold");
    const active = flips.filter((flip) => flip.status === "active");

    const totalSpent = flips.reduce((sum, flip) => sum + flip.buy, 0);
    const totalProfit = sold.reduce((sum, flip) => sum + getProfit(flip), 0);
    const totalSales = sold.reduce(
      (sum, flip) => sum + (flip.actualSell ?? flip.sell),
      0
    );

    const avgROI =
      sold.length > 0
        ? sold.reduce((sum, flip) => sum + getROI(flip), 0) / sold.length
        : 0;

    return {
      total: flips.length,
      sold: sold.length,
      active: active.length,
      totalSpent,
      totalProfit,
      totalSales,
      avgROI,
    };
  }, [flips]);

  const filteredFlips = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return flips
      .filter((flip) => {
        if (statusFilter !== "all" && flip.status !== statusFilter) {
          return false;
        }

        if (!searchValue) return true;

        return [
          flip.title,
          flip.notes,
          flip.addedBy,
          flip.status,
          flip.createdAtDisplay,
          flip.soldAtDisplay ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchValue);
      })
      .sort((a, b) => {
        if (sortMode === "newest") {
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        }

        if (sortMode === "oldest") {
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        }

        if (sortMode === "highestProfit") {
          return getProfit(b) - getProfit(a);
        }

        if (sortMode === "highestROI") {
          return getROI(b) - getROI(a);
        }

        if (sortMode === "lowestBuy") {
          return a.buy - b.buy;
        }

        return 0;
      });
  }, [flips, statusFilter, sortMode, search]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: "url('/media-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/70 to-black/30" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-[#8cff00]/35 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#8cff00] backdrop-blur">
            NOBSFLIPS / Live Flip Log
          </div>

          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            The real flip
            <span className="block text-[#8cff00] text-stroke-heavy">
              log.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            Real buys, real sales, real profit, slow movers, mistakes, and wins.
            No fake numbers. No fluff. Just flips.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <StatCard label="Total Flips" value={String(stats.total)} />
          <StatCard label="Active" value={String(stats.active)} />
          <StatCard label="Sold" value={String(stats.sold)} />
          <StatCard
            label="Total Profit"
            value={formatMoney(stats.totalProfit)}
          />
          <StatCard label="Total Spent" value={formatMoney(stats.totalSpent)} />
          <StatCard label="Total Sales" value={formatMoney(stats.totalSales)} />
          <StatCard label="Average ROI" value={`${stats.avgROI.toFixed(1)}%`} />
        </div>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/45 p-5 backdrop-blur-md">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search flips..."
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#8cff00]/50"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as FilterStatus)
              }
              className="rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white outline-none focus:border-[#8cff00]/50"
            >
              <option value="all">All flips</option>
              <option value="active">Active only</option>
              <option value="sold">Sold only</option>
            </select>

            <select
              value={sortMode}
              onChange={(event) =>
                setSortMode(event.target.value as SortMode)
              }
              className="rounded-2xl border border-white/10 bg-[#101014] px-4 py-3 text-sm text-white outline-none focus:border-[#8cff00]/50"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highestProfit">Highest profit</option>
              <option value="highestROI">Highest ROI</option>
              <option value="lowestBuy">Lowest buy price</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredFlips.map((flip) => {
            const profit = getProfit(flip);
            const roi = getROI(flip);
            const saleValue =
              flip.status === "sold" ? flip.actualSell ?? flip.sell : flip.sell;

            return (
              <article
                key={flip.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/50 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md"
              >
                <div className="relative h-56 bg-white/5">
                  {flip.photoUrl ? (
                    <Image
                      src={flip.photoUrl}
                      alt={flip.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-black uppercase tracking-[0.2em] text-white/30">
                      No Photo
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                        flip.status === "sold"
                          ? "bg-[#8cff00] text-black"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      {flip.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    {flip.title}
                  </h2>

                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    Added by {flip.addedBy} • {flip.createdAtDisplay}
                  </p>

                  {flip.notes && (
                    <p className="mt-4 text-sm leading-6 text-white/65">
                      {flip.notes}
                    </p>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <MiniStat label="Buy" value={formatMoney(flip.buy)} />
                    <MiniStat
                      label={flip.status === "sold" ? "Sold For" : "Target"}
                      value={formatMoney(saleValue)}
                    />
                    <MiniStat label="Profit" value={formatMoney(profit)} />
                    <MiniStat label="ROI" value={`${roi.toFixed(1)}%`} />
                  </div>

                  {flip.status === "sold" && flip.soldAtDisplay && (
                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#8cff00]/80">
                      Sold: {flip.soldAtDisplay}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filteredFlips.length === 0 && (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-black/45 p-8 text-center backdrop-blur-md">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              No flips found.
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Nothing matches the current filter or search.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-base font-black text-white">{value}</p>
    </div>
  );
}