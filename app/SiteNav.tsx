"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/fliplog", label: "Flip Log" },
  { href: "/media", label: "Videos" },
  { href: "/about", label: "About" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-8 md:flex">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative text-sm font-black uppercase tracking-[0.18em] transition ${
              isActive
                ? "text-[#8cff00]"
                : "text-white/80 hover:text-[#8cff00]"
            }`}
          >
            {link.label}

            {isActive && (
              <span className="absolute -bottom-3 left-0 h-[2px] w-full rounded-full bg-[#8cff00] shadow-[0_0_18px_rgba(140,255,0,0.9)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}