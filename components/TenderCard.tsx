"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tender } from "@/lib/tenders";
import { formatEUR, formatDate } from "@/lib/utils";
import { useTenderFlags } from "@/lib/store";
import { Flag } from "lucide-react";

export function TenderCard({ tender }: { tender: Tender }) {
  const flags      = useTenderFlags(tender.id);
  const hasVerified = flags.some((f) => f.status === "VerifiedSuspicious");
  const hasPending  = !hasVerified && flags.some((f) => f.status === "Pending");

  return (
    <Link href={`/tenders/${tender.id}`} className="block group animate-fade-in">
      <div className="h-full border border-sand bg-surface hover:border-ink/40 transition-colors flex flex-col rounded-sm">
        {/* Status stripe */}
        {(hasVerified || hasPending) && (
          <div className={`h-0.5 w-full rounded-t-sm ${hasVerified ? "bg-oxblood" : "bg-accent"}`} />
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="font-mono text-[11px] text-muted">{tender.id}</span>
            {hasVerified && <Badge variant="suspicious">Suspicious</Badge>}
            {hasPending  && <Badge variant="pending">Flagged</Badge>}
          </div>

          <h3 className="text-sm font-bold leading-snug tracking-tight mb-3 group-hover:text-muted transition-colors flex-1">
            {tender.title}
          </h3>

          <p className="text-xs text-muted line-clamp-2 mb-4">
            {tender.description}
          </p>

          <div className="flex items-end justify-between pt-3 border-t border-sand mt-auto">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Amount</div>
              <div className="font-mono text-base font-bold tabular-nums">{formatEUR(tender.amountEUR)}</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-muted">{tender.ministry}</div>
              <div className="text-[11px] text-muted font-mono">{formatDate(tender.publishedAt)}</div>
            </div>
          </div>

          {flags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-sand flex items-center gap-1.5 text-[11px] text-muted">
              <Flag className="h-3 w-3" />
              <span>{flags.length} flag{flags.length === 1 ? "" : "s"}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
