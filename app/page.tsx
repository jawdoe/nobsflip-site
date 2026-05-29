export const dynamic = "force-dynamic";

import Link from "next/link";

export default async function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-dunny-bg.png')] bg-cover bg-center bg-no-repeat opacity-35 md:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-[#07070a]/88 to-[#07070a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.08),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(91,33,182,0.10),transparent_38%)]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-md px-4 pb-8 pt-4 md:max-w-7xl md:px-8 md:pb-24 md:pt-24">
        {/* HERO */}
        <div className="rounded-[2rem] border border-white/10 bg-black/72 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md md:max-w-4xl md:p-10">
          <div className="inline-flex rounded-full border border-[#39FF14]/35 bg-[#39FF14]/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#39FF14] md:text-xs">
            NoBSFlips / Live Journey
          </div>

          <h1 className="mt-5 text-[2.9rem] font-black uppercase leading-[0.88] tracking-tight md:text-7xl lg:text-8xl">
            No Bullshit.
            <span className="block text-[#39FF14]">Just Flips.</span>
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/78 md:max-w-2xl md:text-xl md:leading-8 md:text-white/85">
            I buy random stuff, list it, track the numbers, and show what
            actually works. Wins, fails, slow movers — all of it.
          </p>

          <div className="mt-6">
            <Link
              href="/fliplog"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#39FF14] text-xs font-black uppercase tracking-[0.14em] text-black shadow-[0_0_14px_rgba(57,255,20,0.14)] transition hover:bg-[#7CFF5B] md:max-w-xs"
            >
              View Flip Log
            </Link>
          </div>
        </div>

        {/* FEATURED VIDEO */}
        <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/72 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md md:max-w-4xl md:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8B5CF6]">
              Featured Video
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase md:text-3xl">
              Start the journey here
            </h2>

            <Link
              href="/media"
              className="mt-4 inline-flex rounded-full border border-[#5B21B6]/35 bg-[#5B21B6]/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8B5CF6] transition hover:border-[#8B5CF6]/60 hover:bg-[#5B21B6]/20"
            >
              More Media
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_24px_rgba(0,0,0,0.35)]">
            <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(91,33,182,0.10),rgba(0,0,0,1)_62%)]">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5B21B6] text-3xl font-black text-white shadow-[0_0_10px_rgba(91,33,182,0.16)]">
                  ▶
                </div>

                <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-white">
                  Intro video coming soon
                </p>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/45">
                  This will be the first thing people watch before diving into
                  the flip log.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ABOUT */}
        <div className="mt-5 rounded-[2rem] border border-white/10 bg-black/72 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md md:max-w-4xl md:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-orange-400">
            About
          </p>

          <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">
            Follow the experiment.
          </h2>

          <p className="mt-3 text-sm leading-7 text-white/70">
            This is not fake guru flipping. It is a public log of what happens
            when I actually buy, list, sell, and learn from the numbers.
          </p>

          <div className="mt-5">
            <Link
              href="/about"
              className="inline-flex rounded-full border border-orange-400/35 bg-orange-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-orange-300 transition hover:border-orange-400/60 hover:bg-orange-400/20"
            >
              About NoBSFlips
            </Link>
          </div>

          {/* SOCIALS */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-16 flex-col items-center justify-center rounded-2xl border border-red-500/50 bg-red-500/20 text-white shadow-[0_0_25px_rgba(239,68,68,0.20)] transition hover:border-red-400 hover:bg-red-500/30"
            >
              <span className="text-2xl">▶</span>

              <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em]">
                YouTube
              </span>
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-16 flex-col items-center justify-center rounded-2xl border border-pink-500/50 bg-pink-500/20 text-white shadow-[0_0_25px_rgba(236,72,153,0.22)] transition hover:border-pink-400 hover:bg-pink-500/30"
            >
              <span className="text-2xl">◎</span>

              <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em]">
                Instagram
              </span>
            </a>

            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="flex h-16 flex-col items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-500/15 text-white shadow-[0_0_20px_rgba(99,102,241,0.15)] transition hover:border-indigo-400 hover:bg-indigo-500/25"
            >
              <span className="text-2xl">◈</span>

              <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em]">
                Discord
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}