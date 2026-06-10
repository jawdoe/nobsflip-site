"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/scan";
  const supabase = createSupabaseBrowserClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else if (data.session) { window.location.href = redirectTo; }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else if (data.session) { window.location.href = redirectTo; }
      else { setSuccess("Check your email to confirm your account."); }
    }

    setLoading(false);
  }

  return (
    <div className="relative w-full max-w-sm">
      <div className="mb-6 text-center">
        <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
          NoBSFlips
        </div>
        <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-white">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-white/50">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/20 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.1em] text-white/50">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white/60"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          {success && <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
            className="text-xs text-white/35 underline hover:text-white/60"
          >
            {mode === "login" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0b16] px-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.10),transparent_50%)]" />
      </div>
      <Suspense fallback={<div className="text-white/30 text-sm">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
