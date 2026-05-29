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
  totalFlips,
  activeFlips,
  soldFlips,
  totalProfit,
  status,
  sort,
}: {
  flips: FlipItem[];
  totalFlips: number;
  activeFlips: number;
  soldFlips: number;
  totalProfit: number;
  status: FilterStatus;
  sort: SortMode;
}) {
  return (
    <main className="relative min-h-screen touch-manipulation overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: "url('/media-bg.png')" }}
        />
        <div className="absolute inset-0 bg-black/82" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/85 to-black/50" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col px-4 pb-32 pt-8 sm:px-6 md:pt-10">
        <div className="text-center">
          <div className="mx-auto inline-flex rounded-full border border-[#8cff00]/35 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#8cff00] backdrop-blur">
            NOBSFLIPS / Live Flip Log
          </div>

          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl">
            Real flip
            <span className="block text-[#8cff00]">log.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-white/75">
            Real buys, real sales, real profit, mistakes, wins, and slow movers.
          </p>
        </div>

        <div className="mt-7 rounded-[1.7rem] border border-white/10 bg-black/60 p-4 backdrop-blur-md">
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

          <div className="mt-3 grid grid-cols-2 gap-2">
            <SortLink
              label="Newest"
              active={sort === "newest"}
              href={buildHref({ status, sort: "newest" })}
            />
            <SortLink
              label="Top Profit"
              active={sort === "highestProfit"}
              href={buildHref({ status, sort: "highestProfit" })}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-center text-sm font-bold text-white/75 backdrop-blur-md">
          <span className="text-white">{flips.length}</span> shown ·{" "}
          <span className="text-white">{totalFlips}</span> flips ·{" "}
          <span className="text-[#8cff00]">{activeFlips}</span> active ·{" "}
          <span className="text-[#8cff00]">{soldFlips}</span> sold ·{" "}
          <span className="text-[#8cff00]">{formatMoney(totalProfit)}</span>{" "}
          profit
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {flips.map((flip) => {
            const profit = getProfit(flip);
            const roi = getROI(flip);
            const saleValue =
              flip.status === "sold" ? flip.actualSell ?? flip.sell : flip.sell;

            return (
              <article
                key={flip.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/65 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-md"
              >
                <div className="relative h-80 bg-white/5 sm:h-[420px]">
                  {flip.photoUrl ? (
                    <Image
                      src={flip.photoUrl}
                      alt={flip.title}
                      fill
                      sizes="720px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-base font-black uppercase tracking-[0.16em] text-white/30">
                      No Photo
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                        flip.status === "sold"
                          ? "bg-[#8cff00] text-black"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {flip.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h2 className="text-3xl font-black uppercase leading-tight tracking-tight">
                    {flip.title}
                  </h2>

                  <p className="mt-3 text-sm font-bold uppercase tracking-[0.08em] text-white/45">
                    Added by {flip.addedBy}
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    {flip.createdAtDisplay}
                  </p>

                  {flip.notes && (
                    <p className="mt-4 text-base leading-7 text-white/70">
                      {flip.notes}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniStat label="Buy" value={formatMoney(flip.buy)} />
                    <MiniStat
                      label={flip.status === "sold" ? "Sold For" : "Target"}
                      value={formatMoney(saleValue)}
                    />
                    <MiniStat label="Profit" value={formatMoney(profit)} />
                    <MiniStat label="ROI" value={`${roi.toFixed(1)}%`} />
                  </div>

                  {flip.status === "sold" && flip.soldAtDisplay && (
                    <p className="mt-5 rounded-2xl border border-[#8cff00]/20 bg-[#8cff00]/10 px-4 py-4 text-sm font-black uppercase tracking-[0.1em] text-[#8cff00]">
                      Sold: {flip.soldAtDisplay}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {flips.length === 0 && (
          <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/60 p-8 text-center backdrop-blur-md">
            <h2 className="text-3xl font-black uppercase tracking-tight">
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
      className={`rounded-2xl px-3 py-3 text-center text-sm font-black uppercase active:scale-95 ${
        active
          ? "bg-[#8cff00] text-black"
          : "border border-white/10 bg-white/10 text-white/70"
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
      className={`rounded-2xl px-3 py-3 text-center text-sm font-black uppercase active:scale-95 ${
        active
          ? "bg-purple-600 text-white"
          : "border border-white/10 bg-white/10 text-white/70"
      }`}
    >
      {label}
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}