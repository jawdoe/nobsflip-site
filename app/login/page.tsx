"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/scan";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess("Check your email for a confirmation link before signing in.");
        setLoading(false);
      }
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#07070a] px-6 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_36%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_34%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="text-lg font-black tracking-[0.32em] text-white">NOBSFLIPS</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-purple-300/80">
            No Bullshit. Just Flips.
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => { setMode("signin"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-xl py-2 text-sm font-black uppercase tracking-[0.08em] transition-all ${
                mode === "signin"
                  ? "bg-purple-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.3)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
              className={`flex-1 rounded-xl py-2 text-sm font-black uppercase tracking-[0.08em] transition-all ${
                mode === "signup"
                  ? "bg-purple-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.3)]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-white/50">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.15em] text-white/50">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="required"
                required
                minLength={6}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-purple-400/60 focus:ring-1 focus:ring-purple-400/30 transition"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-black uppercase tracking-[0.1em] text-white shadow-[0_0_22px_rgba(147,51,234,0.28)] transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? mode === "signin" ? "Signing in..." : "Creating account..."
                : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
