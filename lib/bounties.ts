"use client";

import { useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BountyReportStatus = "Pending" | "Approved" | "Declined";

export type BountyReport = {
  id: string;
  bountyId: string;
  journalistWallet: string;
  reportText: string;
  evidenceLinks: string[];
  attachmentUrls: string[];
  status: BountyReportStatus;
  createdAt: string;
};

export type BountyRequest = {
  id: string;
  requesterWallet: string;
  title: string;
  requestText: string;
  attachmentUrls: string[];
  sourceUrls: string[];
  bountyUSD: number;
  status: "Open" | "Awarded";
  awardedReportId?: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Storage helpers — bounties
// ---------------------------------------------------------------------------

const BOUNTY_KEY = "tenderwatch.bounties.v2";
const REPORT_KEY = "tenderwatch.bountyreports.v1";
const SEED_KEY = "tenderwatch.bounties.seeded.v2";

function readBounties(): BountyRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOUNTY_KEY);
    return raw ? (JSON.parse(raw) as BountyRequest[]) : [];
  } catch {
    return [];
  }
}

function writeBounties(bounties: BountyRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOUNTY_KEY, JSON.stringify(bounties));
}

function readReports(): BountyReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    return raw ? (JSON.parse(raw) as BountyReport[]) : [];
  } catch {
    return [];
  }
}

