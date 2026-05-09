export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FlipPostRow = {
  id: string;
  buy_price: number | null;
  sell_price: number | null;
  actual_sell: number | null;
  status: string | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateStats(flips: FlipPostRow[]) {
  const soldFlips = flips.filter((flip) => flip.status === "sold");
  const activeFlips = flips.filter((flip) => flip.status !== "sold");

  const totalProfit = soldFlips.reduce((sum, flip) => {
    const buy = Number(flip.buy_price ?? 0);
    const actualSell = Number(flip.actual_sell ?? flip.sell_price ?? 0);
    return sum + (actualSell - buy);
  }, 0);

  const totalBuy = soldFlips.reduce((sum, flip) => {
    return sum + Number(flip.buy_price ?? 0);
  }, 0);

  const averageROI = totalBuy > 0 ? (totalProfit / totalBuy) * 100 : 0;

  return [
    {
      label: "Total Profit",
      value: formatMoney(totalProfit),
      sub: "From sold flips",
    },
    {
      label: "Items Sold",
      value: String(soldFlips.length),
      sub: "And counting",
    },
    {
      label: "ROI",
      value: `${averageROI.toFixed(1)}%`,
      sub: "Average return",
    },
    {
      label: "Active Flips",
      value: String(activeFlips.length),
      sub: "Currently listed",
    },
  ];
}

const cards = [
  {
    title: "Flip Log",
    href: "/fliplog",
    description:
      "Every flip. Every sale. Every dollar. Full transparency. No BS.",
    cta: "View the Flip Log",
    bg: "from-[#8cff00]/30 via-[#8cff00]/10 to-transparent",
    icon: "📦",
  },
  {
    title: "Videos",
    href: "/media",
    description:
      "Watch the latest flips, hauls, wins, fails, and behind-the-scenes action.",
    cta: "Watch Latest Video",
    bg: "from-purple-500/30 via-purple-500/10 to-transparent",
    icon: "🎥",
  },
  {
    title: "About",
    href: "/about",
    description:
      "The real NoBSFlip journey — personal stats, YouTube content, and building the system in public.",
    cta: "Read The Journey",
    bg: "from-orange-500/30 via-orange-500/10 to-transparent",
    icon: "🚽",
  },
];

export default async function HomePage() {
  const { data, error } = await supabase
    .from("flip_posts")
    .select("id, buy_price, sell_price, actual_sell, status");

  const stats = calculateStats((data ?? []) as FlipPostRow[]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-dunny-bg.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-transparent to-black/45" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 md:px-8 md:pb-24 md:pt-28">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            No Bullshit.
            <span className="block">
              Just{" "}
              <span className="text-[#8cff00] text-stroke-heavy">
                Flips.
              </span>
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-white/85 md:text-xl">
            Real talk. Real flips. Real results. Follow the journey of turning
            trash into cash and building something one flip at a time.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/fliplog"
              className="rounded-xl bg-[#8cff00] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-[0_0_24px_rgba(140,255,0,0.25)] transition hover:scale-[1.02] hover:bg-[#a6ff32]"
            >
              <span className="text-stroke">View Flip Log</span>
            </Link>

            <Link
              href="/media"
              className="rounded-xl border border-[#8cff00]/70 bg-black/25 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-[#8cff00]/10 hover:text-[#8cff00]"
            >
              Watch Latest Video
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
            Could not load live stats: {error.message}
          </div>
        )}

        <div className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-white/10 md:border-r md:last:border-r-0 md:px-6"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/65">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-black uppercase text-[#8cff00]">
                {stat.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#8cff00]/60 hover:bg-black/60"
            >
              <div
                className={`flex h-40 items-center justify-center bg-gradient-to-br ${card.bg} text-6xl`}
              >
                {card.icon}
              </div>

              <div className="p-6">
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  {card.title}
                </h2>

                <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/70">
                  {card.description}
                </p>

                <div className="mt-8 text-sm font-black uppercase tracking-[0.16em] text-[#8cff00]">
                  {card.cta}{" "}
                  <span className="inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}