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
  { href: "/history", label: "History" },
  { href: "/pricing", label: "Pricing" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUser(u);
      if (u) {
        const { data: profile } = await supabase.from("profiles").select("display_name,avatar_url").eq("id", u.id).single();
        setDisplayName(profile?.display_name ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) { setDisplayName(null); setAvatarUrl(null); }
    });
    return () => listener.subscription.unsubscribe();
  }, [pathname]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? "?";
  const label = displayName ?? user?.email?.split("@")[0] ?? "";

  return (
    <nav className="hidden items-center gap-2 md:flex">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}
            className={"rounded-xl px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-all " +
              (isActive
                ? "border border-purple-400/40 bg-purple-500/20 text-purple-200 shadow-[0_0_20px_rgba(147,51,234,0.25)]"
                : "text-white/65 hover:bg-white/[0.04] hover:text-white")}>
            {item.label}
          </Link>
        );
      })}

      {user ? (
        <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
          <Link href="/profile" className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.04]">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-purple-500/40 bg-purple-500/20 flex items-center justify-center">
              {avatarUrl
                ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                : <span className="text-[10px] font-black text-purple-300">{initials}</span>
              }
            </div>
            <span className="max-w-[120px] truncate text-xs font-black text-white/60">{label}</span>
          </Link>
          <button onClick={handleSignOut}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/50 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300">
            Out
          </button>
        </div>
      ) : (
        <Link href="/login"
          className="ml-2 rounded-xl border border-purple-400/40 bg-purple-500/15 px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-purple-300 transition hover:bg-purple-500/25">
          Sign In
         </Link>
      )}
    </nav>
  );
}
