"use client";

import { Shield, Search, Scale, Award, LucideIcon, Trophy } from "lucide-react";
import { useFlags, useHasMounted, getBadgeTier, BADGE_TIERS } from "@/lib/store";
import { truncateAddress } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield, search: Search, scale: Scale, award: Award,
};

type WatchdogEntry = {
  wallet: string;
  validatedCount: number;
  pendingCount: number;
  rejectedCount: number;
  badge: ReturnType<typeof getBadgeTier>;
};

export default function LeaderboardPage() {
  const mounted = useHasMounted();
  const flags   = useFlags();

  if (!mounted) return null;

  const walletMap = new Map<string, WatchdogEntry>();
  for (const flag of flags) {
    const w = flag.flaggerWallet;
    if (!walletMap.has(w)) {
      walletMap.set(w, { wallet: w, validatedCount: 0, pendingCount: 0, rejectedCount: 0, badge: null });
    }
    const entry = walletMap.get(w)!;
    if (flag.status === "VerifiedSuspicious")  entry.validatedCount++;
    else if (flag.status === "Pending")         entry.pendingCount++;
    else if (flag.status === "DismissedAsSpam") entry.rejectedCount++;
  }

  const leaderboard: WatchdogEntry[] = Array.from(walletMap.values())
    .map((e) => ({ ...e, badge: getBadgeTier(e.wallet) }))
    .sort((a, b) => b.validatedCount - a.validatedCount)
    .filter((e) => e.validatedCount > 0 || e.pendingCount > 0);

  return (
    <div className="container py-12 max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <Trophy className="h-4 w-4 text-muted" />
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold">Community</p>
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
        Watchdog leaderboard
      </h1>
      <p className="text-muted text-sm max-w-xl mb-10 leading-relaxed">
        Citizens ranked by validated flags. Higher ranks carry more weight in the verification process.
      </p>

      {/* Badge tier legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
        {BADGE_TIERS.map((tier) => {
          const Icon = ICON_MAP[tier.icon];
          return (
            <div key={tier.name} className={`border border-sand rounded-sm p-3 ${tier.bgClass}`}>
              <Icon className={`h-4 w-4 mb-2 ${tier.colorClass}`} />
              <div className={`text-xs font-bold ${tier.colorClass}`}>{tier.name}</div>
              <div className="text-[11px] text-muted mt-0.5">{tier.minFlags}+ flags · {tier.votingWeight}× vote</div>
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 ? (
        <div className="border border-dashed border-sand rounded-sm p-12 text-center">
          <p className="text-muted text-sm">No flaggers yet — be the first.</p>
        </div>
      ) : (
        <div className="border border-sand rounded-sm overflow-hidden divide-y divide-sand">
          {leaderboard.map((entry, idx) => {
            const Icon = entry.badge ? ICON_MAP[entry.badge.icon] : null;
            return (
              <div key={entry.wallet} className="flex items-center gap-4 px-4 py-3.5 bg-paper hover:bg-surface transition-colors">
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  <span className="text-xs font-mono font-semibold text-muted">#{idx + 1}</span>
                </div>

                {/* Badge icon */}
                <div className="w-7 shrink-0 flex justify-center">
                  {Icon && entry.badge ? (
                    <div className={`p-1 rounded-sm ${entry.badge.bgClass}`}>
                      <Icon className={`h-3.5 w-3.5 ${entry.badge.colorClass}`} />
                    </div>
                  ) : (
                    <div className="p-1 rounded-sm bg-surface">
                      <Shield className="h-3.5 w-3.5 text-muted/30" />
                    </div>
                  )}
                </div>

                {/* Wallet + tier name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-medium">{truncateAddress(entry.wallet)}</span>
                    {entry.badge && (
                      <span className={`text-[11px] font-semibold ${entry.badge.colorClass}`}>
                        {entry.badge.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                    <span className="font-semibold text-forest">{entry.validatedCount} validated</span>
                    {entry.pendingCount  > 0 && <span>{entry.pendingCount} pending</span>}
                    {entry.rejectedCount > 0 && <span>{entry.rejectedCount} rejected</span>}
                  </div>
                </div>

                {/* Voting weight */}
                <div className="shrink-0 text-right">
                  <div className={`text-sm font-bold ${entry.badge ? entry.badge.colorClass : "text-muted"}`}>
                    {entry.badge ? `${entry.badge.votingWeight}×` : "1×"}
                  </div>
                  <div className="text-[10px] text-muted">weight</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
