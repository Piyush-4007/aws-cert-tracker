import data from "@/data/roadmap.json";
import type { Certification, Item, Roadmap, Section } from "./types";

export const roadmap = data as Roadmap;

export const VOUCHER_EXPIRY = roadmap.meta.voucherExpiry; // "2027-01-29"

export const certifications = roadmap.certifications;

export const certById = new Map(certifications.map((c) => [c.id, c]));

/** Every study item id that currently exists in the roadmap. */
export const allItemIds: string[] = certifications.flatMap((cert) =>
  cert.domains.flatMap((d) => d.sections.flatMap((s) => s.items.map((i) => i.id))),
);

/** Post-exam checklist ids are scoped per certification — the list repeats per exam. */
export const postExamKey = (certId: string, itemId: string) => `${certId}::${itemId}`;

export const postExamIds: string[] = certifications.flatMap((cert) =>
  roadmap.postExamChecklist.items.map((i) => postExamKey(cert.id, i.id)),
);

export const validIds = new Set<string>([...allItemIds, ...postExamIds]);

/**
 * `certId:hash` -> current item id. Used to carry checked state across a
 * roadmap edit that moved an item without changing its text.
 */
export const idByScopedHash = new Map<string, string>();
for (const cert of certifications) {
  for (const domain of cert.domains) {
    for (const section of domain.sections) {
      for (const item of section.items) {
        const key = `${cert.id}:${item.hash}`;
        if (!idByScopedHash.has(key)) idByScopedHash.set(key, item.id);
      }
    }
  }
}

export const hashById = new Map<string, string>();
for (const cert of certifications) {
  for (const domain of cert.domains) {
    for (const section of domain.sections) {
      for (const item of section.items) hashById.set(item.id, `${cert.id}:${item.hash}`);
    }
  }
}

export const certIdOfItem = (itemId: string): string => itemId.split(".")[0];

export interface FlatSection {
  cert: Certification;
  domainId: string;
  domainNumber: number;
  domainTitle: string;
  domainWeight: number;
  section: Section;
}

export const flatSections: FlatSection[] = certifications.flatMap((cert) =>
  cert.domains.flatMap((domain) =>
    domain.sections.map((section) => ({
      cert,
      domainId: domain.id,
      domainNumber: domain.number,
      domainTitle: domain.title,
      domainWeight: domain.weightPercent,
      section,
    })),
  ),
);

export const sectionItemIds = (section: Section): string[] => section.items.map((i) => i.id);

export const certItemIds = (cert: Certification): string[] =>
  cert.domains.flatMap((d) => d.sections.flatMap((s) => s.items.map((i) => i.id)));

export const postExamItems: Item[] = roadmap.postExamChecklist.items;
