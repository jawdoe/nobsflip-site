import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d0b16] px-4 text-white">
      <div className="text-center">
        <div className="text-8xl font-black text-purple-500/30">404</div>
        <h1 className="mt-4 text-2xl font-black uppercase tracking-tight">Strewth. Nothing here, mate.</h1>
        <p className="mt-2 text-sm text-white/40">Might've done a runner, might've never existed. Either way, ya lost.</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/scan" className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-purple-500">
            Go Scan Something
          </Link>
          <Link href="/" className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-black uppercase tracking-wide text-white/50 transition hover:text-white">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
