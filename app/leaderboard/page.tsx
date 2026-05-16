"use client";

import { useFlags, useHasMounted, getBadgeTier, BADGE_TIERS } from "@/lib/store";
import { truncateAddress } from "@/lib/utils";
import { Trophy } from "lucide-react";

type WatchdogEntry = {
  wallet: string;
  validatedCount: number;
  pendingCount: number;
  rejectedCount: number;
  badge: ReturnType<typeof getBadgeTier>;
};

export default function LeaderboardPage() {
  const mounted = useHasMounted();
  const flags = useFlags();

  if (!mounted) return null;

  // Build leaderboard from all flags
  const walletMap = new Map<string, WatchdogEntry>();

  for (const flag of flags) {
    const w = flag.flaggerWallet;
    if (!walletMap.has(w)) {
      walletMap.set(w, { wallet: w, validatedCount: 0, pendingCount: 0, rejectedCount: 0, badge: null });
    }
    const entry = walletMap.get(w)!;
    if (flag.status === "VerifiedSuspicious") entry.validatedCount++;
    else if (flag.status === "Pending") entry.pendingCount++;
    else if (flag.status === "DismissedAsSpam") entry.rejectedCount++;
  }

  // Attach badge and sort by validated count
  const leaderboard: WatchdogEntry[] = Array.from(walletMap.values())
    .map((e) => ({ ...e, badge: getBadgeTier(e.wallet) }))
    .sort((a, b) => b.validatedCount - a.validatedCount)
    .filter((e) => e.validatedCount > 0 || e.pendingCount > 0);

  return (
    <div className="container py-12 max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Trophy className="h-5 w-5 text-ink" />
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Community</p>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-3">
        Watchdog leaderboard
      </h1>
      <p className="text-muted max-w-2xl mb-10">
        Citizens ranked by validated flags. Every confirmed concern earns a badge point —
        higher ranks carry more weight in the verification process.
      </p>

      {/* Badge tier legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {BADGE_TIERS.map((tier) => (
          <div key={tier.name} className="border border-sand rounded-md p-3 bg-surface text-center">
            <div className="text-2xl mb-1">{tier.emoji}</div>
            <div className={`text-xs font-medium ${tier.colorClass}`}>{tier.name}</div>
            <div className="text-[11px] text-muted mt-0.5">{tier.minFlags}+ flags · {tier.votingWeight}× vote</div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 ? (
        <div className="border border-dashed border-sand rounded-md p-12 text-center">
          <p className="text-muted">No flaggers yet — be the first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, idx) => {
            return (
              <div
                key={entry.wallet}
                className="flex items-center gap-4 p-4 rounded-md border border-sand/60 bg-paper transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  <span className="text-sm font-mono text-muted">#{idx + 1}</span>
                </div>

                {/* Badge emoji */}
                <div className="text-2xl shrink-0 w-8 text-center">
                  {entry.badge ? entry.badge.emoji : <span className="text-muted/30 text-base">—</span>}
                </div>

                {/* Wallet + badge name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm text-ink">{truncateAddress(entry.wallet)}</span>
                    {entry.badge && (
                      <span className={`text-xs font-medium ${entry.badge.colorClass}`}>
                        {entry.badge.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                    <span className="text-forest font-medium">
                      {entry.validatedCount} validated
                    </span>
                    {entry.pendingCount > 0 && (
                      <span>{entry.pendingCount} pending</span>
                    )}
                    {entry.rejectedCount > 0 && (
                      <span>{entry.rejectedCount} rejected</span>
                    )}
                  </div>
                </div>

                {/* Voting weight */}
                <div className="shrink-0 text-right">
                  <div className={`text-sm font-medium ${entry.badge ? entry.badge.colorClass : "text-muted"}`}>
                    {entry.badge ? `${entry.badge.votingWeight}×` : "1×"}
                  </div>
                  <div className="text-[10px] text-muted">vote weight</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
