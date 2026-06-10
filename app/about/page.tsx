import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const INTRO_VIDEO_URL = "";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
      <path d="M23.5 6.2s-.2-1.7-.9-2.4c-.9-.9-1.9-.9-2.3-1C17.1 2.5 12 2.5 12 2.5s-5.1 0-8.3.3c-.5.1-1.5.1-2.3 1C.7 4.5.5 6.2.5 6.2S.2 8.2.2 10.3v1.9c0 2.1.3 4.1.3 4.1s.2 1.7.9 2.4c.9.9 2.1.9 2.6 1 1.9.2 8 .3 8 .3s5.1 0 8.3-.3c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.4.9-2.4s.3-2.1.3-4.1v-1.9c0-2.1-.3-4.1-.3-4.1ZM9.7 14.7V7.8l6.6 3.5-6.6 3.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.7 1.7a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
      <path d="M20.3 4.4A16.8 16.8 0 0 0 16.1 3l-.2.4c1.5.4 2.2 1 2.2 1s-1.9-1-5.9-1-5.9 1-5.9 1 .8-.6 2.3-1L8.3 3a16.8 16.8 0 0 0-4.2 1.4C1.5 8.3.8 12.1 1.1 15.9c1.7 1.3 3.4 2 5 2.5l.7-1.2c-.4-.1-.9-.3-1.3-.6l.3-.2c2.5 1.2 5.3 1.2 7.8 0l.3.2c-.4.3-.9.5-1.3.6l.7 1.2c1.6-.5 3.3-1.2 5-2.5.4-4.4-.7-8.1-3-11.5ZM8.4 13.8c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Zm7.2 0c-.8 0-1.5-.8-1.5-1.7s.7-1.7 1.5-1.7 1.5.8 1.5 1.7-.7 1.7-1.5 1.7Z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0d0b16] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-dunny-bg.png')] bg-cover bg-center bg-no-repeat opacity-20 md:opacity-35" />
        <div className="absolute inset-0 bg-black/84" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_32%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b16] via-[#0d0b16]/82 to-black/55" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-32 pt-8 sm:px-6 md:px-8 md:pb-24 md:pt-16">
        <div className="grid gap-6 lg:grid-cols-[1fr,0.72fr] lg:items-start">
          <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-md md:p-10">
            <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-purple-300 md:text-xs">
              About NoBSFlips
            </div>

            <h1 className="mt-5 text-[2.8rem] font-black uppercase leading-[0.9] tracking-tight text-white md:text-7xl">
              The point
              <span className="block text-purple-300">of this.</span>
            </h1>

            <p className="mt-6 text-sm leading-7 text-white/80 md:max-w-3xl md:text-lg md:leading-8">
              NoBSFlips is a public flipping journal. Not fake guru stuff. Not
              rented Lambos. Not pretending every item is a massive win.
            </p>

            <p className="mt-5 text-sm leading-7 text-white/68 md:max-w-3xl md:text-lg md:leading-8">
              The goal is simple: buy stuff, test ideas, learn from the numbers,
              and show the full process publicly — including the mistakes, slow
              movers, and bad buys.
            </p>

            <p className="mt-5 text-sm leading-7 text-white/68 md:max-w-3xl md:text-lg md:leading-8">
              Over time this becomes a real results journal: what was bought,
              what it listed for, what it sold for, how long it took, and what
              actually worked.
            </p>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_30px_rgba(0,0,0,0.35)]">
              {INTRO_VIDEO_URL ? (
                <iframe
                  src={INTRO_VIDEO_URL}
                  title="NoBSFlips Intro"
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.16),rgba(0,0,0,1)_62%)]">
                  <div className="px-6 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 text-4xl font-black text-white shadow-[0_0_24px_rgba(147,51,234,0.4)]">
                      ▶
                    </div>

                    <p className="mt-5 text-base font-black uppercase tracking-[0.16em] text-white">
                      Intro video coming soon
                    </p>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
                      This will explain the journey, the flip log, the content,
                      and where NoBSFlips is heading.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 md:flex-row">
              <Link
                href="/fliplog"
                className="flex h-12 items-center justify-center rounded-2xl bg-purple-600 px-6 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:scale-[1.01] hover:bg-purple-500"
              >
                View Flip Log
              </Link>

              <Link
                href="/dashboard"
                className="flex h-12 items-center justify-center rounded-2xl border border-purple-400/35 bg-purple-500/10 px-6 text-xs font-black uppercase tracking-[0.14em] text-purple-100 transition hover:border-purple-300/60 hover:bg-purple-500/20"
              >
                View Dashboard
              </Link>

              <Link
                href="/media"
                className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:bg-white/[0.08]"
              >
                Watch Media
              </Link>
            </div>
          </div>

          <aside className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-purple-300">
                What it is
              </p>

              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white">
                A results journal.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/68">
                The site tracks the journey, not just the wins. Bought price,
                listed price, sold price, ROI, days to sell, and lessons learned.
              </p>
            </div>

            <div className="grid gap-4">
              <InfoCard
                label="Real Numbers"
                title="No fake wins"
                text="Every flip can be tracked publicly. Good or bad."
              />

              <InfoCard
                label="Real Journey"
                title="Built in public"
                text="The videos, website, and tools evolve as the journey evolves."
              />

              <InfoCard
                label="Real Learning"
                title="Trial and error"
                text="Testing what actually works instead of pretending to know everything already."
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/42">
                Follow The Journey
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <SocialLink
                  href="https://youtube.com"
                  label="YouTube"
                  className="border-purple-400/35 bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.16)] hover:border-purple-300/60 hover:bg-purple-500/20"
                >
                  <YouTubeIcon />
                </SocialLink>

                <SocialLink
                  href="https://instagram.com"
                  label="Instagram"
                  className="border-purple-400/35 bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.16)] hover:border-purple-300/60 hover:bg-purple-500/20"
                >
                  <InstagramIcon />
                </SocialLink>

                <SocialLink
                  href="https://discord.gg"
                  label="Discord"
                  className="border-purple-400/35 bg-purple-500/10 shadow-[0_0_25px_rgba(147,51,234,0.16)] hover:border-purple-300/60 hover:bg-purple-500/20"
                >
                  <DiscordIcon />
                </SocialLink>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Link
        href="/"
        aria-label="Back to home"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-purple-300/30 bg-purple-600 text-white shadow-[0_0_28px_rgba(147,51,234,0.55)] transition hover:scale-105 hover:bg-purple-500 active:scale-95 md:bottom-8 md:right-8"
      >
        <ArrowLeft className="h-6 w-6" />
      </Link>
    </main>
  );
}

function InfoCard({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/72 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
        {label}
      </p>

      <h3 className="mt-3 text-xl font-black uppercase text-white">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-white/68">{text}</p>
    </div>
  );
}

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`flex h-20 flex-col items-center justify-center rounded-2xl border text-white transition ${className}`}
    >
      {children}

      <span className="mt-2 text-[10px] font-black uppercase tracking-[0.12em]">
        {label}
      </span>
    </a>
  );
}