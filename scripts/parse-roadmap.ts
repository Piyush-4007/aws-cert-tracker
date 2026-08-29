/**
 * Parses `aws-cert-roadmap.md` into `src/data/roadmap.json`.
 *
 * The markdown is the single source of truth. This script never invents,
 * reorders or drops content — it only gives every checkbox a stable,
 * path-derived identity so saved progress survives edits to the file.
 *
 * Run with: npm run parse
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "aws-cert-roadmap.md");
const OUTPUT = join(ROOT, "src", "data", "roadmap.json");

/* ------------------------------------------------------------------ types */

interface Item {
  id: string;
  text: string;
  /** Short content hash — lets progress follow an item that moved position. */
  hash: string;
}

interface Section {
  id: string;
  /** "1.2" style number from the heading, or null for an unnumbered section. */
  number: string | null;
  title: string;
  /** True when the domain had no `###` heading and items sit directly under it. */
  implicit: boolean;
  items: Item[];
}

interface Domain {
  id: string;
  number: number;
  title: string;
  weightPercent: number;
  note: string | null;
  sections: Section[];
}

interface RevisePanel {
  title: string;
  topics: string[];
  note: string | null;
}

interface ExamFacts {
  level: string;
  questions: number;
  scoredQuestions: number | null;
  timeMinutes: number;
  passScore: number;
  passScoreMax: number;
  price: number;
  priceLabel: string;
  retakeWaitDays: number | null;
  validityYears: number | null;
}

interface Certification {
  id: string;
  code: string;
  name: string;
  order: number;
  intro: string[];
  domainSummary: string | null;
  examFacts: ExamFacts;
  reviseFrom: string[] | null;
  reviseFromPanels: RevisePanel[];
  domains: Domain[];
  itemCount: number;
}

interface Roadmap {
  generatedFrom: string;
  title: string;
  meta: {
    intro: string[];
    scoringNote: string | null;
    verifiedNote: string | null;
  };
  certifications: Certification[];
  postExamChecklist: { title: string; items: Item[] };
  resources: string[];
  totals: { items: number; certifications: number };
}

/* -------------------------------------------------------------- utilities */

const hashOf = (text: string): string =>
  createHash("sha1").update(text.trim().toLowerCase()).digest("hex").slice(0, 10);

const slugNumber = (n: string): string => n.replace(/\./g, "-");

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** Strips a markdown table row into trimmed cells. */
const tableCells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

const firstInt = (s: string): number | null => {
  const m = s.match(/-?\d+/);
  return m ? Number(m[0]) : null;
};

const requireInt = (s: string, what: string): number => {
  const v = firstInt(s);
  if (v === null) throw new Error(`Could not read a number for ${what} from "${s}"`);
  return v;
};

/* ------------------------------------------------------- exam facts table */

function parseExamFacts(lines: string[]): Map<string, ExamFacts> {
  const start = lines.findIndex((l) => /^##\s+Exam facts\s*$/.test(l));
  if (start === -1) throw new Error("No `## Exam facts` heading found");

  const rows: string[][] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("|")) {
      rows.push(tableCells(line));
      continue;
    }
    if (rows.length) break; // table finished
  }
  if (rows.length < 3) throw new Error("Exam facts table looks malformed");

  const [header, , ...body] = rows; // row 1 is the `---` separator
  const codes = header.slice(1);
  const byLabel = new Map<string, string[]>();
  for (const row of body) byLabel.set(row[0].toLowerCase(), row.slice(1));

  const cell = (label: string, i: number): string => {
    const row = byLabel.get(label);
    if (!row) throw new Error(`Exam facts table has no "${label}" row`);
    return row[i] ?? "";
  };

  const facts = new Map<string, ExamFacts>();
  codes.forEach((code, i) => {
    const questionsRaw = cell("questions", i);
    const scored = questionsRaw.match(/\((\d+)\s*scored\)/);
    const passRaw = cell("pass score", i);
    const passParts = passRaw.split("/").map((p) => firstInt(p));
    const priceRaw = cell("list price", i);

    facts.set(code, {
      level: cell("level", i),
      questions: requireInt(questionsRaw, `${code} questions`),
      scoredQuestions: scored ? Number(scored[1]) : null,
      timeMinutes: requireInt(cell("time", i), `${code} time`),
      passScore: passParts[0] ?? 0,
      passScoreMax: passParts[1] ?? 1000,
      price: requireInt(priceRaw, `${code} price`),
      priceLabel: priceRaw,
      retakeWaitDays: firstInt(cell("retake wait", i)),
      validityYears: firstInt(cell("validity", i)),
    });
  });
  return facts;
}

/* ------------------------------------------- "revise from" blockquote body */

