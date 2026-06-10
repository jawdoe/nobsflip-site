import Link from "next/link";

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
      <path d="M20.3 4.4A16.8 16.8 0 0 0 16.1 3l-.2.4c1.5.4 2.2 1 2.2 1s-1.9-1-5.9-1-5.9 1-5.9 1 .8-.6 2.3-1L8.3 3a16.8 16.8 0 0 0-4.2 1.4C1.5 8.3.8 12.1 1.1 15.9c1.7 1.3 3.4 2 5 2.5l.7-1.2c-.4-.1-.9-.3-1.3-.6l.3-.2c2.5 1.2 5.3 1.2 7.8 0l.3.2c-.4.3-.9.5-1.3.6l.7 1.2c1.6-.5 3.3-1.2 5-2.5.4-4.4-.7-8.1-3-11.5ZM8.4 13.8c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm7.2 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/84 to-black/40" />
      </div>
      <section className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          <div>
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300 md:px-4 md:py-2 md:text-xs">
              NoBSFlips / eBay Flip Scanner
            </div>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-5xl md:mt-6 md:text-7xl lg:text-8xl">
              Scan It.
              <span className="block text-purple-300">Know Instantly.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 md:mt-6 md:text-lg md:leading-9">
              Scan a barcode at the op shop. See real eBay sold prices from your local marketplace in your currency. Get a straight answer on whether it is worth flipping.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/scan" className="flex items-center justify-center rounded-2xl bg-purple-600 px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(147,51,234,0.4)] transition hover:scale-[1.02] hover:bg-purple-500">
                Start Scanning
              </Link>
              <Link href="/login" className="flex items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-500/15 px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-purple-300 transition hover:bg-purple-500/25">
                Create Free Account
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
            <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-3 lg:rounded-[2rem] lg:p-6">
              <div className="text-lg font-black text-green-400 lg:text-3xl">YES</div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-green-300/70 lg:mt-1 lg:text-xs">Buy It</div>
              <p className="mt-1 hidden text-sm leading-6 text-white/60 lg:block">Sold prices are strong. Margin is there. Grab it.</p>
            </div>
            <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/10 p-3 lg:rounded-[2rem] lg:p-6">
              <div className="text-lg font-black text-yellow-400 lg:text-3xl">MAYBE</div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-yellow-300/70 lg:mt-1 lg:text-xs">Depends</div>
              <p className="mt-1 hidden text-sm leading-6 text-white/60 lg:block">Could work if you get it cheap enough. Check the number.</p>
            </div>
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-3 lg:rounded-[2rem] lg:p-6">
              <div className="text-base font-black text-red-400 lg:text-3xl">HELL NO</div>
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-red-300/70 lg:mt-1 lg:text-xs">Walk Away</div>
              <p className="mt-1 hidden text-sm leading-6 text-white/60 lg:block">Not selling. Not worth the risk. Leave it on the shelf.</p>
            </div>
          </div>
        </div>
        <div className="mt-12 md:mt-20">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">How It Works</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-6 md:gap-4">
            <Step num="1" title="Scan the barcode" body="Point your camera at any barcode or type the GTIN manually." />
            <Step num="2" title="See local sold prices" body="Real completed eBay listings from your local marketplace in your currency. Not asking prices. Actual sales." />
            <Step num="3" title="Get your verdict" body="Enter your buy price and get a straight Yes, Maybe, or Hell No." />
          </div>
        </div>
        <div className="mt-8 rounded-[2rem] border border-purple-500/20 bg-purple-500/5 p-5 md:mt-16 md:p-8 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-300">
              <DiscordIcon />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white md:text-2xl">Join the Discord</h2>
              <p className="mt-1 max-w-md text-sm leading-6 text-white/60">
                Share your finds, ask questions, and connect with other flippers. No guru BS. Just real people flipping real stuff.
              </p>
            </div>
          </div>
          <a
            href="https://discord.gg/bvThRRf9Y5"
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex w-full items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-500/15 px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-purple-300 transition hover:bg-purple-500/25 lg:mt-0 lg:inline-flex lg:w-auto lg:shrink-0"
          >
            Join Now
          </a>
        </div>
      </section>
    </main>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/60 p-6 backdrop-blur-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-black text-white shadow-[0_0_16px_rgba(147,51,234,0.35)]">
        {num}
      </div>
      <h3 className="mt-4 text-base font-black uppercase tracking-tight text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{body}</p>
    </div>
  );
}
