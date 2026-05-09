export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/about-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a]/90 via-transparent to-black/25" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-[#8cff00]/35 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#8cff00] backdrop-blur">
            NOBSFLIP / The Journey
          </div>

          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            One bloke.
            <span className="block text-[#8cff00] text-stroke-heavy">
              Real flips.
            </span>
            <span className="block">No BS.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
            NoBSFlip is my public flipping journey — tracking real buys, real
            sales, real mistakes, and real numbers while I build a better system
            for finding and flipping items.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Personal journey",
              text: "This starts with me actually sourcing, buying, listing, selling, and learning in public.",
            },
            {
              title: "Real stats",
              text: "Profit, ROI, active flips, sold items, losses, slow movers, and wins are all part of the log.",
            },
            {
              title: "Content first",
              text: "The website connects the flip log with YouTube updates, shorts, lessons, and Brogan commentary.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-black/45 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md"
            >
              <h3 className="text-xl font-black uppercase tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
              Why this exists
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight">
              I’m testing if this can actually work.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/70">
              NoBSFlip is not pretending to be some perfect reseller success
              story. It is a real-world experiment: buy low, list properly,
              track the numbers, learn from the results, and improve over time.
            </p>

            <p className="mt-4 text-sm leading-7 text-white/70">
              Some flips will win. Some will sit there doing nothing. Some will
              be a waste of time. That is the point — the full picture gets
              logged, not just the good bits.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-black/45 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">
              How it works
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase tracking-tight">
              Source → Log → Sell → Learn
            </h2>

            <ul className="mt-6 space-y-4 text-sm text-white/70">
              <li>• Find items through op-shops, marketplaces, and local buys</li>
              <li>• Log the buy price, expected sale price, photos, and notes</li>
              <li>• Track what actually sells and what it really sells for</li>
              <li>• Turn the wins, losses, and patterns into better decisions</li>
            </ul>

            <p className="mt-6 text-sm leading-7 text-white/65">
              The goal is not to look rich overnight. The goal is to build a
              repeatable flipping system from real experience.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-[2rem] border border-[#8cff00]/25 bg-black/50 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur-md md:p-10">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8cff00]/80">
            The Bigger Plan
          </p>

          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight md:text-4xl">
            Build the journey first.
            <span className="block text-[#8cff00]">
              Build the system after.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">
            The first goal is simple: grow the NoBSFlip brand around the real
            flipping journey, YouTube content, personal stats, and honest
            results. People should be able to follow the progress and see
            exactly what is working.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
            Later, once the process has been tested properly, the tools and
            systems built along the way can become something other people use
            too. But the foundation is the journey, the content, and the proof.
          </p>
        </div>
      </section>
    </main>
  );
}