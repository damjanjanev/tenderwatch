"use client";

import { Shield, Search, Scale, Award, LucideIcon } from "lucide-react";
import { getBadgeTier, getNextBadgeTier, getValidatedFlagCount, BADGE_TIERS } from "@/lib/store";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield,
  search: Search,
  scale:  Scale,
  award:  Award,
};

interface BadgeDisplayProps {
  walletAddress: string;
  compact?: boolean;
}

export function BadgeDisplay({ walletAddress, compact = false }: BadgeDisplayProps) {
  const count   = getValidatedFlagCount(walletAddress);
  const current = getBadgeTier(walletAddress);
  const next    = getNextBadgeTier(walletAddress);

  if (compact) {
    if (!current) return null;
    const Icon = ICON_MAP[current.icon];
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-sm border ${current.bgClass} ${current.colorClass} border-current/20`}>
        <Icon className="h-3 w-3" />
        {current.name}
      </span>
    );
  }

  const progressMin = current ? current.minFlags : 0;
  const progressMax = next ? next.minFlags : (current?.minFlags ?? 10);
  const progress    = next
    ? Math.min(100, ((count - progressMin) / (progressMax - progressMin)) * 100)
    : 100;

  const CurrentIcon = current ? ICON_MAP[current.icon] : null;

  return (
    <div className="border border-sand rounded-sm p-5 bg-surface space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted font-medium">
          Your Watchdog Rank
        </p>
        {current && (
          <span className={`text-xs font-semibold ${current.colorClass}`}>
            {current.votingWeight}× voting weight
          </span>
        )}
      </div>

      {current && CurrentIcon ? (
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-sm ${current.bgClass}`}>
            <CurrentIcon className={`h-6 w-6 ${current.colorClass}`} />
          </div>
          <div>
            <p className={`text-xl font-bold tracking-tight ${current.colorClass}`}>{current.name}</p>
            <p className="text-xs text-muted mt-0.5">{count} validated flag{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-sm bg-sand/50">
            <Shield className="h-6 w-6 text-muted/40" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-muted">No badge yet</p>
            <p className="text-xs text-muted mt-0.5">{count} validated flag{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}

      {next && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted">
            <span>{count} / {next.minFlags} flags to {next.name}</span>
            <span>{next.minFlags - count} more</span>
          </div>
          <div className="h-1 bg-sand rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!next && current && (
        <p className="text-xs text-muted">
          Maximum rank — your vote carries {current.votingWeight}× weight.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 pt-1">
        {BADGE_TIERS.map((tier) => {
          const earned = count >= tier.minFlags;
          const TierIcon = ICON_MAP[tier.icon];
          return (
            <div
              key={tier.name}
              className={`text-center p-2.5 rounded-sm border transition-colors ${
                earned
                  ? `${tier.bgClass} border-current/10`
                  : "border-sand/50 opacity-35"
              }`}
            >
              <TierIcon className={`h-4 w-4 mx-auto mb-1 ${earned ? tier.colorClass : "text-muted"}`} />
              <div className="text-[10px] leading-tight text-muted font-medium">{tier.name.split(" ")[0]}</div>
              <div className="text-[10px] text-muted/70">{tier.minFlags}+</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
