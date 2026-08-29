"use client";

import Link from "next/link";
import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { flatSections, sectionItemIds } from "@/lib/roadmap";
import { tally, useProgress } from "@/lib/useProgress";

export default function WeakSpotsPage() {
  const { checked } = useProgress();
  const [showUntouched, setShowUntouched] = useState(true);

  const rows = flatSections
    .map((entry) => ({ ...entry, stats: tally(sectionItemIds(entry.section), checked) }))
    .filter((r) => r.stats.total > 0 && r.stats.percent < 50);

  const started = rows.filter((r) => r.stats.done > 0);
  const untouched = rows.filter((r) => r.stats.done === 0);

  // Heavier domains first — a gap in a 30% domain costs more than one in a 12% domain.
  const byWeight = <T extends { domainWeight: number; cert: { order: number } }>(a: T, b: T) =>
    b.domainWeight - a.domainWeight || a.cert.order - b.cert.order;

  started.sort(byWeight);
  untouched.sort((a, b) => a.cert.order - b.cert.order || byWeight(a, b));

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-16">
      <div className="rise">
        <p className="meta">Gaps</p>
        <h1 className="serif mt-4 text-[2rem] font-medium sm:text-[2.5rem]">Weak spots</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          Every subsection across all four certifications where fewer than half the items are
          ticked. Heaviest exam domains first.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-line py-3">
        <p className="text-[13px] text-muted">
          <span className="tabular-nums text-ink">{rows.length}</span> subsections below 50% ·{" "}
          <span className="tabular-nums text-ink">{started.length}</span> started
        </p>
        <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-muted">
          <input
            type="checkbox"
            className="check"
            style={{ marginTop: 0 }}
            checked={showUntouched}
            onChange={(e) => setShowUntouched(e.target.checked)}
          />
          Include untouched
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="py-20 text-center text-[15px] text-muted">
          Nothing below 50%. Every subsection is at least half done.
        </p>
      ) : null}

      {started.length ? (
        <Group title="Started, still behind" rows={started} />
      ) : rows.length ? (
        <p className="mt-10 text-[14px] text-muted">
          Nothing part-finished yet — everything below is untouched.
        </p>
      ) : null}

      {showUntouched && untouched.length ? (
        <Group title="Not started" rows={untouched} muted />
      ) : null}
    </div>
  );
}

type Row = (typeof flatSections)[number] & { stats: { done: number; total: number; percent: number } };

function Group({ title, rows, muted }: { title: string; rows: Row[]; muted?: boolean }) {
  return (
    <section className="mt-12">
      <h2 className="meta">
        {title} · {rows.length}
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {rows.map((row) => (
          <li key={row.section.id}>
            <Link
              href={`/cert/${row.cert.id}`}
              className="-mx-2 block rounded-md px-2 py-4 transition-colors hover:bg-raised"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="meta shrink-0">{row.cert.code}</span>
                <span className="meta shrink-0 text-faint">
                  D{row.domainNumber} · {row.domainWeight}%
                </span>
                <h3 className={`min-w-0 flex-1 text-[15px] font-medium ${muted ? "text-muted" : ""}`}>
                  {row.section.number ? `${row.section.number} ` : ""}
                  {row.section.implicit ? row.domainTitle : row.section.title}
                </h3>
                <span className="shrink-0 text-[13px] tabular-nums text-muted">
                  {row.stats.done}/{row.stats.total}
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-faint">{row.domainTitle}</p>
              <div className="mt-3">
                <ProgressBar
                  percent={row.stats.percent}
                  tone={muted ? "faint" : "ink"}
                  label={`${row.section.title} progress`}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
