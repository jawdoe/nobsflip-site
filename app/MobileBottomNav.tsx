"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

function Icon({ d, size = "h-5 w-5" }: { d: string | string[]; size?: string }) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className={size}>
      {paths.map((p, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" d={p} />)}
    </svg>
  );
}

const ICONS = {
  add: "M12 4.5v15m7.5-7.5h-15",
  log: ["M8.25 6.75h7.5", "M8.25 12h7.5", "M8.25 17.25h5.25"],
  upgrade: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  me: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  login: "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75",
  pricing: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
};

function NavItem({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} className="flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-all">
      <span className={active ? "text-purple-300" : "text-white/40"}>{icon}</span>
      <span className={"text-[10px] font-black uppercase tracking-wide " + (active ? "text-purple-300" : "text-white/30")}>
        {label}
      </span>
    </Link>
  );
}

function ScanButton({ active }: { active: boolean }) {
  return (
    <Link href="/scan" className="relative flex flex-1 flex-col items-center justify-end pb-2">
      <div className={
        "absolute -top-6 flex h-16 w-16 flex-col items-center justify-center rounded-full shadow-xl transition-all " +
        (active ? "bg-purple-500 shadow-purple-500/50 scale-105" : "bg-purple-600 shadow-purple-600/40")
      }>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
        </svg>
        <span className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-white/90">Scan</span>
      </div>
      <span className="h-12 w-full" />
    </Link>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const scanActive = pathname.startsWith("/scan");

  if (loading) return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden h-16" />
  );

  // LOGGED OUT — minimal, conversion-focused
  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
        <div className="flex items-end">
          <NavItem href="/pricing" label="Pricing" active={pathname.startsWith("/pricing")}
            icon={<Icon d={ICONS.pricing} />} />
          <ScanButton active={scanActive} />
          <NavItem href="/login" label="Login" active={pathname.startsWith("/login")}
            icon={<Icon d={ICONS.login} />} />
        </div>
      </nav>
    );
  }

  // LOGGED IN — power user layout
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 backdrop-blur-xl md:hidden">
      <div className="flex items-end">
        <NavItem href="/admin" label="Add" active={pathname.startsWith("/admin")}
          icon={<Icon d={ICONS.add} />} />
        <NavItem href="/dashboard" label="Log" active={pathname.startsWith("/dashboard")}
          icon={<Icon d={ICONS.log} />} />
        <ScanButton active={scanActive} />
        <NavItem href="/pricing" label="Upgrade" active={pathname.startsWith("/pricing")}
          icon={<Icon d={ICONS.upgrade} />} />
        <NavItem href="/dashboard" label="Profile" active={false}
          icon={<Icon d={ICONS.me} />} />
      </div>
    </nav>
  );
}
