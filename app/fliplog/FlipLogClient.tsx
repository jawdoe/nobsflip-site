"use client";

import Image from "next/image";
import Link from "next/link";
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

function getDaysToSell(flip: FlipItem) {
  if (flip.status !== "sold" || !flip.soldAt) return null;

  const start = new Date(flip.createdAt).getTime();
  const end = new Date(flip.soldAt).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 0);
}

function getMonthLabel(dateString: string | null) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

function buildHref({
  status,
  sort,
}: {
  status: FilterStatus;
  sort: SortMode;
}) {
  const params = new URLSearchParams();

  if (status !== "all") params.set("status", status);
  if (sort !== "newest") params.set("sort", sort);

  const query = params.toString();
  return query ? `/fliplog?${query}` : "/fliplog";
}

export default function FlipLogClient({
  flips,
  allFlips,
  status,
  sort,
}: {
  flips: FlipItem[];
  allFlips: FlipItem[];
  status: FilterStatus;
  sort: SortMode;
}) {
  const soldAll = allFlips.filter((flip) => flip.status === "sold");
  const activeAll = allFlips.filter((flip) => flip.status === "active");

  const totalProfit = soldAll.reduce((total, flip) => total + getProfit(flip), 0);
  const totalRevenue = soldAll.reduce(
    (total, flip) => total + (flip.actualSell ?? flip.sell),
    0
  );
  const totalSpent = allFlips.reduce((total, flip) => total + flip.buy, 0);
  const activeTargetValue = activeAll.reduce(
    (total, flip) => total + flip.sell,
    0
  );

  const averageROI =
    soldAll.length > 0
      ? soldAll.reduce((total, flip) => total + getROI(flip), 0) /
        soldAll.length
      : 0;

  const soldWithDays = soldAll
    .map((flip) => ({ flip, days: getDaysToSell(flip) }))
    .filter((item): item is { flip: FlipItem; days: number } => item.days !== null);

  const averageDaysToSell =
    soldWithDays.length > 0
      ? soldWithDays.reduce((total, item) => total + item.days, 0) /
        soldWithDays.length
      : 0;

  const bestFlip =
    soldAll.length > 0
      ? [...soldAll].sort((a, b) => getProfit(b) - getProfit(a))[0]
      : null;

  const highestROI =
    soldAll.length > 0
      ? [...soldAll].sort((a, b) => getROI(b) - getROI(a))[0]
      : null;

  const worstFlip =
    soldAll.length > 0
      ? [...soldAll].sort((a, b) => getProfit(a) - getProfit(b))[0]
      : null;

  const categoryStats = Object.values(
    soldAll.reduce<
      Record<
        string,
        { category: string; sold: number; revenue: number; profit: number }
      >
    >((acc, flip) => {
      const category = flip.category || "Uncategorised";

      if (!acc[category]) {
        acc[category] = {
          category,
          sold: 0,
          revenue: 0,
          profit: 0,
        };
      }

      acc[category].sold += 1;
      acc[category].revenue += flip.actualSell ?? flip.sell;
      acc[category].profit += getProfit(flip);

      return acc;
    }, {})
  ).sort((a, b) => b.profit - a.profit);

  const monthlyStats = Object.values(
    soldAll.reduce<
      Record<string, { month: string; sold: number; revenue: number; profit: number }>
    >((acc, flip) => {
      const month = getMonthLabel(flip.soldAt);
      if (!month) return acc;

      if (!acc[month]) {
        acc[month] = {
          month,
          sold: 0,
          revenue: 0,
          profit: 0,
        };
      }

      acc[month].sold += 1;
      acc[month].revenue += flip.actualSell ?? flip.sell;
      acc[month].profit += getProfit(flip);

      return acc;
    }, {})
  );

  return (
    <main className="relative min-h-screen touch-manipulation overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 md:opacity-35"
          style={{ backgroundImage: "url('/media-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/86" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_32%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/88 to-black/60" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col px-4 pb-32 pt-8 sm:px-6 md:px-8 md:pt-14">
        <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
          <div>
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-purple-300 backdrop-blur">
              NOBSFLIPS / Flip Log
            </div>

            <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl">
              Real flip
              <span className="block text-purple-300">log.</span>
            </h1>

            <p className="mt-5 max-w-[680px] text-base leading-7 text-white/76 md:text-lg md:leading-8">
              Real buys, real sales, profit, ROI, categories, monthly results,
              mistakes, wins, and slow movers.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <BigStat label="Total Profit" value={formatMoney(totalProfit)} />
            <BigStat label="Revenue" value={formatMoney(totalRevenue)} />
            <BigStat label="Sold Flips" value={soldAll.length.toString()} />
            <BigStat label="Average ROI" value={`${averageROI.toFixed(1)}%`} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <BigStat label="Total Spent" value={formatMoney(totalSpent)} />
          <BigStat label="Active Target" value={formatMoney(activeTargetValue)} />
          <BigStat label="Active Flips" value={activeAll.length.toString()} />
          <BigStat
            label="Avg Days To Sell"
            value={
              soldWithDays.length > 0
                ? `${averageDaysToSell.toFixed(1)} days`
                : "-"
            }
          />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <HighlightCard
            label="Best Profit"
            title={bestFlip?.title ?? "No sold flips yet"}
            value={bestFlip ? formatMoney(getProfit(bestFlip)) : "-"}
          />
          <HighlightCard
            label="Highest ROI"
            title={highestROI?.title ?? "No sold flips yet"}
            value={highestROI ? `${getROI(highestROI).toFixed(1)}%` : "-"}
          />
          <HighlightCard
            label="Worst Flip"
            title={worstFlip?.title ?? "No sold flips yet"}
            value={worstFlip ? formatMoney(getProfit(worstFlip)) : "-"}
            warning
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Panel title="Profit by Category">
            {categoryStats.length === 0 ? (
              <EmptyText>No sold category data yet.</EmptyText>
            ) : (
              <div className="space-y-3">
                {categoryStats.map((item) => (
                  <ResultRow
                    key={item.category}
                    title={item.category}
                    meta={`${item.sold} sold · Revenue ${formatMoney(item.revenue)}`}
                    value={formatMoney(item.profit)}
                  />
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Monthly Sales">
            {monthlyStats.length === 0 ? (
              <EmptyText>No monthly sales yet.</EmptyText>
            ) : (
              <div className="space-y-3">
                {monthlyStats.map((item) => (
                  <ResultRow
                    key={item.month}
                    title={item.month}
                    meta={`${item.sold} sold · Revenue ${formatMoney(item.revenue)}`}
                    value={formatMoney(item.profit)}
                  />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-black/70 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-md">
          <div className="grid grid-cols-3 gap-2">
            <FilterLink
              label="All"
              active={status === "all"}
              href={buildHref({ status: "all", sort })}
            />
            <FilterLink
              label="Active"
              active={status === "active"}
              href={buildHref({ status: "active", sort })}
            />
            <FilterLink
              label="Sold"
              active={status === "sold"}
              href={buildHref({ status: "sold", sort })}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            <SortLink
              label="Newest"
              active={sort === "newest"}
              href={buildHref({ status, sort: "newest" })}
            />
            <SortLink
              label="Oldest"
              active={sort === "oldest"}
              href={buildHref({ status, sort: "oldest" })}
            />
            <SortLink
              label="Top Profit"
              active={sort === "highestProfit"}
              href={buildHref({ status, sort: "highestProfit" })}
            />
            <SortLink
              label="Top ROI"
              active={sort === "highestROI"}
              href={buildHref({ status, sort: "highestROI" })}
            />
            <SortLink
              label="Lowest Buy"
              active={sort === "lowestBuy"}
              href={buildHref({ status, sort: "lowestBuy" })}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 text-center text-sm font-bold text-white/75 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <span className="text-white">{flips.length}</span> shown ·{" "}
          <span className="text-white">{allFlips.length}</span> flips ·{" "}
          <span className="text-purple-300">{activeAll.length}</span> active ·{" "}
          <span className="text-purple-300">{soldAll.length}</span> sold ·{" "}
          <span className="text-purple-300">{formatMoney(totalProfit)}</span>{" "}
          profit
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {flips.map((flip) => {
            const profit = getProfit(flip);
            const roi = getROI(flip);
            const daysToSell = getDaysToSell(flip);
            const saleValue =
              flip.status === "sold" ? flip.actualSell ?? flip.sell : flip.sell;

            return (
              <article
                key={flip.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md"
              >
                <div className="relative h-72 bg-white/[0.035]">
                  {flip.photoUrl ? (
                    <Image
                      src={flip.photoUrl}
                      alt={flip.title}
                      fill
                      sizes="(min-width: 1280px) 430px, (min-width: 768px) 50vw, 100vw"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-base font-black uppercase tracking-[0.16em] text-white/30">
                      No Photo
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span className="rounded-full bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_0_18px_rgba(147,51,234,0.3)]">
                      {flip.status}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h2 className="text-2xl font-black uppercase leading-tight tracking-tight text-white">
                    {flip.title}
                  </h2>

                  {flip.category && (
                    <div className="mt-3 inline-flex rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-purple-200">
                      {flip.category}
                    </div>
                  )}

                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-white/45">
                    Added by {flip.addedBy}
                  </p>

                  <p className="mt-1 text-sm text-white/42">
                    Added: {flip.createdAtDisplay}
                  </p>

                  {flip.listedAtDisplay && (
                    <p className="mt-1 text-sm text-white/42">
                      Listed: {flip.listedAtDisplay}
                    </p>
                  )}

                  {flip.notes && (
                    <p className="mt-4 text-sm leading-6 text-white/72">
                      {flip.notes}
                    </p>
                  )}

                  {flip.listingUrl && (
                    <a
                      href={flip.listingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-xl border border-purple-400/25 bg-purple-500/10 px-4 py-2 text-sm font-bold text-purple-100 transition hover:border-purple-300/50 hover:bg-purple-500/20"
                    >
                      View eBay Listing
                    </a>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniStat label="Buy" value={formatMoney(flip.buy)} />
                    <MiniStat
                      label={flip.status === "sold" ? "Sold For" : "Target"}
                      value={formatMoney(saleValue)}
                    />
                    <MiniStat
                      label="Profit"
                      value={formatMoney(profit)}
                      negative={profit < 0}
                    />
                    <MiniStat label="ROI" value={`${roi.toFixed(1)}%`} />
                  </div>

                  {flip.status === "sold" && (
                    <div className="mt-5 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-4 text-sm font-black uppercase tracking-[0.1em] text-purple-200">
                      <p>Sold: {flip.soldAtDisplay ?? "Unknown date"}</p>
                      <p className="mt-1">
                        Days to sell:{" "}
                        {daysToSell === null
                          ? "Unknown"
                          : `${daysToSell} day${
                              daysToSell === 1 ? "" : "s"
                            }`}
                      </p>
                    </div>
                  )}

                  {flip.status === "active" && (
                    <div className="mt-5 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-4 text-sm font-black uppercase tracking-[0.1em] text-purple-200">
                      Still active · Target profit {formatMoney(profit)}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {flips.length === 0 && (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/70 p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.32)] backdrop-blur-md">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              No flips found.
            </h2>
            <p className="mt-3 text-base text-white/60">
              Nothing matches that filter.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-purple-300">{value}</p>
    </div>
  );
}

function HighlightCard({
  label,
  title,
  value,
  warning = false,
}: {
  label: string;
  title: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">
        {label}
      </p>
      <p className="mt-2 line-clamp-1 text-lg font-black uppercase text-white">
        {title}
      </p>
      <p className={`mt-1 text-xl font-black ${warning ? "text-red-300" : "text-purple-300"}`}>
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <h2 className="text-2xl font-black uppercase tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ResultRow({
  title,
  meta,
  value,
}: {
  title: string;
  meta: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-black uppercase text-white">{title}</p>
          <p className="mt-1 text-sm text-white/50">{meta}</p>
        </div>

        <p className="text-lg font-black text-purple-300">{value}</p>
      </div>
    </div>
  );
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 text-white/55">
      {children}
    </div>
  );
}

function FilterLink({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl px-3 py-3 text-center text-sm font-black uppercase tracking-[0.08em] transition active:scale-95 ${
        active
          ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.28)]"
          : "border border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/[0.1] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function SortLink({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl px-3 py-3 text-center text-xs font-black uppercase tracking-[0.08em] transition active:scale-95 ${
        active
          ? "border border-purple-400/40 bg-purple-500/20 text-purple-100"
          : "border border-white/10 bg-white/[0.06] text-white/62 hover:bg-white/[0.1] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MiniStat({
  label,
  value,
  negative = false,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/38">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-black ${
          negative ? "text-red-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}