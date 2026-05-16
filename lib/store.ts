"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// ── Flag categories ────────────────────────────────────────────────────────────
export const FLAG_CATEGORIES = [
  "Price seems inflated",
  "Contractor has political connections",
  "No competitive bidding",
  "Contract awarded too fast",
  "Specifications favor one company",
  "Scope changed after awarding",
  "Other",
] as const;
export type FlagCategory = (typeof FLAG_CATEGORIES)[number];

// ── Badge tiers ────────────────────────────────────────────────────────────────
export type BadgeTier = {
  name: string;
  icon: "shield" | "search" | "scale" | "award";
  minFlags: number;
  votingWeight: number;
  colorClass: string;
  bgClass: string;
};

export const BADGE_TIERS: BadgeTier[] = [
  { name: "Street Watchdog",    icon: "shield", minFlags: 10,  votingWeight: 1.5, colorClass: "text-slate-700",  bgClass: "bg-slate-100"  },
  { name: "Civic Investigator", icon: "search", minFlags: 25,  votingWeight: 2,   colorClass: "text-blue-700",   bgClass: "bg-blue-50"    },
  { name: "Justice Guardian",   icon: "scale",  minFlags: 50,  votingWeight: 3,   colorClass: "text-violet-700", bgClass: "bg-violet-50"  },
  { name: "Civic Champion",     icon: "award",  minFlags: 100, votingWeight: 4,   colorClass: "text-amber-700",  bgClass: "bg-amber-50"   },
];

// ── Core types ─────────────────────────────────────────────────────────────────
export type FlagStatus = "Pending" | "VerifiedSuspicious" | "DismissedAsSpam";

export type FlagRecord = {
  id: string;
  tenderId: string;
  flaggerWallet: string;
  category: FlagCategory;
  reasonText: string;
  evidenceUrl?: string;
  reasonHash: string;
  txSignature: string;
  createdAt: string;
  status: FlagStatus;
  votes: VoteRecord[];
};

export type VoteRecord = {
  flagId: string;
  verifierWallet: string;
  verdict: "Validate" | "Reject";
  txSignature: string;
  createdAt: string;
};

// ── Storage ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "tenderwatch.flags.v2";
const SUBS = new Set<() => void>();

function read(): FlagRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(flags: FlagRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  SUBS.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  SUBS.add(cb);
  return () => { SUBS.delete(cb); };
}

// ── Hooks ──────────────────────────────────────────────────────────────────────
export function useFlags(): FlagRecord[] {
  const flags = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(read()),
    () => "[]",
  );
  return JSON.parse(flags) as FlagRecord[];
}

export function useTenderFlags(tenderId: string): FlagRecord[] {
  const all = useFlags();
  return all.filter((f) => f.tenderId === tenderId);
}

export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

// ── Mutations ──────────────────────────────────────────────────────────────────
export function addFlag(flag: FlagRecord) {
  const current = read();
  current.unshift(flag);
  write(current);
}

// threshold=1: one journalist validation resolves the flag
export function addVote(flagId: string, vote: VoteRecord, threshold = 1) {
  const current = read();
  const idx = current.findIndex((f) => f.id === flagId);
  if (idx === -1) return;
  const flag = current[idx];
  if (flag.status !== "Pending") return;
  if (flag.votes.some((v) => v.verifierWallet === vote.verifierWallet)) return;
  flag.votes.push(vote);
  const validated = flag.votes.filter((v) => v.verdict === "Validate").length;
  const rejected  = flag.votes.filter((v) => v.verdict === "Reject").length;
  if (validated >= threshold) flag.status = "VerifiedSuspicious";
  else if (rejected >= threshold) flag.status = "DismissedAsSpam";
  current[idx] = flag;
  write(current);
}

export function resetStore() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  SUBS.forEach((cb) => cb());
}

// ── Badge helpers ──────────────────────────────────────────────────────────────
export function getValidatedFlagCount(walletAddress: string): number {
  return read().filter(
    (f) => f.flaggerWallet === walletAddress && f.status === "VerifiedSuspicious"
  ).length;
}

export function getBadgeTier(walletAddress: string): BadgeTier | null {
  const count = getValidatedFlagCount(walletAddress);
  return [...BADGE_TIERS].reverse().find((t) => count >= t.minFlags) ?? null;
}

export function getNextBadgeTier(walletAddress: string): BadgeTier | null {
  const count = getValidatedFlagCount(walletAddress);
  return BADGE_TIERS.find((t) => count < t.minFlags) ?? null;
}

export function getVotingWeight(walletAddress: string): number {
  return getBadgeTier(walletAddress)?.votingWeight ?? 1;
}

// ── Verifier allowlist ─────────────────────────────────────────────────────────
export const VERIFIER_ALLOWLIST = [
  "VeriFier1Demo111111111111111111111111111111",
  "VeriFier2Demo111111111111111111111111111111",
  "VeriFier3Demo111111111111111111111111111111",
];

export function isVerifier(walletAddress: string | undefined | null): boolean {
  if (!walletAddress) return false;
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  return VERIFIER_ALLOWLIST.includes(walletAddress);
}
