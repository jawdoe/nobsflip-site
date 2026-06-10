import Link from "next/link";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
      <path d="M23.5 6.2s-.2-1.7-.9-2.4c-.9-.9-1.9-.9-2.3-1C17.1 2.5 12 2.5 12 2.5s-5.1 0-8.3.3c-.5.1-1.5.1-2.3 1C.7 4.5.5 6.2.5 6.2S.2 8.2.2 10.3v1.9c0 2.1.3 4.1.3 4.1s.2 1.7.9 2.4c.9.9 2.1.9 2.6 1 1.9.2 8 .3 8 .3s5.1 0 8.3-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.4.9-2.4s.3-2.1.3-4.1v-1.9c0-2.1-.3-4.1-.3-4.1ZM9.7 14.7V7.8l6.6 3.5-6.6 3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.7 1.7a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
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

      <section className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-24 pt-12 sm:px-6 md:px-8 md:pt-20">

        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300 md:text-xs">
            NoBSFlips / eBay Flip Scanner
          </div>

          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Scan It.
            <span className="block text-purple-300">Know Instantly.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/75 md:text-xl md:leading-9">
            Scan a barcode at the op shop. See real eBay sold prices from your local marketplace in your currency. Get a straight answer on whether it is worth flipping.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/scan"
              className="flex items-center justify-center rounded-2xl bg-purple-600 px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(147,51,234,0.4)] transition hover:scale-[1.02] hover:bg-purple-500"
            >
              Start Scanning
            </Link>
            <Link
              href="/fliplog"
              className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-8 py-3 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
            >
              See Real Flips
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[2rem] border border-green-500/25 bg-green-500/10 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-3xl font-black text-green-400">YES</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-green-300/70">Buy It</div>
            <p className="mt-3 text-sm leading-6 text-white/60">Sold prices are strong. Margin is there. Grab it.</p>
          </div>

          <div className="rounded-[2rem] border border-yellow-500/25 bg-yellow-500/10 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-3xl font-black text-yellow-400">MAYBE</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-yellow-300/70">Depends on Price</div>
            <p className="mt-3 text-sm leading-6 text-white/60">Could work if you get it cheap enough. Check the number.</p>
          </div>

          <div className="rounded-[2rem] border border-red-500/25 bg-red-500/10 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <div className="text-3xl font-black text-red-400">HELL NO</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-red-300/70">Walk Away</div>
            <p className="mt-3 text-sm leading-6 text-white/60">Not selling. Not worth the risk. Leave it on the shelf.</p>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">How It Works</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step num="1" title="Scan the barcode" body="Point your camera at any barcode or type the GTIN manually." />
            <Step num="2" title="See local sold prices" body="Real completed eBay listings from your local marketplace in your currency. Not asking prices. Actual sales." />
            <Step num="3" title="Get your verdict" body="Enter your buy price and get a straight Yes, Maybe, or Hell No." />
          </div>
        </div>

        <div className="mt-16 rounded-[2rem] border border-white/10 bg-black/60 p-8 text-center backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">Community</p>
          <h2 className="mt-3 text-2xl font-black uppercase text-white md:text-3xl">Follow the flips.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">
            Real results, no filters. Watch the videos, join the Discord, follow along on Instagram.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <SocialLink href="https://www.youtube.com/@NoBSFlips" label="YouTube"><YouTubeIcon /></SocialLink>
            <SocialLink href="https://www.instagram.com/nobsflipin/" label="Instagram"><InstagramIcon /></SocialLink>
            <SocialLink href="https://discord.gg/bvThRRf9Y5" label="Discord"><DiscordIcon /></SocialLink>
          </div>
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

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-20 w-24 flex-col items-center justify-center gap-2 rounded-2xl border border-purple-400/35 bg-purple-500/10 text-white transition hover:border-purple-300/60 hover:bg-purple-500/20"
    >
      {children}
      <span className="text-[9px] font-black uppercase tracking-[0.14em] text-purple-300/80">{label}</span>
    </a>
  );
}
