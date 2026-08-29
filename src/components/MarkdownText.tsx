import type { ReactNode } from "react";

/** Renders the small amount of inline markdown the roadmap uses: `code`, **bold**, *italic*. */
export function MarkdownText({ text, highlight }: { text: string; highlight?: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="rounded bg-raised px-1 py-0.5 font-mono text-[0.86em]">
              {highlightText(part.slice(1, -1), highlight)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-ink">
              {highlightText(part.slice(2, -2), highlight)}
            </strong>
          );
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{highlightText(part.slice(1, -1), highlight)}</em>;
        }
        return <span key={i}>{highlightText(part, highlight)}</span>;
      })}
    </>
  );
}

export function highlightText(text: string, query?: string): ReactNode {
  const q = query?.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const out: ReactNode[] = [];
  let cursor = 0;
  let found = lower.indexOf(needle, cursor);
  let key = 0;
  while (found !== -1) {
    if (found > cursor) out.push(text.slice(cursor, found));
    out.push(<mark key={key++}>{text.slice(found, found + needle.length)}</mark>);
    cursor = found + needle.length;
    found = lower.indexOf(needle, cursor);
  }
  if (cursor === 0) return text;
  out.push(text.slice(cursor));
  return out;
}
