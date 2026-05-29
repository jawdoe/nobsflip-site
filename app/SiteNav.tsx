"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/fliplog", label: "Flip Log" },
  { href: "/media", label: "Videos" },
  { href: "/about", label: "About" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm font-bold text-white/60 md:flex">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition hover:text-[#8cff00] ${
              isActive ? "text-[#8cff00]" : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}