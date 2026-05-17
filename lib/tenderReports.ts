"use client";

import { useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TenderReportConclusion = "Suspicious" | "NotSuspicious";
export type TenderReportStatus =
  | "NoReview"
  | "UnderReview"
  | "VerifiedSuspicious"
  | "Clean";

export type TenderReport = {
  id: string;
  tenderId: string;
  journalistWallet: string;
  reportText: string; // min 100 chars
  evidenceLinks: string[];
  conclusion: TenderReportConclusion;
  txSignature: string;
  createdAt: string;
  likes: string[]; // wallet addresses that liked this report
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "tenderwatch.tenderreports.v1";
const SEED_KEY = "tenderwatch.tenderreports.seeded.v1";

function readStorage(): TenderReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TenderReport[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(reports: TenderReport[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// ---------------------------------------------------------------------------
// External store subscription (for useSyncExternalStore)
// ---------------------------------------------------------------------------

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(): void {
  listeners.forEach((l) => l());
}

let cachedSnapshot: TenderReport[] | null = null;

function getSnapshot(): TenderReport[] {
  const fresh = readStorage();
  // Referential stability: only replace when content changes
  if (
    cachedSnapshot !== null &&
    JSON.stringify(cachedSnapshot) === JSON.stringify(fresh)
  ) {
    return cachedSnapshot;
  }
  cachedSnapshot = fresh;
  return cachedSnapshot;
}

function getServerSnapshot(): TenderReport[] {
  return [];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useAllTenderReports(): TenderReport[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useTenderReports(tenderId: string): TenderReport[] {
  const all = useAllTenderReports();
  return all.filter((r) => r.tenderId === tenderId);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function addTenderReport(report: TenderReport): void {
  const current = readStorage();
  // Prevent duplicate ids
  if (current.some((r) => r.id === report.id)) return;
  writeStorage([...current, report]);
  cachedSnapshot = null;
  notifyListeners();
}

export function likeTenderReport(
  reportId: string,
  walletAddress: string
): void {
  const current = readStorage();
  const updated = current.map((r) => {
    if (r.id !== reportId) return r;
    const alreadyLiked = r.likes.includes(walletAddress);
    return {
      ...r,
      likes: alreadyLiked
        ? r.likes.filter((w) => w !== walletAddress)
        : [...r.likes, walletAddress],
    };
  });
  writeStorage(updated);
  cachedSnapshot = null;
  notifyListeners();
}

// ---------------------------------------------------------------------------
// Non-reactive reads
// ---------------------------------------------------------------------------

export function hasLiked(reportId: string, walletAddress: string): boolean {
  const reports = readStorage();
  const report = reports.find((r) => r.id === reportId);
  return report ? report.likes.includes(walletAddress) : false;
}

// ---------------------------------------------------------------------------
// Status computation
// ---------------------------------------------------------------------------

export function getTenderReportStatus(
  reports: TenderReport[]
): TenderReportStatus {
  if (reports.length === 0) return "NoReview";
  if (reports.length <= 2) return "UnderReview";

  const total = reports.length;
  const suspiciousReports = reports.filter(
    (r) => r.conclusion === "Suspicious"
  );
  const notSuspiciousReports = reports.filter(
    (r) => r.conclusion === "NotSuspicious"
  );

  const suspiciousCount = suspiciousReports.length;
  const notSuspiciousCount = notSuspiciousReports.length;

  if (suspiciousCount / total > 0.5) return "VerifiedSuspicious";
  if (notSuspiciousCount / total > 0.5) return "Clean";

  // Exact tie — most-liked report's conclusion wins
  const mostLiked = reports.reduce((prev, curr) =>
    curr.likes.length > prev.likes.length ? curr : prev
  );
  return mostLiked.conclusion === "Suspicious"
    ? "VerifiedSuspicious"
    : "Clean";
}

// ---------------------------------------------------------------------------
// Journalist stats
// ---------------------------------------------------------------------------

export function getJournalistStats(walletAddress: string): {
  reportCount: number;
  totalLikes: number;
  accurateCount: number;
  credibilityScore: number;
} {
  const all = readStorage();
  const myReports = all.filter((r) => r.journalistWallet === walletAddress);

  const reportCount = myReports.length;
  const totalLikes = myReports.reduce((sum, r) => sum + r.likes.length, 0);

  // For each report, gather all reports for that tender and compute status
  let accurateCount = 0;
  for (const report of myReports) {
    const tenderReports = all.filter((r) => r.tenderId === report.tenderId);
    const status = getTenderReportStatus(tenderReports);

    const conclusionMatchesStatus =
      (report.conclusion === "Suspicious" &&
        status === "VerifiedSuspicious") ||
      (report.conclusion === "NotSuspicious" && status === "Clean");

    if (conclusionMatchesStatus) accurateCount++;
  }

  const credibilityScore =
    reportCount + Math.floor(totalLikes / 5) + accurateCount * 2;

  return { reportCount, totalLikes, accurateCount, credibilityScore };
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export function seedTenderReports(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return;

  const JRN1 = "JRN1Demo111111111111111111111111111111111111";
  const JRN2 = "JRN2Demo111111111111111111111111111111111111";
  const JRN3 = "JRN3Demo111111111111111111111111111111111111";

  const day = (n: number) =>
    new Date(Date.now() - n * 86_400_000).toISOString();

  const likers = (ids: string[]) =>
    ids.map((i) => `LKR${i}Demo11111111111111111111111111111111111111`);

  const reports: TenderReport[] = [
    // -----------------------------------------------------------------------
    // T-2026-0142 — 2 Suspicious (JRN1 ×5 likes, JRN2 ×2 likes), 1 NotSuspicious (JRN3 ×1 like)
    // → VerifiedSuspicious (2/3 > 50%)
    // -----------------------------------------------------------------------
    {
      id: "rep-0142-jrn1",
      tenderId: "T-2026-0142",
      journalistWallet: JRN1,
      reportText:
        "The road reconstruction contract T-2026-0142 was awarded to Granit AD without a public question-and-answer round, bypassing standard procurement transparency requirements. The awarded price of €2.4 million is 2.3× the per-kilometer average for equivalent EU-funded road projects in the region. Cross-referencing company registration records shows the winning firm shares a registered address with a company owned by a relative of a senior ministry official.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0142",
        "https://crm.gov.mk/registar/granit-ad",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN1rep0T0142aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      createdAt: day(7),
      likes: likers(["1", "2", "3", "4", "5"]),
    },
    {
      id: "rep-0142-jrn2",
      tenderId: "T-2026-0142",
      journalistWallet: JRN2,
      reportText:
        "Independent analysis of the bid documentation for T-2026-0142 reveals that the technical specifications were tailored to exclude two of the three competing firms during the pre-qualification stage. The timeline between tender publication and deadline was 34 days — below the 45-day minimum recommended for projects of this size by EU procurement guidelines. This pattern matches three previous contracts awarded to the same contractor in 2024.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0142-bid",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN2rep0T0142bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      createdAt: day(6),
      likes: likers(["6", "7"]),
    },
    {
      id: "rep-0142-jrn3",
      tenderId: "T-2026-0142",
      journalistWallet: JRN3,
      reportText:
        "After reviewing the publicly available audit trail for T-2026-0142, the pricing appears within an acceptable range when accounting for the three bridge sections included in the scope, which are typically underrepresented in per-kilometer comparisons. The procurement timeline, while short, was formally approved by the contracting authority. No direct evidence of wrongdoing was found in the available documentation.",
      evidenceLinks: [],
      conclusion: "NotSuspicious",
      txSignature: "5JRN3rep0T0142cccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      createdAt: day(5),
      likes: likers(["8"]),
    },

    // -----------------------------------------------------------------------
    // T-2026-0138 — 3 Suspicious (JRN1, JRN2, JRN3), each ×3 likes
    // → VerifiedSuspicious (3/3 = 100%)
    // -----------------------------------------------------------------------
    {
      id: "rep-0138-jrn1",
      tenderId: "T-2026-0138",
      journalistWallet: JRN1,
      reportText:
        "The laptop specifications in tender T-2026-0138 list a screen resolution, battery model number, and chassis dimensions that correspond exclusively to a single OEM product line discontinued in late 2025, making competitive bidding structurally impossible. The contract value of €3.1 million significantly exceeds current market rates for equivalent hardware by approximately 38%. A source within the Ministry of Education confirmed that the specifications were drafted with external consultant input not disclosed in the public record.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138",
        "https://eurotech-solutions.mk/about",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN1rep0T0138dddddddddddddddddddddddddddddddddddddddddddddddddddddd",
      createdAt: day(10),
      likes: likers(["9", "10", "11"]),
    },
    {
      id: "rep-0138-jrn2",
      tenderId: "T-2026-0138",
      journalistWallet: JRN2,
      reportText:
        "EuroTech Solutions DOOEL, the awarded contractor for T-2026-0138, was registered only 14 months before winning this contract and has no prior public procurement history. The company's sole director previously worked as an IT procurement adviser to the same ministry between 2023 and 2024, creating a clear conflict of interest that was not declared. Comparable laptop procurement by neighboring municipalities in the same period came in at 31% lower per-unit cost.",
      evidenceLinks: [
        "https://crm.gov.mk/registar/eurotech-solutions-dooel",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN2rep0T0138eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      createdAt: day(9),
      likes: likers(["12", "13", "14"]),
    },
    {
      id: "rep-0138-jrn3",
      tenderId: "T-2026-0138",
      journalistWallet: JRN3,
      reportText:
        "Cross-referencing the delivery receipts published under T-2026-0138 with school inventory records obtained via freedom-of-information request shows that 340 of the 4,200 laptops listed as delivered were never registered in any school's asset register. The discrepancy amounts to approximately €251,000 in unaccounted hardware. Ministry officials declined to comment when contacted for clarification.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138-delivery",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN3rep0T0138ffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      createdAt: day(8),
      likes: likers(["15", "16", "17"]),
    },

    // -----------------------------------------------------------------------
    // T-2026-0131 — 1 Suspicious (JRN1), 1 NotSuspicious (JRN2)
    // → UnderReview (only 2 reports)
    // -----------------------------------------------------------------------
    {
      id: "rep-0131-jrn1",
      tenderId: "T-2026-0131",
      journalistWallet: JRN1,
      reportText:
        "The 24-month cleaning services contract T-2026-0131 was awarded at a monthly rate roughly double the going market rate for comparable government building maintenance services in Skopje according to three independent facility management firms contacted for comparison. The winning bidder, CleanPro DOOEL, submitted the only qualifying bid after two competitors were disqualified on minor procedural grounds within 48 hours of submission. This level of disqualification speed is unusual and warrants further scrutiny.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0131",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN1rep0T0131gggggggggggggggggggggggggggggggggggggggggggggggggggggg",
      createdAt: day(4),
      likes: likers(["18", "19"]),
    },
    {
      id: "rep-0131-jrn2",
      tenderId: "T-2026-0131",
      journalistWallet: JRN2,
      reportText:
        "A review of the disqualification decisions for T-2026-0131 shows both competitors failed to include mandatory insurance certificates that were clearly specified in the tender documentation. The monthly rate, while appearing high on a surface comparison, includes night-shift staffing and hazardous-material handling for laboratory spaces — costs often omitted from standard market benchmarks. Based on the available documentation the award appears procedurally sound.",
      evidenceLinks: [],
      conclusion: "NotSuspicious",
      txSignature: "5JRN2rep0T0131hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
      createdAt: day(3),
      likes: likers(["20"]),
    },

    // -----------------------------------------------------------------------
    // T-2026-0057 — 1 Suspicious (JRN1)
    // → UnderReview (only 1 report)
    // -----------------------------------------------------------------------
    {
      id: "rep-0057-jrn1",
      tenderId: "T-2026-0057",
      journalistWallet: JRN1,
      reportText:
        "Tender T-2026-0057 for catering services at the National Assembly was awarded without the legally required minimum of three competing bids, with the contracting authority citing an emergency waiver that does not appear to meet the statutory criteria for emergency procurement. The awarded price per meal exceeds the average across four comparable public institution catering contracts by 67%. An anonymous tip from within the procurement office suggests the waiver was pre-arranged before the formal process began.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0057",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN1rep0T0057iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii",
      createdAt: day(2),
      likes: likers(["21", "22", "23"]),
    },

    // -----------------------------------------------------------------------
    // T-2026-0077 — 1 Suspicious (JRN1), 2 NotSuspicious (JRN2, JRN3)
    // → Clean (2/3 > 50%)
    // -----------------------------------------------------------------------
    {
      id: "rep-0077-jrn1",
      tenderId: "T-2026-0077",
      journalistWallet: JRN1,
      reportText:
        "The stadium construction tender T-2026-0077 raises concerns because the winning contractor's parent company has been flagged in two previous EU anti-fraud office reports for inflated invoicing on infrastructure projects in neighbouring countries. The awarded sum of €8.7 million falls just below the threshold that triggers mandatory external audit, which may be intentional. Further investigation is needed before drawing firm conclusions.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077",
      ],
      conclusion: "Suspicious",
      txSignature: "5JRN1rep0T0077jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj",
      createdAt: day(14),
      likes: likers(["24"]),
    },
    {
      id: "rep-0077-jrn2",
      tenderId: "T-2026-0077",
      journalistWallet: JRN2,
      reportText:
        "A thorough review of T-2026-0077 documentation including all bid submissions, evaluation committee minutes, and final award decision finds no procedural irregularities. Three bids were received, all were assessed by an independent technical panel, and the winning bid was the second-lowest in price but scored highest on technical merit — a legitimate outcome under the best-value criteria used. The EU anti-fraud office references cited by another journalist relate to a separate subsidiary under different management.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077-eval",
      ],
      conclusion: "NotSuspicious",
      txSignature: "5JRN2rep0T0077kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
      createdAt: day(13),
      likes: likers(["25", "26", "27"]),
    },
    {
      id: "rep-0077-jrn3",
      tenderId: "T-2026-0077",
      journalistWallet: JRN3,
      reportText:
        "Independent financial benchmarking of T-2026-0077 against six stadium renovation projects completed in Southeast Europe between 2022 and 2025 shows the awarded unit costs are within the normal range after adjusting for local labour costs and material import duties. The contract value falling near the audit threshold is coincidental — this threshold has remained unchanged since 2019 and applies to dozens of similarly sized contracts annually. The procurement appears clean based on available evidence.",
      evidenceLinks: [],
      conclusion: "NotSuspicious",
      txSignature: "5JRN3rep0T0077llllllllllllllllllllllllllllllllllllllllllllllllllllll",
      createdAt: day(12),
      likes: likers(["28", "29"]),
    },
  ];

  const existing = readStorage();
  const existingIds = new Set(existing.map((r) => r.id));
  const toAdd = reports.filter((r) => !existingIds.has(r.id));
  if (toAdd.length > 0) {
    writeStorage([...existing, ...toAdd]);
    cachedSnapshot = null;
    notifyListeners();
  }

  localStorage.setItem(SEED_KEY, "1");
}
