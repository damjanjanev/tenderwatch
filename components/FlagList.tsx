"use client";

import { Shield, Search, Scale, Award, LucideIcon, Link2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { FlagRecord } from "@/lib/store";
import { getBadgeTier } from "@/lib/store";
import { truncateAddress, relativeTime, explorerTx, explorerAddress } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield, search: Search, scale: Scale, award: Award,
};

export function FlagList({ flags }: { flags: FlagRecord[] }) {
  if (flags.length === 0) {
    return (
      <div className="border border-dashed border-sand rounded-sm p-8 text-center">
        <p className="text-muted text-sm">
          No flags yet. Be the first to surface a concern about this tender.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flags.map((f) => {
        const flaggerBadge = getBadgeTier(f.flaggerWallet);
        const BadgeIcon    = flaggerBadge ? ICON_MAP[flaggerBadge.icon] : null;
        return (
          <article key={f.id} className="border-l-2 border-sand pl-5 py-2 animate-fade-in">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {f.category && (
                  <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-sm bg-surface border border-sand text-muted font-medium uppercase tracking-wide">
                    {f.category}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">{relativeTime(f.createdAt)}</span>
            </div>

            <p className="text-sm leading-relaxed mb-3 text-ink/85 break-words">
              &ldquo;{f.reasonText}&rdquo;
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <a
                href={explorerAddress(f.flaggerWallet)}
                target="_blank"
                rel="noreferrer"
                className="font-mono hover:text-ink inline-flex items-center gap-1.5"
              >
                {truncateAddress(f.flaggerWallet)}
                {flaggerBadge && BadgeIcon && (
                  <BadgeIcon className={`h-3 w-3 ${flaggerBadge.colorClass}`} />
                )}
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href={explorerTx(f.txSignature)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink inline-flex items-center gap-1"
              >
                On-chain record <ExternalLink className="h-3 w-3" />
              </a>
              {f.evidenceUrl && (
                <a
                  href={f.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink inline-flex items-center gap-1"
                >
                  <Link2 className="h-3 w-3" /> Evidence <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
