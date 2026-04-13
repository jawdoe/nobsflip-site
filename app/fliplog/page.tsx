export default function FlipLogPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-500">
          Flip Log
        </p>
        <h1 className="text-3xl font-bold">Live flipping log</h1>
        <p className="mt-4 text-gray-600">
          This is where your real flip entries will go once we connect the backend.
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 p-8 text-gray-500">
          No entries yet.
        </div>
      </section>
    </main>
  );
}