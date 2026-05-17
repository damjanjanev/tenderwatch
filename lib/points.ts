"use client";

import type { FlagRecord } from "@/lib/store";
import type { TenderReport } from "@/lib/tenderReports";
import { getTenderReportStatus } from "@/lib/tenderReports";

// ── Token system ──────────────────────────────────────────────────────────────

/** Ticker symbol shown in the UI */
export const TOKEN_TICKER = "CONTR";

/** Tokens awarded per accurate flag (flag on a tender that became VerifiedSuspicious) */
export const TOKENS_PER_ACCURATE_FLAG = 10;

// Keep POINTS_PER_ACCURATE_FLAG as alias so existing imports don't break
export const POINTS_PER_ACCURATE_FLAG = TOKENS_PER_ACCURATE_FLAG;

// ── Token milestone levels (for progress display) ─────────────────────────────

export type TokenLevel = {
  name: string;
  minTokens: number;
  description: string;
  colorClass: string;
};

export const TOKEN_LEVELS: TokenLevel[] = [
  { name: "Flagged",      minTokens: 10,  description: "First verified tip",          colorClass: "text-muted"      },
  { name: "Active",       minTokens: 30,  description: "3 accurate flags",            colorClass: "text-accent"     },
  { name: "Trusted",      minTokens: 60,  description: "6 accurate flags",            colorClass: "text-amber-500"  },
  { name: "Elite",        minTokens: 100, description: "10+ accurate flags",          colorClass: "text-cyan-500"   },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Group tender reports by tenderId so we can look up status per tender
 * without re-filtering the full array each time.
 */
export function buildReportsByTender(
  allReports: TenderReport[]
): Map<string, TenderReport[]> {
  const map = new Map<string, TenderReport[]>();
  for (const r of allReports) {
    const list = map.get(r.tenderId) ?? [];
    list.push(r);
    map.set(r.tenderId, list);
  }
  return map;
}

/**
 * Returns how many of a citizen's flags landed on a tender that is now
 * "VerifiedSuspicious" according to journalist reports.
 */
export function getAccurateFlagCount(
  walletAddress: string,
  allFlags: FlagRecord[],
  reportsByTender: Map<string, TenderReport[]>
): number {
  const myFlags = allFlags.filter((f) => f.flaggerWallet === walletAddress);
  let accurate = 0;
  const seenTenders = new Set<string>();
  for (const flag of myFlags) {
    // Count once per tender (multiple flags on the same tender = 1 point source)
    if (seenTenders.has(flag.tenderId)) continue;
    seenTenders.add(flag.tenderId);
    const reports = reportsByTender.get(flag.tenderId) ?? [];
    if (getTenderReportStatus(reports) === "VerifiedSuspicious") {
      accurate++;
    }
  }
  return accurate;
}

/**
 * Total points earned by a citizen wallet.
 * Formula: accurateFlags × POINTS_PER_ACCURATE_FLAG
 */
export function getCitizenPoints(
  walletAddress: string,
  allFlags: FlagRecord[],
  reportsByTender: Map<string, TenderReport[]>
): number {
  return getAccurateFlagCount(walletAddress, allFlags, reportsByTender) * POINTS_PER_ACCURATE_FLAG;
}

/**
 * Returns the highest token level the user has reached, or null.
 */
export function getTokenLevel(tokens: number): TokenLevel | null {
  return [...TOKEN_LEVELS].reverse().find((t) => tokens >= t.minTokens) ?? null;
}

/**
 * Returns the next token level the user is working toward, or null if max.
 */
export function getNextTokenLevel(tokens: number): TokenLevel | null {
  return TOKEN_LEVELS.find((t) => tokens < t.minTokens) ?? null;
}
