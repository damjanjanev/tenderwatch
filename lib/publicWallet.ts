"use client";

// ── Platform treasury wallet ──────────────────────────────────────────────────
// This is the contr platform's public wallet. All bounty deposits flow into it
// and all journalist payouts flow out of it. Visible on the /wallet page.

export const PUBLIC_WALLET_ADDRESS =
  "CnTR1vau1tTreasury1111111111111111111111111111";

export const PUBLIC_WALLET_LABEL = "contr Treasury";

/** Simulated SOL balance held by the treasury (for display only). */
export const TREASURY_SOL_BALANCE = 14.382;

/** USD/SOL rate used for display conversions. */
export const SOL_USD_RATE = 148.5;

// ── Transaction types ─────────────────────────────────────────────────────────

export type TxDirection = "in" | "out";

export type WalletTransaction = {
  /** Fake but deterministic Solana-looking signature (64 hex chars → base58-ish) */
  signature: string;
  direction: TxDirection;
  /** ISO timestamp */
  timestamp: string;
  /** Amount in USD */
  amountUSD: number;
  /** Counterparty wallet address */
  counterparty: string;
  /** Human-readable label */
  label: string;
  /** Underlying bounty id */
  bountyId: string;
};

// ── Deterministic fake tx signature ──────────────────────────────────────────
// Generates a repeatable 88-character base58-looking string from a seed string.

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function fakeTxSig(seed: string): string {
  // Simple deterministic hash → map to base58 alphabet
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  let out = "";
  let n = h;
  for (let i = 0; i < 88; i++) {
    // Mix index with position to spread characters
    const idx = ((n ^ (i * 6971)) * 1664525 + 1013904223) >>> 0;
    out += BASE58[idx % BASE58.length];
    n = idx;
  }
  return out;
}

// ── Build transaction ledger from bounty data ─────────────────────────────────

import type { BountyRequest, BountyReport } from "@/lib/bounties";

/**
 * Derives the full treasury transaction log from bounty + report data.
 *
 * - Every BountyRequest  → one INFLOW  (requester → treasury, amount = bountyUSD)
 * - Every Approved Report → one OUTFLOW (treasury → journalist, amount = bountyUSD)
 *
 * Sorted newest-first.
 */
export function buildWalletLedger(
  bounties: BountyRequest[],
  reports: BountyReport[]
): WalletTransaction[] {
  const txs: WalletTransaction[] = [];

  // Inflows — one per bounty request
  for (const b of bounties) {
    txs.push({
      signature:    fakeTxSig(`deposit-${b.id}`),
      direction:    "in",
      timestamp:    b.createdAt,
      amountUSD:    b.bountyUSD,
      counterparty: b.requesterWallet,
      label:        b.title,
      bountyId:     b.id,
    });
  }

  // Outflows — one per approved report
  for (const r of reports) {
    if (r.status !== "Approved") continue;
    const bounty = bounties.find((b) => b.id === r.bountyId);
    if (!bounty) continue;
    txs.push({
      signature:    fakeTxSig(`payout-${r.id}`),
      direction:    "out",
      timestamp:    r.createdAt,
      amountUSD:    bounty.bountyUSD,
      counterparty: r.journalistWallet,
      label:        bounty.title,
      bountyId:     bounty.id,
    });
  }

  // Newest first
  return txs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
