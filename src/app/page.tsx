"use client";

import Link from "next/link";
import { MarkdownText } from "@/components/MarkdownText";
import { ProgressBar } from "@/components/ProgressBar";
import { certItemIds, certifications, allItemIds, roadmap, VOUCHER_EXPIRY } from "@/lib/roadmap";
import { daysBetween, formatDay, parseDay, useToday } from "@/lib/dates";
import { tally, useProgress } from "@/lib/useProgress";

export default function HomePage() {
  const { checked, examDates } = useProgress();
  const today = useToday();

  const overall = tally(allItemIds, checked);
  const perCert = certifications.map((cert) => ({
    cert,
    stats: tally(certItemIds(cert), checked),
  }));
  // "Current" = the first certification that isn't finished; everything after it
  // is future work and gets dialled back visually.
  const currentIndex = Math.max(
    0,
    perCert.findIndex((c) => c.stats.percent < 100),
  );

  const daysToExpiry = today === null ? null : daysBetween(today, parseDay(VOUCHER_EXPIRY));
  const remaining = overall.total - overall.done;
  const perDay =
    daysToExpiry !== null && daysToExpiry > 0 ? (remaining / daysToExpiry).toFixed(1) : null;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-14 sm:px-8 sm:pt-20">
      {/* ---------------------------------------------------------- masthead */}
      <section className="rise">
        <p className="meta">Study plan · CLF → AIF → SAA → DVA</p>
        <h1 className="serif mt-4 max-w-2xl text-[2.1rem] font-medium sm:text-[2.8rem]">
          Four AWS certifications, one deadline.
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          {roadmap.totals.items} checklist items parsed straight from the roadmap. Every voucher
          expires {formatDay(VOUCHER_EXPIRY)} — the exams have to be sat before then.
        </p>
      </section>

      {/* --------------------------------------------------------- countdown */}
      <section
        className="rise mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <Stat
          label="Days to voucher expiry"
          value={daysToExpiry === null ? "—" : String(daysToExpiry)}
          hint={formatDay(VOUCHER_EXPIRY)}
          tone={daysToExpiry !== null && daysToExpiry < 60 ? "warn" : "normal"}
        />
        <Stat label="Overall complete" value={`${overall.percent}%`} hint={`${overall.done} of ${overall.total} items`} />
        <Stat label="Items remaining" value={String(remaining)} hint="across all four exams" />
        <Stat
          label="Needed per day"
          value={perDay ?? "—"}
          hint={daysToExpiry !== null && daysToExpiry > 0 ? "to finish before expiry" : "deadline passed"}
        />
      </section>

      <section className="rise mt-8" style={{ "--i": 2 } as React.CSSProperties}>
        <ProgressBar percent={overall.percent} label="Overall progress" />
      </section>

      {/* ------------------------------------------------------------- cards */}
      <section className="mt-16">
        <h2 className="meta">Certifications</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {perCert.map(({ cert, stats }, index) => {
            const future = index > currentIndex;
            const examDate = examDates[cert.id];
            const daysToExam =
              today !== null && examDate ? daysBetween(today, parseDay(examDate)) : null;
            const late = examDate ? parseDay(examDate) > parseDay(VOUCHER_EXPIRY) : false;

            return (
              <li key={cert.id} className="rise" style={{ "--i": index + 3 } as React.CSSProperties}>
                <Link
                  href={`/cert/${cert.id}`}
                  className={`group flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:p-7 ${
                    future ? "opacity-60 hover:opacity-100" : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="meta">{cert.code}</span>
                    {index === currentIndex && stats.percent < 100 ? (
                      <span className="meta text-accent">In progress</span>
                    ) : stats.percent === 100 ? (
                      <span className="meta">Complete</span>
                    ) : (
                      <span className="meta">Step {cert.order}</span>
                    )}
                  </div>

                  <h3 className="serif mt-3 text-[1.4rem] font-medium">{cert.name}</h3>

                  <p className="mt-2 text-[13px] text-muted">
                    {cert.domains.length} domains · {cert.itemCount} items ·{" "}
                    {cert.examFacts.timeMinutes} min exam
                  </p>

                  <div className="mt-auto pt-7">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-[13px] tabular-nums text-muted">
                        {stats.done} / {stats.total}
                      </span>
                      <span className="serif text-[1.35rem] tabular-nums">{stats.percent}%</span>
                    </div>
                    <ProgressBar
                      percent={stats.percent}
                      tone={future ? "faint" : "ink"}
                      label={`${cert.code} progress`}
                    />
                    {examDate ? (
                      <p className={`mt-3 text-[12px] ${late ? "text-warn" : "text-muted"}`}>
                        Exam {formatDay(examDate)}
                        {daysToExam !== null
                          ? ` · ${daysToExam >= 0 ? `${daysToExam} days away` : `${Math.abs(daysToExam)} days ago`}`
                          : ""}
                        {late ? " · after voucher expiry" : ""}
                      </p>
                    ) : (
                      <p className="mt-3 text-[12px] text-faint">No exam date set</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --------------------------------------------------------- resources */}
      <section className="mt-16 rounded-xl border border-line bg-raised p-6 sm:p-8">
        <h2 className="meta">Resources</h2>
        <ul className="mt-4 space-y-2.5">
          {roadmap.resources.map((r, i) => (
            <li key={i} className="text-[14px] leading-relaxed text-muted">
              <MarkdownText text={r} />
            </li>
          ))}
        </ul>
        {roadmap.meta.scoringNote ? (
          <p className="mt-6 border-t border-line pt-5 text-[14px] leading-relaxed text-muted">
            {roadmap.meta.scoringNote}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "normal",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "normal" | "warn";
}) {
  return (
    <div className="bg-surface px-5 py-6">
      <p className="meta">{label}</p>
      <p
        className={`serif mt-2 text-[1.9rem] tabular-nums leading-none ${
          tone === "warn" ? "text-warn" : ""
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-[12px] text-faint">{hint}</p> : null}
    </div>
  );
}
