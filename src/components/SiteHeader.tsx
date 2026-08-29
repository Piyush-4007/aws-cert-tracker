"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";
import { ThemeToggle } from "./ThemeToggle";
import { VOUCHER_EXPIRY, allItemIds } from "@/lib/roadmap";
import { daysBetween, parseDay, useToday } from "@/lib/dates";
import { useProgress } from "@/lib/useProgress";
import { tally } from "@/lib/useProgress";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/weak-spots", label: "Weak spots" },
  { href: "/data", label: "Data" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const today = useToday();
  const { checked } = useProgress();
  const overall = tally(allItemIds, checked);
  const daysLeft = today === null ? null : daysBetween(today, parseDay(VOUCHER_EXPIRY));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-5 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="serif text-[15px] font-medium">AWS Certification</span>
          <span className="meta hidden sm:inline">Tracker</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Sections">
          {NAV.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2 py-1.5 text-[13px] transition-colors sm:px-2.5 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 border-l border-line pl-3 md:flex">
          <span className="meta" title="Overall progress across all four certifications">
            {overall.percent}%
          </span>
          <span
            className={`meta ${daysLeft !== null && daysLeft < 60 ? "text-warn" : ""}`}
            title={`Vouchers expire ${VOUCHER_EXPIRY}`}
          >
            {daysLeft === null ? "—" : `${daysLeft}d left`}
          </span>
        </div>

        <AccountMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
