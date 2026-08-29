export interface Item {
  id: string;
  text: string;
  hash: string;
}

export interface Section {
  id: string;
  number: string | null;
  title: string;
  implicit: boolean;
  items: Item[];
}

export interface Domain {
  id: string;
  number: number;
  title: string;
  weightPercent: number;
  note: string | null;
  sections: Section[];
}

export interface RevisePanel {
  title: string;
  topics: string[];
  note: string | null;
}

export interface ExamFacts {
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

export interface Certification {
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

export interface Roadmap {
  generatedFrom: string;
  title: string;
  meta: {
    intro: string[];
    scoringNote: string | null;
    verifiedNote: string | null;
    voucherExpiry: string;
  };
  certifications: Certification[];
  postExamChecklist: { title: string; items: Item[] };
  resources: string[];
  totals: { items: number; certifications: number };
}