function parseRevisePanel(raw: string): RevisePanel {
  const headed = raw.match(/^\*\*(.+?):\*\*\s*(.*)$/s);
  if (!headed) return { title: "Revise first", topics: [raw], note: null };

  const title = headed[1].trim();
  const body = headed[2].trim();
  const topics = body
    .split(/\s+·\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let note: string | null = null;
  if (topics.length) {
    const last = topics[topics.length - 1];
    // A trailing sentence of prose after the final topic, e.g.
    // "... Cost Explorer, Budgets. You'll now need the limits and trade-offs."
    const split = last.match(/^(.*?[a-z)])\.\s+([A-Z].{20,})$/s);
    if (split) {
      topics[topics.length - 1] = split[1].trim();
      note = split[2].trim();
    }
  }
  return { title, topics, note };
}

/* ------------------------------------------------------------ main parser */

function parse(markdown: string): Roadmap {
  const lines = markdown.split(/\r?\n/);
  const examFacts = parseExamFacts(lines);

  const certifications: Certification[] = [];
  const docIntro: string[] = [];
  const resources: string[] = [];
  const postExam: Item[] = [];
  let postExamTitle = "Post-exam checklist";
  let scoringNote: string | null = null;
  let verifiedNote: string | null = null;
  let docTitle = "AWS Certification Roadmap";

  type Zone = "head" | "examfacts" | "cert" | "postexam" | "resources";
  let zone: Zone = "head";

  let cert: Certification | null = null;
  let domain: Domain | null = null;
  let section: Section | null = null;
  /** Blockquote lines are accumulated so a wrapped quote stays one panel. */
  let quote: string[] = [];

  const flushQuote = () => {
    if (!quote.length) return;
    const raw = quote.join(" ").trim();
    if (cert) {
      (cert.reviseFrom ??= []).push(raw);
      cert.reviseFromPanels.push(parseRevisePanel(raw));
    }
    quote = [];
  };

  /** Domains such as AIF D4/D5 list items with no `###` heading of their own. */
  const ensureSection = (): Section => {
    if (section) return section;
    if (!domain || !cert) throw new Error("Checklist item found outside a domain");
    section = {
      id: `${cert.id}.${domain.id}.main`,
      number: null,
      title: domain.title,
      implicit: true,
      items: [],
    };
    domain.sections.push(section);
    return section;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith(">")) {
      quote.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }
    if (quote.length && !trimmed.startsWith(">")) flushQuote();

    if (!trimmed || trimmed === "---") continue;

    /* -------- headings -------- */
    const h1 = trimmed.match(/^#\s+(.+)$/);
    const certHead = trimmed.match(/^#\s+(\d+)\.\s+([A-Z]{3}-[A-Z]?\d+)\s+—\s+(.+)$/);
    if (certHead) {
      const [, order, code, name] = certHead;
      const facts = examFacts.get(code);
      if (!facts) throw new Error(`No exam-facts column for ${code}`);
      cert = {
        id: code.toLowerCase(),
        code,
        name: name.trim(),
        order: Number(order),
        intro: [],
        domainSummary: null,
        examFacts: facts,
        reviseFrom: null,
        reviseFromPanels: [],
        domains: [],
        itemCount: 0,
      };
      certifications.push(cert);
      domain = null;
      section = null;
      zone = "cert";
      continue;
    }
    if (h1 && zone === "head") {
      docTitle = h1[1].trim();
      continue;
    }

    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      const heading = h2[1].trim();
      const domainHead = heading.match(/^D(\d+)\.\s+(.+?)\s+\((\d+)%\)$/);
      if (domainHead && cert) {
        domain = {
          id: `d${domainHead[1]}`,
          number: Number(domainHead[1]),
          title: domainHead[2].trim(),
          weightPercent: Number(domainHead[3]),
          note: null,
          sections: [],
        };
        cert.domains.push(domain);
        section = null;
        continue;
      }
      if (/^Exam facts$/i.test(heading)) {
        zone = "examfacts";
        continue;
      }
      if (/^Post-exam checklist/i.test(heading)) {
        postExamTitle = heading;
        zone = "postexam";
        cert = null;
        domain = null;
        section = null;
        continue;
      }
      if (/^Resources$/i.test(heading)) {
        zone = "resources";
        continue;
      }
      throw new Error(`Unrecognised "## ${heading}" heading — parser needs updating`);
    }

    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3 && cert && domain) {
      const numbered = h3[1].match(/^(\d+(?:\.\d+)*)\s+(.+)$/);
      const number = numbered ? numbered[1] : null;
      const title = numbered ? numbered[2].trim() : h3[1].trim();
      section = {
        id: `${cert.id}.${domain.id}.${number ? slugNumber(number) : slugNumber(title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`,
        number,
        title,
        implicit: false,
        items: [],
      };
      domain.sections.push(section);
      continue;
    }

    /* -------- checklist items -------- */
    const check = trimmed.match(/^-\s+\[([ xX])\]\s+(.+)$/);
    if (check) {
      const text = check[2].trim();
      if (zone === "postexam") {
        postExam.push({
          id: `post-exam.item-${pad2(postExam.length + 1)}`,
          text,
          hash: hashOf(text),
        });
        continue;
      }
      const target = ensureSection();
      target.items.push({
        id: `${target.id}.item-${pad2(target.items.length + 1)}`,
        text,
        hash: hashOf(text),
      });
      if (cert) cert.itemCount++;
      continue;
    }

    /* -------- plain bullets -------- */
    if (trimmed.startsWith("- ")) {
      if (zone === "resources") resources.push(trimmed.slice(2).trim());
      continue;
    }

    /* -------- prose -------- */
    if (zone === "head") {
      docIntro.push(trimmed);
      continue;
    }
    if (zone === "examfacts") {
      if (trimmed.startsWith("|")) continue;
      if (/^\*.*\*$/.test(trimmed)) verifiedNote = trimmed.replace(/^\*|\*$/g, "").trim();
      else scoringNote ??= trimmed;
      continue;
    }
    if (zone === "resources") {
      if (/^\*.*\*$/.test(trimmed)) verifiedNote = trimmed.replace(/^\*|\*$/g, "").trim();
      continue;
    }
    if (cert) {
      if (domain && !section && /^\*[^*].*\*$/.test(trimmed)) {
        domain.note = trimmed.replace(/^\*|\*$/g, "").trim();
        continue;
      }
      if (!domain) {
        if (/^Domains:/.test(trimmed)) cert.domainSummary = trimmed.replace(/^Domains:\s*/, "");
        else cert.intro.push(trimmed);
      }
    }
  }
  flushQuote();

  certifications.sort((a, b) => a.order - b.order);

  return {
    generatedFrom: "aws-cert-roadmap.md",
    title: docTitle,
    meta: {
      intro: docIntro,
      scoringNote,
      verifiedNote,
    },
    certifications,
    postExamChecklist: { title: postExamTitle, items: postExam },
    resources,
    totals: {
      items: certifications.reduce((n, c) => n + c.itemCount, 0),
      certifications: certifications.length,
    },
  };
}

