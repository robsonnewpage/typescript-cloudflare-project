"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/threads", label: "Threads" },
  { href: "/meetings", label: "Meetings" },
  { href: "/search", label: "Search" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
              active ? "bg-accent-muted text-accent-strong" : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
