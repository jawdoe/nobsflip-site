export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.2em] text-gray-500">
          NoBSFlip
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Trial &amp; Error Flipping Log
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          Honest flip attempts, real results, what worked, what bombed, and what
          I learned along the way.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/fliplog"
            className="rounded-xl bg-black px-6 py-3 text-white transition hover:opacity-90"
          >
            View Flip Log
          </a>

          <a
            href="/about"
            className="rounded-xl border border-gray-300 px-6 py-3 transition hover:bg-gray-50"
          >
            About the Project
          </a>
        </div>
      </section>
    </main>
  );
}