export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-dunny-bg.png')] bg-cover bg-center bg-no-repeat opacity-22 md:opacity-38" />
        <div className="absolute inset-0 bg-black/82" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/84 to-black/58" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-32 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
          <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md md:p-10 lg:min-h-[620px]">
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300 md:text-xs">
              NoBSFlips / Flip Journal
            </div>

            <h1 className="mt-6 text-[3rem] font-black uppercase leading-[0.88] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              No Bullshit.
              <span className="block text-purple-300">Just Flips.</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-white/82 md:text-xl md:leading-9">
              I buy random stuff, list it, track the numbers, and show what
              actually works. Wins, fails, slow movers — all of it.
            </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/fliplog"
                  className="flex h-12 items-center justify-center rounded-2xl bg-purple-600 px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_0_22px_rgba(147,51,234,0.35)] transition hover:scale-[1.01] hover:bg-purple-500"
                >
                  View Flip Log
                </Link>

                <Link
                  href="/media"
                  className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
                >
                  Watch Media
                </Link>
              </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <MiniCard label="Track" value="Buys" />
              <MiniCard label="Measure" value="Profit" />
              <MiniCard label="Show" value="Proof" />
            </div>
          </div>

          <div className="grid gap-6">
            <Panel label="Featured Video" title="Start the journey here">
              <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_24px_rgba(0,0,0,0.35)]">
                <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18),rgba(0,0,0,1)_64%)]">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-3xl font-black text-white shadow-[0_0_22px_rgba(147,51,234,0.35)]">
                      ▶
                    </div>

                    <p className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-white">
                      Intro video coming soon
                    </p>

                    <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/60">
                      The first video people watch before diving into the flip
                      results.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/media"
                className="mt-5 inline-flex rounded-full border border-purple-400/40 bg-purple-500/15 px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-purple-200 transition hover:border-purple-300/70 hover:bg-purple-500/25"
              >
                More Media
              </Link>
            </Panel>

            <Panel label="About" title="Follow the experiment.">
              <p className="mt-3 text-sm leading-7 text-white/75">
                This is not fake guru flipping. It is a public journal of what
                happens when I actually buy, list, sell, and learn from the
                numbers.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <SocialLink href="https://www.youtube.com/@NoBSFlips" label="YouTube">
                  <YouTubeIcon />
                </SocialLink>

                <SocialLink href="https://www.instagram.com/nobsflipin/" label="Instagram">
                  <InstagramIcon />
                </SocialLink>

                <SocialLink href="https://discord.gg/bvThRRf9Y5" label="Discord">
                  <DiscordIcon />
                </SocialLink>
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </main>
  );
}

function Panel({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">
        {label}
      </p>

      <h2 className="mt-3 text-2xl font-black uppercase text-white md:text-3xl">
        {title}
      </h2>

      {children}
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black uppercase text-white">{value}</p>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-20 flex-col items-center justify-center rounded-2xl border border-purple-400/35 bg-purple-500/10 text-white transition hover:border-purple-300/70 hover:bg-purple-500/20"
    >
      {children}
      <span className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]">
        {label}
      </span>
    </a>
  );
}