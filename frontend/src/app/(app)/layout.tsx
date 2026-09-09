import Link from "next/link";
import { NavLinks } from "@/components/nav-links";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <Link
            href="/threads"
            className="flex shrink-0 items-center gap-2 text-sm font-semibold whitespace-nowrap text-foreground sm:text-base"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_var(--accent)]" />
            Meeting Intelligence
          </Link>
          <NavLinks />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
