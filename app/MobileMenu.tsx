"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/fliplog", label: "Flip Log" },
  { href: "/scan", label: "Scan" },
  { href: "/media", label: "Videos" },
];

export default function MobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b border-purple-500/15 bg-black/95 px-4 py-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.08em] transition-all ${
                    isActive
                      ? "border border-purple-400/40 bg-purple-500/20 text-purple-200"
                      : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-white/10 pt-3">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-xs text-white/40">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/60 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block w-full rounded-xl border border-purple-400/40 bg-purple-500/15 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.08em] text-purple-300 transition hover:bg-purple-500/25"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
