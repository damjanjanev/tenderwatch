"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tender } from "@/lib/tenders";
import { formatEUR, formatDate } from "@/lib/utils";
import { useTenderFlags } from "@/lib/store";
import { useTenderReports, getTenderReportStatus } from "@/lib/tenderReports";
import { Flag, FileText } from "lucide-react";

export function TenderCard({ tender }: { tender: Tender }) {
  const flags   = useTenderFlags(tender.id);
  const reports = useTenderReports(tender.id);
  const status  = getTenderReportStatus(reports);

  const isVerifiedSuspicious = status === "VerifiedSuspicious";
  const isUnderReview        = status === "UnderReview";
  const isClean              = status === "Clean";

  return (
    <Link href={`/tenders/${tender.id}`} className="block group animate-fade-in">
      <div className={`h-full flex flex-col rounded-sm border transition-all duration-150 bg-surface hover:bg-surface/80
        ${isVerifiedSuspicious
          ? "border-oxblood/50 hover:border-oxblood"
          : "border-sand hover:border-ink/30"
        }`}>

        {/* Top status stripe */}
        {(isVerifiedSuspicious || isUnderReview) && (
          <div className={`h-[3px] w-full rounded-t-sm ${
            isVerifiedSuspicious ? "bg-oxblood" : "bg-accent"
          }`} />
        )}

        <div className="p-5 flex flex-col flex-1 gap-4">

          {/* Header row: ID + badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted tracking-wide">{tender.id}</span>
            {isVerifiedSuspicious && <Badge variant="suspicious">Suspicious</Badge>}
            {isUnderReview        && <Badge variant="pending">Under Review</Badge>}
            {isClean              && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm border border-sand text-muted font-medium uppercase tracking-wider">
                Clean
              </span>
            )}
          </div>

          {/* Title — prominent */}
          <h3 className="text-base font-bold leading-snug tracking-tight group-hover:text-accent transition-colors flex-1">
            {tender.title}
          </h3>

          {/* Description excerpt */}
          <p className="text-[13px] text-muted leading-relaxed line-clamp-2">
            {tender.description}
          </p>

          {/* Footer: amount + ministry/date */}
          <div className="flex items-end justify-between pt-3 border-t border-sand mt-auto">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Amount</div>
              <div className="font-mono text-lg font-black tabular-nums">{formatEUR(tender.amountEUR)}</div>
            </div>
            <div className="text-right">
              <div className="text-[12px] text-muted font-medium truncate max-w-[160px]">{tender.ministry}</div>
              <div className="text-[11px] text-muted/70 font-mono mt-0.5">{formatDate(tender.publishedAt)}</div>
            </div>
          </div>

          {/* Flags / reports row */}
          {(flags.length > 0 || reports.length > 0) && (
            <div className="pt-2.5 border-t border-sand flex items-center gap-3 text-[11px] text-muted">
              {flags.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Flag className="h-3 w-3" />
                  {flags.length} flag{flags.length === 1 ? "" : "s"}
                </span>
              )}
              {reports.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {reports.length} report{reports.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          )}

        </div>
      </div>
    </Link>
  );
}