function writeReports(reports: BountyReport[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
}

// ---------------------------------------------------------------------------
// External store — bounties
// ---------------------------------------------------------------------------

type Listener = () => void;
const bountyListeners = new Set<Listener>();
const reportListeners = new Set<Listener>();

function subscribeBounties(listener: Listener): () => void {
  bountyListeners.add(listener);
  return () => bountyListeners.delete(listener);
}

function notifyBountyListeners(): void {
  bountyListeners.forEach((l) => l());
}

function subscribeReports(listener: Listener): () => void {
  reportListeners.add(listener);
  return () => reportListeners.delete(listener);
}

function notifyReportListeners(): void {
  reportListeners.forEach((l) => l());
}

let cachedBounties: BountyRequest[] | null = null;
let cachedReports: BountyReport[] | null = null;

function getBountySnapshot(): BountyRequest[] {
  const fresh = readBounties();
  if (
    cachedBounties !== null &&
    JSON.stringify(cachedBounties) === JSON.stringify(fresh)
  ) {
    return cachedBounties;
  }
  cachedBounties = fresh;
  return cachedBounties;
}

function getBountyServerSnapshot(): BountyRequest[] {
  return [];
}

function getReportSnapshot(): BountyReport[] {
  const fresh = readReports();
  if (
    cachedReports !== null &&
    JSON.stringify(cachedReports) === JSON.stringify(fresh)
  ) {
    return cachedReports;
  }
  cachedReports = fresh;
  return cachedReports;
}

function getReportServerSnapshot(): BountyReport[] {
  return [];
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBounties(): BountyRequest[] {
  return useSyncExternalStore(
    subscribeBounties,
    getBountySnapshot,
    getBountyServerSnapshot
  );
}

export function useAllBountyReports(): BountyReport[] {
  return useSyncExternalStore(
    subscribeReports,
    getReportSnapshot,
    getReportServerSnapshot
  );
}

export function useBountyReports(bountyId: string): BountyReport[] {
  const all = useAllBountyReports();
  return all.filter((r) => r.bountyId === bountyId);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function addBountyRequest(request: BountyRequest): void {
  const current = readBounties();
  if (current.some((b) => b.id === request.id)) return;
  writeBounties([...current, request]);
  cachedBounties = null;
  notifyBountyListeners();
}

export function submitBountyReport(report: BountyReport): void {
  const current = readReports();
  if (current.some((r) => r.id === report.id)) return;
  writeReports([...current, report]);
  cachedReports = null;
  notifyReportListeners();
}

export function approveReport(bountyId: string, reportId: string): void {
  // Update reports: approve the winner, decline all others for this bounty
  const allReports = readReports();
  const updatedReports = allReports.map((r) => {
    if (r.bountyId !== bountyId) return r;
    if (r.id === reportId) return { ...r, status: "Approved" as BountyReportStatus };
    if (r.status === "Pending") return { ...r, status: "Declined" as BountyReportStatus };
    return r;
  });
  writeReports(updatedReports);
  cachedReports = null;
  notifyReportListeners();

  // Update bounty: mark as Awarded with winning report id
  const allBounties = readBounties();
  const updatedBounties = allBounties.map((b) =>
    b.id === bountyId
      ? { ...b, status: "Awarded" as const, awardedReportId: reportId }
      : b
  );
  writeBounties(updatedBounties);
  cachedBounties = null;
  notifyBountyListeners();
}

export function declineReport(bountyId: string, reportId: string): void {
  const allReports = readReports();
  const updatedReports = allReports.map((r) =>
    r.id === reportId && r.bountyId === bountyId
      ? { ...r, status: "Declined" as BountyReportStatus }
      : r
  );
  writeReports(updatedReports);
  cachedReports = null;
  notifyReportListeners();
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

export function seedBounties(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_KEY)) return;

  const REQ1 = "REQ1Demo111111111111111111111111111111111111";
  const REQ2 = "REQ2Demo111111111111111111111111111111111111";
  const REQ3 = "REQ3Demo111111111111111111111111111111111111";
  const JRN1 = "JRN1Demo111111111111111111111111111111111111";
  const JRN2 = "JRN2Demo111111111111111111111111111111111111";
  const JRN3 = "JRN3Demo111111111111111111111111111111111111";

  const day = (n: number) =>
    new Date(Date.now() - n * 86_400_000).toISOString();

  const bounties: BountyRequest[] = [
    // 1. Open, $75 — road contracts, 0 reports
    {
      id: "bounty-001",
      requesterWallet: REQ1,
      title: "Investigate Ministry of Transport road contracts 2026",
      requestText:
        "I am requesting a journalist to review all road construction and maintenance contracts awarded by the Ministry of Transport in 2026 that bypassed the standard open-bidding process. Specifically, I want to know whether emergency waiver clauses were applied legitimately or were used to circumvent competitive procurement. Please cross-reference awarded prices with EU benchmark data for comparable projects and report any patterns of repeated contractor wins.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Evidence+Screenshot",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0142",
      ],
      bountyUSD: 75,
      status: "Open",
      createdAt: day(5),
    },

    // 2. Open, $50 — EuroTech laptops, 2 pending reports (JRN1, JRN2)
    {
      id: "bounty-002",
      requesterWallet: REQ2,
      title: "EuroTech Solutions DOOEL — ministry laptop contract irregularities",
      requestText:
        "EuroTech Solutions DOOEL won a €3.1 million IT procurement contract just 14 months after being registered. I need someone to pull the full company registration file, identify all directors and shareholders, and check whether any of them have current or prior roles in government IT procurement. The contract specifications appear tailored to a single vendor — please verify this and quantify the price markup versus market rates.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Registration+Scan",
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Contract+Document",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138",
        "https://crm.gov.mk/registar/eurotech-solutions-dooel",
      ],
      bountyUSD: 50,
      status: "Open",
      createdAt: day(8),
    },

    // 3. Open, $30 — catering overpricing, 1 pending report (JRN3)
    {
      id: "bounty-003",
      requesterWallet: REQ3,
      title: "Verify catering contract overpricing at National Assembly",
      requestText:
        "The catering contract T-2026-0057 was awarded under a questionable emergency waiver with a per-meal cost 67% above comparable institutions. I need a journalist to obtain at least three comparable contract prices from other public bodies and produce a simple price-per-meal comparison with sources. Document any evidence suggesting the waiver was pre-arranged rather than genuinely necessary.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Catering+Invoice",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0057",
      ],
      bountyUSD: 30,
      status: "Open",
      createdAt: day(3),
    },

    // 4. Open, $15 — cleaning contracts, 0 reports
    {
      id: "bounty-004",
      requesterWallet: REQ1,
      title: "Cleaning services contract T-2026-0131 — competitor disqualifications",
      requestText:
        "Two competing bids for the cleaning services contract T-2026-0131 were disqualified within 48 hours of submission on minor procedural grounds, leaving CleanPro DOOEL as the only qualified bidder. The awarded monthly rate is reportedly double the market rate. I need a journalist to obtain the disqualification decisions, verify the stated grounds, and compare the awarded rate with at least three independent facility management quotes.",
      attachmentUrls: [],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0131",
      ],
      bountyUSD: 15,
      status: "Open",
      createdAt: day(6),
    },

    // 5. Awarded, $100 — JRN1 approved, JRN2 declined
    {
      id: "bounty-005",
      requesterWallet: REQ2,
      title: "Stadium construction contractor — beneficial ownership & debarment check",
      requestText:
        "The contractor for stadium renovation T-2026-0077 has a parent company with reported irregularities in neighbouring countries. I need a journalist to obtain the full corporate structure, trace ultimate beneficial ownership, and verify whether any principals appear on EU or national debarment lists. Please also check whether previous public contracts were fulfilled on time and within budget.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Corporate+Structure",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077",
      ],
      bountyUSD: 100,
      status: "Awarded",
      awardedReportId: "br-005-jrn1",
      createdAt: day(18),
    },

    // 6. Awarded, $200 — JRN2 approved, JRN3 declined
    {
      id: "bounty-006",
      requesterWallet: REQ1,
      title: "Granit AD — cross-ministry contract history and price patterns",
      requestText:
        "Granit AD has appeared as winning bidder in multiple high-value tenders across at least three ministries over the past two years. I need a journalist to compile a full list of public contracts awarded to Granit AD since 2023, compare awarded prices with independent cost estimates, and investigate whether the same procurement officials appear across multiple award decisions. Document any ownership connections with government personnel.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Granit+Contract+List",
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Price+Comparison+Table",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/search?contractor=Granit+AD",
        "https://crm.gov.mk/registar/granit-ad",
      ],
      bountyUSD: 200,
      status: "Awarded",
      awardedReportId: "br-006-jrn2",
      createdAt: day(22),
    },

    // 7. Open, $25 — cybersecurity company, 3 pending reports
    {
      id: "bounty-007",
      requesterWallet: REQ3,
      title: "Cybersecurity contract T-2026-0199 — shell company concerns",
      requestText:
        "A newly registered cybersecurity firm won a €900,000 government network monitoring contract with no track record. The company has no public website, no staff profiles, and registered just six months before winning the bid. I need a journalist to investigate the company's real structure, identify its principals, and determine whether it has the technical capacity to deliver the contracted services. Any political connections should be documented.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Tender+T-2026-0199",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0199",
      ],
      bountyUSD: 25,
      status: "Open",
      createdAt: day(10),
    },

    // 8. Open, $40 — stadium contractor, 1 pending report
    {
      id: "bounty-008",
      requesterWallet: REQ2,
      title: "Subcontractor payments withheld on stadium project T-2026-0077",
      requestText:
        "Multiple subcontractors on the stadium project T-2026-0077 have reportedly not been paid for months despite the primary contractor receiving full payment from the public budget. I need a journalist to contact subcontractors, gather testimony and payment records, and document the discrepancy. If primary contractor invoicing was submitted and approved, but downstream payments are missing, this could indicate funds diversion.",
      attachmentUrls: [],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077-payments",
      ],
      bountyUSD: 40,
      status: "Open",
      createdAt: day(7),
    },

    // 9. Awarded, $60 — approved by requester
    {
      id: "bounty-009",
      requesterWallet: REQ3,
      title: "Software licensing costs — Ministry of Interior overpayment",
      requestText:
        "The Ministry of Interior's annual software licensing renewal T-2026-0088 came in at €1.4 million — an increase of 220% over the previous cycle with no scope change. I need a journalist to compare the renewal rate with published commercial licensing costs, identify the reseller markup chain, and determine whether alternative open-source or competitive licensing options were formally considered as required by procurement rules.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=License+Renewal+Invoice",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0088",
      ],
      bountyUSD: 60,
      status: "Awarded",
      awardedReportId: "br-009-jrn1",
      createdAt: day(30),
    },

    // 10. Open, $120 — big investigation, 0 reports
    {
      id: "bounty-010",
      requesterWallet: REQ1,
      title: "Full audit: infrastructure contracts 2023–2026 awarded to connected firms",
      requestText:
        "This is a broad investigation request covering all infrastructure contracts above €500,000 awarded between January 2023 and May 2026 where the winning contractor has identifiable ownership overlap with government advisory roles. I need a journalist or investigative team to systematically cross-reference the national procurement registry with corporate ownership records. The deliverable should be a structured dataset plus a narrative report identifying patterns. Evidence of specific irregularities should be documented and sourced.",
      attachmentUrls: [
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Contract+Database+Export",
        "https://via.placeholder.com/800x500/1a1a1a/EAB308?text=Ownership+Mapping",
      ],
      sourceUrls: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx",
        "https://crm.gov.mk/registar",
      ],
      bountyUSD: 120,
      status: "Open",
      createdAt: day(2),
    },
  ];

  const bountyReports: BountyReport[] = [
    // bounty-002: 2 pending (JRN1, JRN2)
    {
      id: "br-002-jrn1",
      bountyId: "bounty-002",
      journalistWallet: JRN1,
      reportText:
        "EuroTech Solutions DOOEL was registered on 14 November 2024 with a single director who served as an IT procurement consultant to the Ministry of Education from March 2023 to January 2025 — a direct conflict of interest not declared during the tender process. Corporate registry records show the company's sole shareholder is a holding entity registered in Cyprus whose ultimate beneficial owner could not be verified from publicly available sources. The laptop specifications in T-2026-0138 list a screen resolution, battery model number, and chassis dimensions that correspond exclusively to one discontinued OEM product line, structurally excluding competitive bids. Current market pricing for equivalent hardware is approximately 38% below the awarded contract value of €3.1 million.",
      evidenceLinks: [
        "https://crm.gov.mk/registar/eurotech-solutions-dooel",
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Document+Scan",
      ],
      status: "Pending",
      createdAt: day(4),
    },
    {
      id: "br-002-jrn2",
      bountyId: "bounty-002",
      journalistWallet: JRN2,
      reportText:
        "Independent analysis of bid documentation for T-2026-0138 confirms the technical specifications were deliberately tailored to exclude two of the three competing firms during the pre-qualification stage. The procurement timeline between publication and deadline was 34 days — below the 45-day minimum recommended by EU guidelines for projects of this size. Cross-referencing delivery receipts with school inventory records shows 340 of the 4,200 laptops listed as delivered were never registered in any school asset register, amounting to approximately €251,000 in unaccounted hardware. Ministry officials declined to comment when contacted.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138-bid",
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0138-delivery",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Delivery+Discrepancy",
      ],
      status: "Pending",
      createdAt: day(3),
    },

    // bounty-003: 1 pending (JRN3)
    {
      id: "br-003-jrn3",
      bountyId: "bounty-003",
      journalistWallet: JRN3,
      reportText:
        "Tender T-2026-0057 for catering services at the National Assembly was awarded without the legally required minimum of three competing bids. The contracting authority cited an emergency waiver that does not appear to meet statutory criteria — emergency procurement rules require demonstrable urgency arising from unforeseen events, which is not evidenced in the published documentation. Price comparison with four comparable public institution catering contracts in Skopje shows the awarded per-meal cost is 67% above average. An internal source from the procurement office stated that the preferred vendor had been identified informally before the formal process commenced.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0057",
      ],
      attachmentUrls: [],
      status: "Pending",
      createdAt: day(2),
    },

    // bounty-005: JRN1 approved, JRN2 declined
    {
      id: "br-005-jrn1",
      bountyId: "bounty-005",
      journalistWallet: JRN1,
      reportText:
        "The parent company of the T-2026-0077 stadium contractor — InfraBuild Holdings — appears in two EU anti-fraud office investigation reports from 2022 and 2023 relating to inflated invoicing on road infrastructure projects in Serbia and Bulgaria. The ultimate beneficial owner of the Macedonian subsidiary could not be confirmed from public filings; the corporate chain passes through two shell entities in Luxembourg and Malta. A search of EU debarment databases (EDES and national equivalents) returned no active debarment notice, however the OLAF investigation remains open. Previous contracts fulfilled by affiliated entities show a pattern of 15–40% cost overruns.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077",
        "https://ec.europa.eu/anti-fraud/investigations/case-infrabuild",
        "https://crm.gov.mk/registar/infrabuild-mk",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=OLAF+Reference",
      ],
      status: "Approved",
      createdAt: day(12),
    },
    {
      id: "br-005-jrn2",
      bountyId: "bounty-005",
      journalistWallet: JRN2,
      reportText:
        "A thorough review of T-2026-0077 documentation including all bid submissions, evaluation committee minutes, and the final award decision finds no procedural irregularities in the Macedonian procurement process itself. Three bids were received, assessed by an independent technical panel, and the winning bid was the second-lowest in price but highest on technical merit — a legitimate outcome under best-value criteria. The EU anti-fraud office references cited relate to a separate subsidiary under different management and should not be attributed to the local entity without further evidence.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077-eval",
      ],
      attachmentUrls: [],
      status: "Declined",
      createdAt: day(11),
    },

    // bounty-006: JRN2 approved, JRN3 declined
    {
      id: "br-006-jrn2",
      bountyId: "bounty-006",
      journalistWallet: JRN2,
      reportText:
        "A systematic cross-reference of procurement registry data with corporate ownership records identifies Granit AD winning 14 contracts across the Ministry of Transport, Ministry of Infrastructure, and the Public Enterprise for State Roads between January 2023 and April 2026, with a combined value of €47.3 million. In nine of those fourteen contracts, the same two members of the evaluation committee appear in the award decision — both of whom have family connections to senior figures within the company's parent holding. Awarded prices exceed independent engineering cost estimates by an average of 31% across the nine flagged contracts.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/search?contractor=Granit+AD",
        "https://crm.gov.mk/registar/granit-ad",
        "https://crm.gov.mk/registar/granit-holding",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Contract+Registry+Export",
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Committee+Member+Cross-ref",
      ],
      status: "Approved",
      createdAt: day(18),
    },
    {
      id: "br-006-jrn3",
      bountyId: "bounty-006",
      journalistWallet: JRN3,
      reportText:
        "A review of 12 Granit AD contracts awarded in the stated period shows that while the company does appear frequently, this is partly explained by its market position as one of only three pre-qualified contractors meeting the technical capacity requirements for large-scale road infrastructure in the country. Price comparisons require adjustment for site-specific conditions — four of the contracts included significant landslide remediation scope not reflected in base benchmarks. No direct ownership overlap with government personnel was identified in publicly available corporate filings.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/search?contractor=Granit+AD",
      ],
      attachmentUrls: [],
      status: "Declined",
      createdAt: day(17),
    },

    // bounty-007: 3 pending (JRN1, JRN2, JRN3)
    {
      id: "br-007-jrn1",
      bountyId: "bounty-007",
      journalistWallet: JRN1,
      reportText:
        "CyberShield DOOEL, the awarded contractor for T-2026-0199, was registered on 3 June 2025 — exactly six months and two weeks before the tender deadline. The company lists a single employee in its tax filings and has no verifiable technical certifications in the cybersecurity domain. The director's name matches a political party donor listed in published campaign finance disclosures. The network monitoring solution specified in the contract requires a minimum of eight certified security engineers to operate; the company cannot demonstrably staff this.",
      evidenceLinks: [
        "https://crm.gov.mk/registar/cybershield-dooel",
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0199",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Registration+Filing",
      ],
      status: "Pending",
      createdAt: day(7),
    },
    {
      id: "br-007-jrn2",
      bountyId: "bounty-007",
      journalistWallet: JRN2,
      reportText:
        "Investigation of T-2026-0199 reveals that the technical evaluation committee granted CyberShield DOOEL a passing score on the staffing capacity criterion based on a letter of intent from a subcontracting firm — a practice the procurement rules permit but which the committee's own internal guidelines discourage for security-sensitive contracts. The subcontractor named in the letter of intent has not provided services under any previous government security contract. Combined with the absence of any public track record for the prime contractor, the procurement raises serious capacity and integrity concerns that the contracting authority has not addressed.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0199-eval",
      ],
      attachmentUrls: [],
      status: "Pending",
      createdAt: day(6),
    },
    {
      id: "br-007-jrn3",
      bountyId: "bounty-007",
      journalistWallet: JRN3,
      reportText:
        "A review of the tender documentation for T-2026-0199 confirms the technical specifications did not require pre-existing government contracts as a qualification criterion, which is consistent with EU procurement non-discrimination principles. The awarded value of €900,000 falls within normal market ranges for comparable network monitoring deployments of this scale based on three commercial quotes obtained from regional cybersecurity firms. While the company's short registration history is notable, it does not constitute a procurement irregularity under current rules.",
      evidenceLinks: [],
      attachmentUrls: [],
      status: "Pending",
      createdAt: day(5),
    },

    // bounty-008: 1 pending (JRN2)
    {
      id: "br-008-jrn2",
      bountyId: "bounty-008",
      journalistWallet: JRN2,
      reportText:
        "Seven subcontractors working on the stadium project T-2026-0077 confirmed in written statements that outstanding invoices dating back between three and seven months remain unpaid by the primary contractor. Invoice copies provided show a combined outstanding amount of €318,000. Public treasury records confirm that the primary contractor received the full contractual payment instalment of €2.1 million from the state budget on schedule in December 2025. The primary contractor has not responded to formal payment demands. One subcontractor has filed a commercial court claim.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0077-payments",
        "https://court.mk/cases/T-0077-sub-2026",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Invoice+Evidence",
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=Court+Filing",
      ],
      status: "Pending",
      createdAt: day(4),
    },

    // bounty-009: JRN1 approved (sole report)
    {
      id: "br-009-jrn1",
      bountyId: "bounty-009",
      journalistWallet: JRN1,
      reportText:
        "The Ministry of Interior's software license renewal T-2026-0088 was awarded to a single reseller without a competitive tender, citing a sole-source justification based on vendor lock-in. The reseller's markup over the published vendor list price is 94% — significantly above the industry norm of 15–25% for government volume licensing. Published commercial pricing for the same software suite from the vendor's website shows the total cost should have been approximately €640,000 for the licensed user count, compared to the €1.4 million contract value. Procurement rules require documented consideration of open-source alternatives for renewals above €500,000; no such documentation appears in the published procurement file.",
      evidenceLinks: [
        "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac/T-2026-0088",
        "https://vendor-pricing.example.com/gov-licensing",
      ],
      attachmentUrls: [
        "https://via.placeholder.com/800x400/1a1a1a/EAB308?text=License+Cost+Analysis",
      ],
      status: "Approved",
      createdAt: day(25),
    },
  ];

  // Write bounties
  const existingBounties = readBounties();
  const existingBountyIds = new Set(existingBounties.map((b) => b.id));
  const bounciesToAdd = bounties.filter((b) => !existingBountyIds.has(b.id));
  if (bounciesToAdd.length > 0) {
    writeBounties([...existingBounties, ...bounciesToAdd]);
    cachedBounties = null;
    notifyBountyListeners();
  }

  // Write reports
  const existingReports = readReports();
  const existingReportIds = new Set(existingReports.map((r) => r.id));
  const reportsToAdd = bountyReports.filter((r) => !existingReportIds.has(r.id));
  if (reportsToAdd.length > 0) {
    writeReports([...existingReports, ...reportsToAdd]);
    cachedReports = null;
    notifyReportListeners();
  }

  localStorage.setItem(SEED_KEY, "1");
}
