"use client";

export default function InstallAppButton({
  className = "",
  label = "📲 Download to ya phone",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("nbf:install"))}
      className={
        "inline-flex items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-500/10 px-6 py-3 text-sm font-black uppercase tracking-[0.1em] text-purple-200 transition hover:bg-purple-500/20 " +
        className
      }
    >
      {label}
    </button>
  );
}
