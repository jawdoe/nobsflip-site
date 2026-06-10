"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    href: "/scan",
    label: "Scan",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
      </svg>
    ),
  },
  {
    href: "/admin",
    label: "Add Flip",
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LoginIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const accountHref = user ? "/pricing" : "/login";
  const accountLabel = user ? "Account" : "Login";
  const accountActive = pathname.startsWith("/pricing") || pathname.startsWith("/login");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const isScan = item.href === "/scan";

          return (
            <Link key={item.href} href={item.href}
              className={"flex flex-1 flex-col items-center justify-center gap-1 py-3 transition " + (isScan ? "relative -top-3 mx-1" : "")}>
              {isScan ? (
                <div className={"flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition " + (isActive ? "bg-purple-500 shadow-purple-500/40" : "bg-purple-600 shadow-purple-600/30")}>
                  <span className={isActive ? "text-white" : "text-white/90"}>{item.icon(isActive)}</span>
                </div>
              ) : (
                <>
                  <span className={isActive ? "text-purple-300" : "text-white/40"}>{item.icon(isActive)}</span>
                  <span className={"text-[10px] font-black uppercase tracking-wide " + (isActive ? "text-purple-300" : "text-white/30")}>{item.label}</span>
                </>
              )}
              {isScan && <span className={"text-[10px] font-black uppercase tracking-wide " + (isActive ? "text-purple-300" : "text-white/50")}>Scan</span>}
            </Link>
          );
        })}

        {/* Auth-aware account/login item */}
        <Link href={accountHref}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition">
          <span className={accountActive ? "text-purple-300" : "text-white/40"}>
            {user ? <AccountIcon /> : <LoginIcon />}
          </span>
          <span className={"text-[10px] font-black uppercase tracking-wide " + (accountActive ? "text-purple-300" : "text-white/30")}>
            {accountLabel}
          </span>
        </Link>
      </div>
    </nav>
  );
}
