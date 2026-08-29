import { roadmap } from "@/lib/roadmap";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <p className="meta">Source</p>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted">
          Every item on this site is parsed from{" "}
          <code className="rounded bg-raised px-1 py-0.5 font-mono text-[12px]">
            {roadmap.generatedFrom}
          </code>
          . Edit that file and re-run{" "}
          <code className="rounded bg-raised px-1 py-0.5 font-mono text-[12px]">npm run parse</code>{" "}
          — ticks you have already made are preserved.
        </p>
        {roadmap.meta.verifiedNote ? (
          <p className="mt-4 max-w-2xl text-[13px] italic leading-relaxed text-faint">
            {roadmap.meta.verifiedNote}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