/* ------------------------------------------------------------- validation */

function validate(roadmap: Roadmap, markdown: string): void {
  const problems: string[] = [];

  const sourceItemCount = markdown
    .split(/\r?\n/)
    .filter((l) => /^-\s+\[[ xX]\]\s+/.test(l.trim())).length;
  const parsedItemCount = roadmap.totals.items + roadmap.postExamChecklist.items.length;
  if (sourceItemCount !== parsedItemCount) {
    problems.push(`Item count mismatch: markdown has ${sourceItemCount}, JSON has ${parsedItemCount}`);
  }

  const ids = new Set<string>();
  const walkIds = (id: string) => {
    if (ids.has(id)) problems.push(`Duplicate id: ${id}`);
    ids.add(id);
  };

  for (const cert of roadmap.certifications) {
    if (!cert.domains.length) problems.push(`${cert.code} has no domains`);
    const weight = cert.domains.reduce((n, d) => n + d.weightPercent, 0);
    if (weight !== 100) problems.push(`${cert.code} domain weights sum to ${weight}%, not 100%`);
    for (const domain of cert.domains) {
      if (!domain.sections.length) problems.push(`${cert.code} ${domain.id} has no sections`);
      for (const s of domain.sections) {
        walkIds(s.id);
        if (!s.items.length) problems.push(`${s.id} has no items`);
        for (const item of s.items) walkIds(item.id);
      }
    }
  }
  for (const item of roadmap.postExamChecklist.items) walkIds(item.id);

  if (problems.length) {
    for (const p of problems) console.error(`  ! ${p}`);
    throw new Error(`Parser validation failed with ${problems.length} problem(s)`);
  }
}

/* ------------------------------------------------------------------- main */

const markdown = readFileSync(SOURCE, "utf8");
const roadmap = parse(markdown);
validate(roadmap, markdown);

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(roadmap, null, 2) + "\n", "utf8");

console.log(`Parsed ${roadmap.generatedFrom} -> src/data/roadmap.json`);
for (const cert of roadmap.certifications) {
  const sections = cert.domains.reduce((n, d) => n + d.sections.length, 0);
  console.log(
    `  ${cert.code.padEnd(8)} ${String(cert.domains.length).padStart(2)} domains  ` +
      `${String(sections).padStart(3)} sections  ${String(cert.itemCount).padStart(3)} items`,
  );
}
console.log(
  `  ${"post-exam".padEnd(8)} ${" ".repeat(21)}${String(roadmap.postExamChecklist.items.length).padStart(3)} items`,
);
console.log(`  total study items: ${roadmap.totals.items}`);
