"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarkdownText } from "./MarkdownText";
import { ProgressBar } from "./ProgressBar";
import { ExamDatePanel } from "./ExamDatePanel";
import { certById, postExamItems, postExamKey, roadmap, sectionItemIds } from "@/lib/roadmap";
import { setMany, setSortByWeight, toggleItem } from "@/lib/store";
import { tally, useProgress } from "@/lib/useProgress";
import type { Domain, Item, Section } from "@/lib/types";

export function CertView({ certId }: { certId: string }) {
  const cert = certById.get(certId)!;
  const { checked, sortByWeight } = useProgress();
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim().toLowerCase();
  const searching = trimmed.length > 0;

  const domains = useMemo(() => {
    const list = [...cert.domains];
    if (sortByWeight) list.sort((a, b) => b.weightPercent - a.weightPercent || a.number - b.number);
    return list;
  }, [cert, sortByWeight]);

  /** Domain -> sections -> items, with items filtered when a search is active. */
  const view = useMemo(() => {
    return domains.map((domain) => {
      const sections = domain.sections
        .map((section) => ({
          section,
          items: searching
            ? section.items.filter((i) => i.text.toLowerCase().includes(trimmed))
            : section.items,
        }))
        .filter((s) => !searching || s.items.length > 0);
      return { domain, sections };
    });
  }, [domains, searching, trimmed]);

  const matchCount = view.reduce(
    (n, d) => n + d.sections.reduce((m, s) => m + s.items.length, 0),
    0,
  );

  const certItems = cert.domains.flatMap((d) => d.sections.flatMap((s) => s.items.map((i) => i.id)));
  const stats = tally(certItems, checked);

  const postIds = postExamItems.map((i) => postExamKey(cert.id, i.id));
  const postStats = tally(postIds, checked);

  /* --------------------------------------------------------- keyboard nav */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === "Escape" && target === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== "j" && e.key !== "k") return;

      const boxes = Array.from(
        listRef.current?.querySelectorAll<HTMLInputElement>("input.check[data-item]") ?? [],
      );
      if (!boxes.length) return;
      e.preventDefault();
      const at = boxes.indexOf(document.activeElement as HTMLInputElement);
      const next =
        at === -1
          ? 0
          : e.key === "j"
            ? Math.min(boxes.length - 1, at + 1)
            : Math.max(0, at - 1);
      boxes[next].focus();
      boxes[next].scrollIntoView({ block: "center", behavior: "smooth" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const allCollapsed = view.every(({ domain }) => collapsed[domain.id]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    if (!allCollapsed) for (const { domain } of view) next[domain.id] = true;
    setCollapsed(next);
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-14" ref={listRef}>
      {/* ------------------------------------------------------------ header */}
      <div className="rise">
        <Link href="/" className="meta transition-colors hover:text-ink">
          ← All certifications
        </Link>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="serif text-[2rem] font-medium sm:text-[2.5rem]">{cert.name}</h1>
          <span className="meta">{cert.code}</span>
        </div>

        {cert.domainSummary ? (
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-muted">
            {cert.domainSummary}
          </p>
        ) : null}
        {cert.intro.map((p, i) => (
          <p key={i} className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
            <MarkdownText text={p} />
          </p>
        ))}

        <div className="mt-8 flex items-baseline justify-between">
          <span className="text-[13px] tabular-nums text-muted">
            {stats.done} of {stats.total} items
          </span>
          <span className="serif text-[1.5rem] tabular-nums">{stats.percent}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={stats.percent} label={`${cert.code} progress`} />
        </div>
      </div>

      {/* -------------------------------------------------------- exam facts */}
      <dl
        className="rise mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <Fact
          label="Questions"
          value={String(cert.examFacts.questions)}
          hint={cert.examFacts.scoredQuestions ? `${cert.examFacts.scoredQuestions} scored` : undefined}
        />
        <Fact label="Time" value={`${cert.examFacts.timeMinutes} min`} hint={cert.examFacts.level} />
        <Fact
          label="Pass score"
          value={String(cert.examFacts.passScore)}
          hint={`of ${cert.examFacts.passScoreMax}`}
        />
        <Fact
          label="List price"
          value={cert.examFacts.priceLabel}
          hint={
            cert.examFacts.validityYears ? `valid ${cert.examFacts.validityYears} years` : undefined
          }
        />
      </dl>

      {/* ------------------------------------------------------- exam date */}
      <div className="rise mt-4" style={{ "--i": 2 } as React.CSSProperties}>
        <ExamDatePanel cert={cert} remaining={stats.total - stats.done} />
      </div>

      {/* ------------------------------------------------------ revise panel */}
      {cert.reviseFromPanels.length ? (
        <section
          className="rise mt-10 rounded-xl border border-line bg-raised p-6 sm:p-8"
          style={{ "--i": 3 } as React.CSSProperties}
        >
          <p className="meta text-accent">Revision, not new learning</p>
          <div className="mt-5 space-y-7">
            {cert.reviseFromPanels.map((panel, i) => (
              <div key={i}>
                <h2 className="serif text-[1.05rem] font-medium">{panel.title}</h2>
                <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                  {panel.topics.map((topic, j) => (
                    <li
                      key={j}
                      className="rounded-md border border-line bg-surface px-2.5 py-1 text-[12.5px] leading-snug text-muted"
                    >
                      <MarkdownText text={topic} />
                    </li>
                  ))}
                </ul>
                {panel.note ? (
                  <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-muted">
                    <MarkdownText text={panel.note} />
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- toolbar */}
      <div className="sticky top-14 z-30 -mx-5 mt-12 border-y border-line bg-canvas/90 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="relative min-w-0 basis-full sm:basis-auto sm:flex-1">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter items in this certification"
              aria-label={`Filter ${cert.code} items`}
              className="w-full rounded-md border border-line bg-surface py-2 pl-3 pr-16 text-[14px] placeholder:text-faint focus:border-line-strong"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 sm:block">
              /
            </kbd>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-muted">
            <input
              type="checkbox"
              className="check"
              style={{ marginTop: 0 }}
              checked={sortByWeight}
              onChange={(e) => setSortByWeight(e.target.checked)}
            />
            Sort by weight
          </label>

          <button
            type="button"
            onClick={toggleAll}
            className="rounded-md border border-line px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
        </div>

        {searching ? (
          <p className="mt-2 text-[12.5px] text-muted">
            {matchCount} {matchCount === 1 ? "item matches" : "items match"} “{query.trim()}”
          </p>
        ) : null}
      </div>

      {/* ---------------------------------------------------------- domains */}
      <div className="mt-10 space-y-12">
        {view.map(({ domain, sections }) => (
          <DomainBlock
            key={domain.id}
            domain={domain}
            sections={sections}
            checked={checked}
            collapsed={!searching && Boolean(collapsed[domain.id])}
            onToggleCollapse={() =>
              setCollapsed((c) => ({ ...c, [domain.id]: !c[domain.id] }))
            }
            query={searching ? query.trim() : ""}
          />
        ))}
        {searching && matchCount === 0 ? (
          <p className="py-12 text-center text-[14px] text-muted">
            Nothing in {cert.code} matches “{query.trim()}”.
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------------- post-exam checklist */}
      <section
        className="mt-20 rounded-xl border border-line bg-surface p-6 sm:p-8"
        hidden={searching}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="serif text-[1.15rem] font-medium">{roadmap.postExamChecklist.title}</h2>
          <span className="text-[13px] tabular-nums text-muted">
            {postStats.done} / {postStats.total}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] text-faint">
          Tracked separately for {cert.code}; not counted in study progress.
        </p>
        <ul className="mt-5 space-y-1">
          {postExamItems.map((item) => {
            const key = postExamKey(cert.id, item.id);
            return (
              <CheckRow
                key={key}
                id={key}
                text={item.text}
                checked={Boolean(checked[key])}
                query=""
              />
            );
          })}
        </ul>
      </section>

      <p className="mt-10 text-[12.5px] text-faint" hidden={searching}>
        Keyboard: <kbd>/</kbd> filter · <kbd>j</kbd> <kbd>k</kbd> move between items ·{" "}
        <kbd>space</kbd> tick · <kbd>tab</kbd> everything else.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------- subviews */

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-surface px-5 py-5">
      <dt className="meta">{label}</dt>
      <dd className="serif mt-1.5 text-[1.4rem] tabular-nums leading-none">{value}</dd>
      {hint ? <p className="mt-1.5 text-[12px] text-faint">{hint}</p> : null}
    </div>
  );
}

function DomainBlock({
  domain,
  sections,
  checked,
  collapsed,
  onToggleCollapse,
  query,
}: {
  domain: Domain;
  sections: { section: Section; items: Item[] }[];
  checked: Record<string, true>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  query: string;
}) {
  const ids = domain.sections.flatMap((s) => sectionItemIds(s));
  const stats = tally(ids, checked);
  const panelId = `domain-${domain.id}`;

  return (
    <section aria-labelledby={`${panelId}-heading`}>
      <div className="border-b border-line pb-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          aria-controls={panelId}
          className="group flex w-full items-baseline gap-3 text-left"
        >
          <span className="meta shrink-0">
            D{domain.number} · {domain.weightPercent}%
          </span>
          <h2
            id={`${panelId}-heading`}
            className="serif min-w-0 flex-1 text-[1.3rem] font-medium sm:text-[1.5rem]"
          >
            {domain.title}
          </h2>
          <span className="shrink-0 text-[13px] tabular-nums text-muted">
            {stats.done}/{stats.total}
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 font-mono text-[15px] leading-none text-faint transition-colors group-hover:text-ink"
          >
            {collapsed ? "+" : "−"}
          </span>
        </button>
        <div className="mt-3">
          <ProgressBar percent={stats.percent} label={`Domain ${domain.number} progress`} />
        </div>
        {domain.note ? (
          <p className="mt-3 text-[13px] italic text-muted">{domain.note}</p>
        ) : null}
      </div>

      {collapsed ? null : (
        <div id={panelId} className="mt-8 space-y-10">
          {sections.map(({ section, items }) => (
            <SectionBlock
              key={section.id}
              section={section}
              items={items}
              checked={checked}
              query={query}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionBlock({
  section,
  items,
  checked,
  query,
}: {
  section: Section;
  items: Item[];
  checked: Record<string, true>;
  query: string;
}) {
  const ids = sectionItemIds(section);
  const stats = tally(ids, checked);
  const complete = stats.total > 0 && stats.done === stats.total;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {section.number ? <span className="meta shrink-0">{section.number}</span> : null}
        <h3 className="min-w-0 flex-1 text-[15px] font-medium">
          {section.implicit ? "All items" : section.title}
        </h3>
        <span
          className={`text-[12.5px] tabular-nums ${complete ? "text-faint" : "text-muted"}`}
          aria-label={`${stats.done} of ${stats.total} checked`}
        >
          {stats.done}/{stats.total}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setMany(ids, true)}
            className="rounded px-1.5 py-0.5 text-[12px] text-faint transition-colors hover:bg-raised hover:text-ink"
            title={`Check every item in ${section.title}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setMany(ids, false)}
            className="rounded px-1.5 py-0.5 text-[12px] text-faint transition-colors hover:bg-raised hover:text-ink"
            title={`Uncheck every item in ${section.title}`}
          >
            None
          </button>
        </span>
      </div>

      <ul className="mt-3 space-y-0.5">
        {items.map((item) => (
          <CheckRow
            key={item.id}
            id={item.id}
            text={item.text}
            checked={Boolean(checked[item.id])}
            query={query}
          />
        ))}
      </ul>
    </div>
  );
}

export function CheckRow({
  id,
  text,
  checked,
  query,
}: {
  id: string;
  text: string;
  checked: boolean;
  query: string;
}) {
  return (
    <li>
      <label
        className={`-mx-2 flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-raised ${
          checked ? "text-faint" : ""
        }`}
      >
        <input
          type="checkbox"
          className="check"
          data-item=""
          checked={checked}
          onChange={() => toggleItem(id)}
        />
        <span className="min-w-0 text-[14.5px] leading-relaxed">
          <MarkdownText text={text} highlight={query} />
        </span>
      </label>
    </li>
  );
}
