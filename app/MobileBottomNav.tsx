"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d={active ? "M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" : "M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"} />
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
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: "/pricing",
    label: "Upgrade",
    icon: (_active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

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
      </div>
    </nav>
  );
}
