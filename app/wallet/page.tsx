"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet, ArrowDownLeft, ArrowUpRight, Copy, CheckCheck,
  ExternalLink, TrendingDown, TrendingUp, Layers,
} from "lucide-react";
import { useBounties, useAllBountyReports } from "@/lib/bounties";
import {
  PUBLIC_WALLET_ADDRESS, PUBLIC_WALLET_LABEL,
  TREASURY_SOL_BALANCE, SOL_USD_RATE,
  buildWalletLedger,
  type WalletTransaction,
} from "@/lib/publicWallet";
import { useHasMounted } from "@/lib/store";
import { truncateAddress, formatDate } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n);
}

function formatSOL(usd: number) {
  return (usd / SOL_USD_RATE).toFixed(3);
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-muted hover:text-ink transition-colors text-xs"
      title="Copy address"
    >
      {copied
        ? <><CheckCheck className="h-3.5 w-3.5 text-forest" /><span className="text-forest">Copied</span></>
        : <><Copy className="h-3.5 w-3.5" /><span>Copy</span></>
      }
    </button>
  );
}

// ── Transaction row ───────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: WalletTransaction }) {
  const isIn = tx.direction === "in";
  const solAmount = formatSOL(tx.amountUSD);
  const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`;

  return (
    <div className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isIn ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
        {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.label}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[11px] text-white/40 font-mono">{isIn ? "from" : "to"} {truncateAddress(tx.counterparty)}</span>
          <span className="text-white/20 text-[10px]">·</span>
          <Link href={explorerUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-[11px] text-white/40 hover:text-[#0084ff] transition-colors">
            {truncateAddress(tx.signature, 6)}<ExternalLink className="h-2.5 w-2.5 ml-0.5" />
          </Link>
        </div>
      </div>
      <div className="shrink-0 text-right hidden sm:block">
        <span className="text-[11px] text-white/30">{formatDate(tx.timestamp)}</span>
      </div>
      <div className="shrink-0 text-right min-w-[90px]">
        <div className={`text-sm font-bold font-mono tabular-nums ${isIn ? "text-emerald-400" : "text-red-400"}`}>
          {isIn ? "+" : "−"}{formatUSD(tx.amountUSD)}
        </div>
        <div className="text-[10px] text-white/30 font-mono">{isIn ? "+" : "−"}{solAmount} SOL</div>
      </div>
    </div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

type Filter = "all" | "in" | "out";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WalletPage() {
  const mounted  = useHasMounted();
  const bounties = useBounties();
  const reports  = useAllBountyReports();
  const [filter, setFilter] = useState<Filter>("all");

  const ledger = useMemo(
    () => (mounted ? buildWalletLedger(bounties, reports) : []),
    [mounted, bounties, reports]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return ledger;
    return ledger.filter((tx) => tx.direction === filter);
  }, [ledger, filter]);

  const totalIn  = ledger.filter((t) => t.direction === "in").reduce((s, t) => s + t.amountUSD, 0);
  const totalOut = ledger.filter((t) => t.direction === "out").reduce((s, t) => s + t.amountUSD, 0);
  const netUSD   = totalIn - totalOut;

  const usdBalance    = TREASURY_SOL_BALANCE * SOL_USD_RATE;
  const explorerAddr  = `https://explorer.solana.com/address/${PUBLIC_WALLET_ADDRESS}?cluster=devnet`;

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-[#0084ff]" />
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium">Platform</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
          Public Wallet
        </h1>
        <p className="text-[#b8b8b8] text-sm max-w-xl mb-10 leading-relaxed">
          All bounty deposits and journalist payouts flow through this on-chain treasury.
          Every transaction is public and verifiable on Solana devnet.
        </p>

        {/* Wallet identity card */}
        <div className="rounded-xl border border-white/[0.06] p-6 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{PUBLIC_WALLET_LABEL}</p>
              <p className="font-mono text-sm text-white break-all">{PUBLIC_WALLET_ADDRESS}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <CopyButton text={PUBLIC_WALLET_ADDRESS} />
              <Link href={explorerAddr} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-[#0084ff] transition-colors">
                Explorer <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="flex items-end gap-3 pt-5 border-t border-white/[0.06]">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Balance</p>
              <p className="text-3xl font-light font-mono tabular-nums text-[#0084ff]">
                {TREASURY_SOL_BALANCE.toFixed(3)} <span className="text-lg text-white/40 font-normal">SOL</span>
              </p>
              <p className="text-sm text-white/40 font-mono mt-0.5">≈ {formatUSD(usdBalance)}</p>
            </div>
            <div className="ml-auto text-[10px] text-white/30 uppercase tracking-wider pb-1">Solana Devnet</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: TrendingDown, label: "Paid out", val: formatUSD(totalOut), sub: `${ledger.filter(t => t.direction === "out").length} payouts`, color: "text-red-400" },
            { icon: TrendingUp, label: "Received", val: formatUSD(totalIn), sub: `${ledger.filter(t => t.direction === "in").length} deposits`, color: "text-emerald-400" },
            { icon: Layers, label: "Net held", val: formatUSD(netUSD), sub: "awaiting payout", color: netUSD >= 0 ? "text-[#0084ff]" : "text-red-400" },
          ].map(({ icon: Icon, label, val, sub, color }) => (
            <div key={label} className="rounded-xl border border-white/[0.06] p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
                <span className="text-[10px] uppercase tracking-widest text-white/40">{label}</span>
              </div>
              <p className={`font-mono text-base font-bold tabular-nums ${color}`}>{val}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Transaction ledger */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium text-base text-white">Transactions</h2>
          <div className="flex gap-1">
            {(["all", "in", "out"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={["px-3 py-1 text-xs font-semibold rounded-lg border transition-colors",
                  filter === f ? "border-[#0084ff]/60 bg-[#0084ff]/10 text-[#0084ff]" : "border-white/[0.08] text-white/40 hover:text-white hover:border-white/20",
                ].join(" ")}>
                {f === "all" ? "All" : f === "in" ? "Deposits" : "Payouts"}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
            <p className="text-white/40 text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
            {filtered.map((tx) => (
              <TxRow key={tx.signature} tx={tx} />
            ))}
          </div>
        )}

        <p className="text-xs text-white/30 mt-8 pt-6 border-t border-white/[0.06]">
          All transactions are simulated on Solana devnet. Explorer links open in a new tab.
          USD amounts reflect the bounty value at time of posting.
        </p>
      </div>
    </div>
  );
}
