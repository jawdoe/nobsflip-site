"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-all duration-200 ${
              isActive
                ? "border border-purple-400/40 bg-purple-500/20 text-purple-200 shadow-[0_0_20px_rgba(147,51,234,0.25)]"
                : "text-white/65 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      {user ? (
        <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-4">
          <span className="max-w-[160px] truncate text-xs text-white/40">
            {user.email}
          </span>
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
          className="ml-2 rounded-xl border border-purple-400/40 bg-purple-500/15 px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-purple-300 transition hover:bg-purple-500/25"
        >
          Sign In
      