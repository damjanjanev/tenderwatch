"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tender } from "@/lib/tenders";
import { formatEUR, formatDate } from "@/lib/utils";
import { useTenderFlags } from "@/lib/store";
import { Flag } from "lucide-react";

export function TenderCard({ tender }: { tender: Tender }) {
  const flags = useTenderFlags(tender.id);
  const hasVerified = flags.some((f) => f.status === "VerifiedSuspicious");

  return (
    <Link href={`/tenders/${tender.id}`} className="block group animate-fade-in">
      <Card className="h-full p-6 transition-all hover:border-ink/30 hover:shadow-sm flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="outline" className="font-mono normal-case tracking-normal">
            {tender.id}
          </Badge>
          {hasVerified && <Badge variant="suspicious">Verified Suspicious</Badge>}
        </div>
        <h3 className="font-serif text-xl leading-snug tracking-tight mb-3 group-hover:underline underline-offset-4 decoration-1">
          {tender.title}
        </h3>
        <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">
          {tender.description}
        </p>
        <div className="flex items-end justify-between pt-3 border-t border-sand">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider mb-1">Amount</div>
            <div className="font-mono text-lg font-tabular">{formatEUR(tender.amountEUR)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted mb-1">{tender.ministry}</div>
            <div className="text-xs text-muted">{formatDate(tender.publishedAt)}</div>
          </div>
        </div>
        {flags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-sand flex items-center gap-2 text-xs text-muted">
            <Flag className="h-3 w-3" />
            <span>
              {flags.length} flag{flags.length === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}
