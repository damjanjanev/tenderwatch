"use client";

import type { FlagRecord } from "@/lib/store";

// Fake wallet addresses representing different citizens
export const DEMO_WALLETS = {
  aleksandra: "ALEx3aNdRaK0v4cEvSkA111111111111111111111111",
  bojan:      "B0jAnM1tReSk1111111111111111111111111111111",
  elena:      "ELeNaP3tRoVsKa11111111111111111111111111111",
  dragan:     "DRAgaNT0d0R0v1c11111111111111111111111111111",
  ivana:      "1vAnAiVaN0vSkA111111111111111111111111111111",
  marko:      "MArk0St0jAn0vSk1111111111111111111111111111",
  stefan:     "St3fAnGeOrG1eVsK111111111111111111111111111",
  nina:       "N1nANiK0L0vSkA1111111111111111111111111111",
};

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

export const SEED_FLAGS: FlagRecord[] = [
  // ── Aleksandra — 28 validated flags (Civic Investigator 🔍) ──────────────────
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `seed_alek_${i}`,
    tenderId: ["T-2026-0142", "T-2026-0138", "T-2026-0124", "T-2026-0115", "T-2026-0108",
               "T-2026-0094", "T-2026-0085", "T-2026-0077", "T-2026-0064", "T-2026-0057",
               "T-2026-0049", "T-2026-0042"][i % 12],
    flaggerWallet: DEMO_WALLETS.aleksandra,
    category: ["Price seems inflated", "No competitive bidding", "Contractor has political connections",
                "Specifications favor one company", "Contract awarded too fast"][i % 5] as FlagRecord["category"],
    reasonText: [
      "The per-km road cost is 2.3× the EU benchmark for comparable projects in the Balkans over the last five years. No competitive bidding round was held and the contractor's owner is a known associate of the regional transport minister.",
      "Specifications are written so narrowly they exclude all but one manufacturer. The tender was published for only 8 days — the legal minimum — and no pre-bid meeting was held for questions.",
      "This contractor has won 9 of the last 11 road bids issued by this ministry. The bid price matches the budget estimate exactly, which suggests advance knowledge of the ceiling.",
      "The contract was awarded within 72 hours of the bid deadline — far too fast for a genuine evaluation of technical proposals totaling hundreds of pages.",
      "Price per workstation is 3.1× the national public sector benchmark. The furniture is luxury hospitality grade and the contractor has no prior public sector references.",
    ][i % 5],
    evidenceUrl: i % 3 === 0 ? "https://e-nabavki.gov.mk" : undefined,
    reasonHash: `hash_alek_${i}`,
    txSignature: `5aLeKsig${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    createdAt: daysAgo(60 - i * 2),
    status: "VerifiedSuspicious" as const,
    votes: [{
      flagId: `seed_alek_${i}`,
      verifierWallet: "VeriFier1Demo111111111111111111111111111111",
      verdict: "Validate" as const,
      txSignature: `voteAlek${i}sig`,
      createdAt: daysAgo(59 - i * 2),
    }],
  })),

  // ── Bojan — 52 validated flags (Justice Guardian ⚖️) ────────────────────────
  ...Array.from({ length: 52 }, (_, i) => ({
    id: `seed_bojan_${i}`,
    tenderId: ["T-2026-0049", "T-2026-0077", "T-2026-0131", "T-2026-0108", "T-2026-0094",
               "T-2026-0085", "T-2026-0064", "T-2026-0057", "T-2026-0042", "T-2026-0138"][i % 10],
    flaggerWallet: DEMO_WALLETS.bojan,
    category: ["No competitive bidding", "Contractor has political connections", "Scope changed after awarding",
                "Price seems inflated", "Contract awarded too fast"][i % 5] as FlagRecord["category"],
    reasonText: [
      "Direct award without open tender, justified under a national security exemption clause that does not legally apply to standard IT infrastructure. The same exemption was used by this ministry three times in the past year.",
      "The cybersecurity firm was registered exactly 5 months before this bid — apparently created specifically to qualify. Its directors share addresses with a politically connected law firm that represents the ministry.",
      "The contract scope was quietly extended by 40% after award without a new tender, which violates procurement law. The extension was buried in a supplementary annex published only on the ministry's internal system.",
      "Catering price is 4.2× the previous comparable contract from 2022, adjusted for inflation. No explanation was provided for the increase and the same contractor has held this contract since 2014.",
      "The stadium contractor has zero prior stadium projects. Their only references are two private warehouse builds. The technical evaluation score they received is mathematically inconsistent with the stated scoring matrix.",
    ][i % 5],
    evidenceUrl: i % 4 === 0 ? "https://e-nabavki.gov.mk" : undefined,
    reasonHash: `hash_bojan_${i}`,
    txSignature: `5B0jAnSiG${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    createdAt: daysAgo(90 - i),
    status: "VerifiedSuspicious" as const,
    votes: [{
      flagId: `seed_bojan_${i}`,
      verifierWallet: "VeriFier1Demo111111111111111111111111111111",
      verdict: "Validate" as const,
      txSignature: `voteBojan${i}sig`,
      createdAt: daysAgo(89 - i),
    }],
  })),

  // ── Elena — 11 validated flags (Street Watchdog 🐕) ─────────────────────────
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `seed_elena_${i}`,
    tenderId: ["T-2026-0115", "T-2026-0124", "T-2026-0142", "T-2026-0094", "T-2026-0057"][i % 5],
    flaggerWallet: DEMO_WALLETS.elena,
    category: ["Contractor has political connections", "Price seems inflated", "No competitive bidding"][i % 3] as FlagRecord["category"],
    reasonText:
      "The winning contractor's sole owner is listed as a campaign donor in public finance disclosures for the current ruling party. The bid score evaluation committee included a member who previously worked for the contractor. This is a clear conflict of interest that should disqualify the award under Article 24 of the Public Procurement Law.",
    reasonHash: `hash_elena_${i}`,
    txSignature: `5eLenASiG${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    createdAt: daysAgo(30 - i * 2),
    status: "VerifiedSuspicious" as const,
    votes: [{
      flagId: `seed_elena_${i}`,
      verifierWallet: "VeriFier2Demo111111111111111111111111111111",
      verdict: "Validate" as const,
      txSignature: `voteElena${i}sig`,
      createdAt: daysAgo(29 - i * 2),
    }],
  })),

  // ── Dragan — 6 validated flags (almost at Street Watchdog) ──────────────────
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `seed_dragan_${i}`,
    tenderId: ["T-2026-0099", "T-2026-0081", "T-2026-0073"][i % 3],
    flaggerWallet: DEMO_WALLETS.dragan,
    category: "Price seems inflated" as const,
    reasonText:
      "The awarded price is significantly above comparable projects completed in neighboring municipalities within the same fiscal year. Three alternative bids were submitted but their evaluation scores were not published, which is required by law within 5 days of award.",
    reasonHash: `hash_dragan_${i}`,
    txSignature: `5dRaGaNSiG${i}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    createdAt: daysAgo(15 - i),
    status: "VerifiedSuspicious" as const,
    votes: [{
      flagId: `seed_dragan_${i}`,
      verifierWallet: "VeriFier1Demo111111111111111111111111111111",
      verdict: "Validate" as const,
      txSignature: `voteDragan${i}sig`,
      createdAt: daysAgo(14 - i),
    }],
  })),

  // ── Ivana — 3 pending flags (new user, no badge yet) ────────────────────────
  {
    id: "seed_ivana_0",
    tenderId: "T-2026-0138",
    flaggerWallet: DEMO_WALLETS.ivana,
    category: "Specifications favor one company",
    reasonText:
      "The laptop specifications require a very specific screen resolution and battery configuration that only matches one OEM's discontinued product line. This appears deliberate — the specs were changed 2 days before the bid deadline in a way that excluded the two cheaper compliant models from other vendors.",
    evidenceUrl: "https://e-nabavki.gov.mk",
    reasonHash: "hash_ivana_0",
    txSignature: "5iVaNaSiG0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(3),
    status: "Pending",
    votes: [],
  },
  {
    id: "seed_ivana_1",
    tenderId: "T-2026-0049",
    flaggerWallet: DEMO_WALLETS.ivana,
    category: "No competitive bidding",
    reasonText:
      "The national security exemption used here does not apply under the 2022 amendment to the Public Procurement Law. Section 38(b) explicitly excludes IT infrastructure upgrades from this exemption unless classified systems are involved. This is standard customs database work — no classification applies.",
    reasonHash: "hash_ivana_1",
    txSignature: "5iVaNaSiG1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(1),
    status: "Pending",
    votes: [],
  },
  {
    id: "seed_ivana_2",
    tenderId: "T-2026-0064",
    flaggerWallet: DEMO_WALLETS.ivana,
    category: "Contractor has political connections",
    reasonText:
      "Sportska Gradba DOO was incorporated 8 months ago and has no prior stadium or sports infrastructure projects. Its registered address is the same building as a political party's regional office. The technical evaluation awarded it the maximum score for 'prior relevant experience' — which appears fabricated.",
    reasonHash: "hash_ivana_2",
    txSignature: "5iVaNaSiG2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(2),
    status: "Pending",
    votes: [],
  },

  // ── Marko — 1 pending, 2 dismissed ──────────────────────────────────────────
  {
    id: "seed_marko_0",
    tenderId: "T-2026-0119",
    flaggerWallet: DEMO_WALLETS.marko,
    category: "Price seems inflated",
    reasonText:
      "I believe the snow removal contract price is too high compared to last year. The same roads were cleaned for less money in 2024 and the contract was renewed at a higher rate without explanation or new competitive process.",
    reasonHash: "hash_marko_0",
    txSignature: "5mArK0SiG0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(10),
    status: "Pending",
    votes: [],
  },
  {
    id: "seed_marko_1",
    tenderId: "T-2026-0103",
    flaggerWallet: DEMO_WALLETS.marko,
    category: "Other",
    reasonText:
      "The textbook printing contract seems suspicious. I don't trust the contractor. They have been doing this for years and nobody checks if the books are actually printed correctly or delivered on time.",
    reasonHash: "hash_marko_1",
    txSignature: "5mArK0SiG1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(20),
    status: "DismissedAsSpam",
    votes: [{
      flagId: "seed_marko_1",
      verifierWallet: "VeriFier2Demo111111111111111111111111111111",
      verdict: "Reject",
      txSignature: "voteMarko1sig",
      createdAt: daysAgo(18),
    }],
  },
  {
    id: "seed_marko_2",
    tenderId: "T-2026-0089",
    flaggerWallet: DEMO_WALLETS.marko,
    category: "Price seems inflated",
    reasonText:
      "25 buses for 8.7M EUR seems like a lot of money. Are we sure this is a good price? Other cities buy buses cheaper. Someone should look into this and compare prices from other countries.",
    reasonHash: "hash_marko_2",
    txSignature: "5mArK0SiG2xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(25),
    status: "DismissedAsSpam",
    votes: [{
      flagId: "seed_marko_2",
      verifierWallet: "VeriFier1Demo111111111111111111111111111111",
      verdict: "Reject",
      txSignature: "voteMarko2sig",
      createdAt: daysAgo(23),
    }],
  },

  // ── Stefan — 2 validated flags (new but promising) ──────────────────────────
  {
    id: "seed_stefan_0",
    tenderId: "T-2026-0057",
    flaggerWallet: DEMO_WALLETS.stefan,
    category: "Price seems inflated",
    reasonText:
      "The per-workstation furniture cost of approximately €1,600 is 3.1× the standard government benchmark of €515. The winning contractor's portfolio consists entirely of luxury hotel and restaurant interiors. Their reference projects include a five-star resort in Ohrid — this is not a public office furniture supplier by any reasonable definition.",
    evidenceUrl: "https://e-nabavki.gov.mk",
    reasonHash: "hash_stefan_0",
    txSignature: "5sT3fAnSiG0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(7),
    status: "VerifiedSuspicious",
    votes: [{
      flagId: "seed_stefan_0",
      verifierWallet: "VeriFier1Demo111111111111111111111111111111",
      verdict: "Validate",
      txSignature: "voteStefan0sig",
      createdAt: daysAgo(6),
    }],
  },
  {
    id: "seed_stefan_1",
    tenderId: "T-2026-0077",
    flaggerWallet: DEMO_WALLETS.stefan,
    category: "Contractor has political connections",
    reasonText:
      "CyberShield Consulting DOOEL was registered on 2025-10-14 — exactly 5 months before this bid opened. The company has zero published cybersecurity work. A LinkedIn search of its listed employees shows no security certifications. The directors' registered home addresses overlap with a law firm that has represented the Ministry of Finance in three separate procurement disputes.",
    reasonHash: "hash_stefan_1",
    txSignature: "5sT3fAnSiG1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(5),
    status: "VerifiedSuspicious",
    votes: [{
      flagId: "seed_stefan_1",
      verifierWallet: "VeriFier2Demo111111111111111111111111111111",
      verdict: "Validate",
      txSignature: "voteStefan1sig",
      createdAt: daysAgo(4),
    }],
  },

  // ── Nina — 1 pending flag ─────────────────────────────────────────────────
  {
    id: "seed_nina_0",
    tenderId: "T-2026-0094",
    flaggerWallet: DEMO_WALLETS.nina,
    category: "Price seems inflated",
    reasonText:
      "Parliamentary catering at 4.2× the 2022 rate is extraordinary. The previous contract served identical events and the price increase far exceeds official inflation figures for food services in North Macedonia over the same period. The winning company was founded by a former parliamentary staff member who left 18 months ago.",
    evidenceUrl: "https://e-nabavki.gov.mk",
    reasonHash: "hash_nina_0",
    txSignature: "5N1NaSiG0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    createdAt: daysAgo(1),
    status: "Pending",
    votes: [],
  },
];

const SEED_KEY = "tenderwatch.seeded.v2";

export function seedDemoData() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_KEY)) return; // already seeded

  const existing = JSON.parse(window.localStorage.getItem("tenderwatch.flags.v2") || "[]");
  const merged = [...SEED_FLAGS, ...existing];
  window.localStorage.setItem("tenderwatch.flags.v2", JSON.stringify(merged));
  window.localStorage.setItem(SEED_KEY, "1");
}
