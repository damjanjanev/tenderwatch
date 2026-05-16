"use client";

import { getBadgeTier, getNextBadgeTier, getValidatedFlagCount, BADGE_TIERS } from "@/lib/store";

interface BadgeDisplayProps {
  walletAddress: string;
  compact?: boolean;
}

export function BadgeDisplay({ walletAddress, compact = false }: BadgeDisplayProps) {
  const count = getValidatedFlagCount(walletAddress);
  const current = getBadgeTier(walletAddress);
  const next = getNextBadgeTier(walletAddress);

  if (compact) {
    if (!current) return null;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-sand/60 border border-sand">
        {current.emoji} {current.name}
      </span>
    );
  }

  const progressMin = current ? current.minFlags : 0;
  const progressMax = next ? next.minFlags : (current?.minFlags ?? 10);
  const progress = next
    ? Math.min(100, ((count - progressMin) / (progressMax - progressMin)) * 100)
    : 100;

  return (
    <div className="border border-sand rounded-md p-5 bg-surface space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Your Watchdog Rank</p>
        {current && (
          <span className={`text-xs font-medium ${current.colorClass}`}>
            {current.votingWeight}× voting weight
          </span>
        )}
      </div>

      {current ? (
        <div className="flex items-center gap-3">
          <span className="text-4xl">{current.emoji}</span>
          <div>
            <p className={`font-serif text-xl font-medium ${current.colorClass}`}>{current.name}</p>
            <p className="text-xs text-muted">{count} validated flag{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-4xl opacity-30">🏅</span>
          <div>
            <p className="font-serif text-xl text-muted">No badge yet</p>
            <p className="text-xs text-muted">{count} validated flag{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {next && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>{count} / {next.minFlags} flags to {next.emoji} {next.name}</span>
            <span>{next.minFlags - count} more</span>
          </div>
          <div className="h-1.5 bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!next && current && (
        <p className="text-xs text-muted italic">Maximum rank achieved — your vote carries {current.votingWeight}× weight.</p>
      )}

      <div className="grid grid-cols-4 gap-2 pt-1">
        {BADGE_TIERS.map((tier) => {
          const earned = count >= tier.minFlags;
          return (
            <div key={tier.name} className={`text-center p-2 rounded border ${earned ? "border-sand bg-sand/30" : "border-sand/30 opacity-40"}`}>
              <div className="text-xl mb-0.5">{tier.emoji}</div>
              <div className="text-[10px] leading-tight text-muted">{tier.name}</div>
              <div className="text-[10px] text-muted/70">{tier.minFlags}+ flags</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
