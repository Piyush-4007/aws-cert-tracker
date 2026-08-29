"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "./AccountMenu";
import { ThemeToggle } from "./ThemeToggle";
import { VOUCHER_EXPIRY, allItemIds } from "@/lib/roadmap";
import { daysBetween, parseDay, useToday } from "@/lib/dates";
import { tally, useProgress } from "@/lib/useProgress";

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {/* Row one. On a phone this holds only the wordmark and the two controls,
            so nothing is ever pushed off the right edge. */}
        <div className="flex h-14 items-center gap-3">
          <Link href="/" className="flex min-w-0 items-baseline gap-2">
            <span className="serif truncate text-[15px] font-medium">AWS Certification</span>
            <span className="meta hidden sm:inline">Tracker</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 sm:flex" aria-label="Sections">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                  isActive(link.href) ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-3">
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
        </div>

        {/* Row two, phones only: navigation gets the full width to itself. */}
        <nav
          className="-mx-5 flex h-11 items-stretch border-t border-line sm:hidden"
          aria-label="Sections"
        >
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`flex flex-1 items-center justify-center whitespace-nowrap px-2 text-center text-[13px] transition-colors ${
                isActive(link.href)
                  ? "border-b-2 border-ink text-ink"
                  : "border-b-2 border-transparent text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
