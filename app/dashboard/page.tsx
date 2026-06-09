export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Flip = {
  id: string;
  title: string;
  buy_price: number | null;
  sell_price: number | null;
  actual_sell: number | null;
  status: string | null;
  category: string | null;
  created_at: string | null;
  sold_at: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}

function getSaleValue(flip: Flip) {
  return Number(flip.actual_sell ?? flip.sell_price ?? 0);
}

function getBuyValue(flip: Flip) {
  return Number(flip.buy_price ?? 0);
}

function getProfit(flip: Flip) {
  return getSaleValue(flip) - getBuyValue(flip);
}

function getROI(flip: Flip) {
  const buy = getBuyValue(flip);
  if (buy <= 0) return 0;
  return (getProfit(flip) / buy) * 100;
}

function getDaysToSell(flip: Flip) {
  if (!flip.created_at || !flip.sold_at) return null;

  const start = new Date(flip.created_at).getTime();
  const end = new Date(flip.sold_at).getTime();

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 0);
}

export default async function DashboardPage() {
  const { data, error } = await supabase
    .from("flip_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#07070a] p-8 text-white">
        <section className="mx-auto max-w-[1400px]">
          <div className="rounded-[2rem] border border-red-400/20 bg-red-500/10 p-6">
            <h1 className="text-3xl font-black uppercase">Dashboard Error</h1>
            <p className="mt-4 text-red-200">{error.message}</p>
          </div>
        </section>
      </main>
    );
  }

  const flips = (data ?? []) as Flip[];
  const sold = flips.filter((flip) => flip.status === "sold");
  const active = flips.filter((flip) => flip.status !== "sold");

  const totalSpent = flips.reduce((sum, flip) => sum + getBuyValue(flip), 0);
  const totalRevenue = sold.reduce((sum, flip) => sum + getSaleValue(flip), 0);
  const totalProfit = sold.reduce((sum, flip) => sum + getProfit(flip), 0);
  const activeListedValue = active.reduce(
    (sum, flip) => sum + Number(flip.sell_price ?? 0),
    0
  );

  const averageROI =
    sold.length > 0
      ? sold.reduce((sum, flip) => sum + getROI(flip), 0) / sold.length
      : 0;

  const soldWithDays = sold
    .map((flip) => ({ flip, days: getDaysToSell(flip) }))
    .filter((item): item is { flip: Flip; days: number } => item.days !== null);

  const averageDaysToSell =
    soldWithDays.length > 0
      ? soldWithDays.reduce((sum, item) => sum + item.days, 0) /
        soldWithDays.length
      : 0;

  const bestProfit =
    sold.length > 0
      ? [...sold].sort((a, b) => getProfit(b) - getProfit(a))[0]
      : null;

  const worstProfit =
    sold.length > 0
      ? [...sold].sort((a, b) => getProfit(a) - getProfit(b))[0]
      : null;

  const bestROI =
    sold.length > 0 ? [...sold].sort((a, b) => getROI(b) - getROI(a))[0] : null;

  const categoryStats = Object.values(
    sold.reduce<
      Record<
        string,
        { category: string; sold: number; profit: number; revenue: number }
      >
    >((acc, flip) => {
      const category = flip.category || "Uncategorised";

      if (!acc[category]) {
        acc[category] = {
          category,
          sold: 0,
          profit: 0,
          revenue: 0,
        };
      }

      acc[category].sold += 1;
      acc[category].profit += getProfit(flip);
      acc[category].revenue += getSaleValue(flip);

      return acc;
    }, {})
  ).sort((a, b) => b.profit - a.profit);

  const monthlyStats = Object.values(
    sold.reduce<
      Record<
        string,
        { month: string; sold: number; revenue: number; profit: number }
      >
    >((acc, flip) => {
      const date = flip.sold_at ? new Date(flip.sold_at) : null;

      if (!date || Number.isNaN(date.getTime())) return acc;

      const month = new Intl.DateTimeFormat("en-AU", {
        month: "short",
        year: "numeric",
        timeZone: "Australia/Melbourne",
      }).format(date);

      if (!acc[month]) {
        acc[month] = {
          month,
          sold: 0,
          revenue: 0,
          profit: 0,
        };
      }

      acc[month].sold += 1;
      acc[month].revenue += getSaleValue(flip);
      acc[month].profit += getProfit(flip);

      return acc;
    }, {})
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#07070a] to-[#07070a]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1400px] px-4 py-10 sm:px-6 md:px-8 md:py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              NoBSFlip / Dashboard
            </div>

            <h1 className="mt-5 text-4xl font-black uppercase tracking-tight text-white md:text-6xl">
              Flip stats.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 md:text-lg">
              The big-picture numbers: profit, revenue, best categories, sold
              count, active value, and long-term flip performance.
            </p>
          </div>

          <Link
            href="/fliplog"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-purple-600 px-5 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:scale-[1.02] hover:bg-purple-500"
          >
            View Flip Log
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Profit" value={money(totalProfit)} highlight />
          <StatCard label="Total Revenue" value={money(totalRevenue)} />
          <StatCard label="Total Spent" value={money(totalSpent)} />
          <StatCard label="Active Listed Value" value={money(activeListedValue)} />
          <StatCard label="Sold Flips" value={sold.length.toString()} />
          <StatCard label="Active Flips" value={active.length.toString()} />
          <StatCard label="Average ROI" value={`${averageROI.toFixed(1)}%`} />
          <StatCard
            label="Avg Days To Sell"
            value={
              soldWithDays.length > 0
                ? `${averageDaysToSell.toFixed(1)} days`
                : "-"
            }
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <FeatureCard
            label="Best Profit"
            title={bestProfit?.title ?? "No sold flips yet"}
            value={bestProfit ? money(getProfit(bestProfit)) : "-"}
          />

          <FeatureCard
            label="Best ROI"
            title={bestROI?.title ?? "No sold flips yet"}
            value={bestROI ? `${getROI(bestROI).toFixed(1)}%` : "-"}
          />

          <FeatureCard
            label="Worst Flip"
            title={worstProfit?.title ?? "No sold flips yet"}
            value={worstProfit ? money(getProfit(worstProfit)) : "-"}
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
                  <div
                    key={item.category}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-white">
                          {item.category}
                        </p>
                        <p className="mt-1 text-sm text-white/50">
                          {item.sold} sold · Revenue {money(item.revenue)}
                        </p>
                      </div>

                      <p className="text-lg font-black text-purple-300">
                        {money(item.profit)}
                      </p>
                    </div>
                  </div>
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
                  <div
                    key={item.month}
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-black uppercase text-white">
                          {item.month}
                        </p>
                        <p className="mt-1 text-sm text-white/50">
                          {item.sold} sold · Revenue {money(item.revenue)}
                        </p>
                      </div>

                      <p className="text-lg font-black text-purple-300">
                        {money(item.profit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">
        {label}
      </p>
      <p
        className={`mt-3 text-2xl font-black ${
          highlight ? "text-purple-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FeatureCard({
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
    <div className="rounded-[1.5rem] border border-white/10 bg-black/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/42">
        {label}
      </p>
      <h2 className="mt-3 line-clamp-2 text-xl font-black uppercase text-white">
        {title}
      </h2>
      <p
        className={`mt-3 text-2xl font-black ${
          warning ? "text-red-300" : "text-purple-300"
        }`}
      >
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
    <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <h2 className="text-2xl font-black uppercase tracking-tight text-white">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
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