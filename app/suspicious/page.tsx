"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useHasMounted } from "@/lib/store";
import { useAllTenderReports, getTenderReportStatus } from "@/lib/tenderReports";
import { getTender } from "@/lib/tenders";
import { formatEUR } from "@/lib/utils";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

// Group reports by tenderId and compute status per tender
function useTenderStatuses() {
  const allReports = useAllTenderReports();

  // Build a map: tenderId → TenderReport[]
  const byTender = new Map<string, typeof allReports>();
  for (const report of allReports) {
    const list = byTender.get(report.tenderId) ?? [];
    list.push(report);
    byTender.set(report.tenderId, list);
  }

  const suspicious: string[] = [];
  const underReview: string[] = [];
  const clean: string[] = [];

  for (const [tenderId, reports] of byTender.entries()) {
    const status = getTenderReportStatus(reports);
    if (status === "VerifiedSuspicious") suspicious.push(tenderId);
    else if (status === "UnderReview")   underReview.push(tenderId);
    else if (status === "Clean")         clean.push(tenderId);
  }

  return { suspicious, underReview, clean };
}

export default function SuspiciousPage() {
  const mounted = useHasMounted();
  const { suspicious, underReview, clean } = useTenderStatuses();

  return (
    <div className="container py-12 max-w-4xl animate-fade-in">
      {/* ── Verified Suspicious ─────────────────────────────────────────── */}
      <p className="text-xs uppercase tracking-[0.25em] text-muted mb-3">
        Verified suspicious tenders
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-3">
        Confirmed concerns
      </h1>
      <p className="text-muted max-w-2xl mb-10">
        Tenders where a majority of independent journalist reports confirm irregularities.
        Status is determined by the collective findings — not a single reviewer.
      </p>

      {!mounted ? null : suspicious.length === 0 ? (
        <div className="border border-dashed border-sand rounded-md p-12 text-center mb-16">
          <p className="text-muted mb-4">
            No tenders have been verified as suspicious yet.
          </p>
          <Link href="/tenders" className="text-ink underline underline-offset-4">
            Browse tenders
          </Link>
        </div>
      ) : (
        <div className="space-y-6 mb-16">
          {suspicious.map((tenderId) => {
            const tender = getTender(tenderId);
            if (!tender) return null;
            return (
              <article key={tenderId} className="pb-6 border-b border-sand">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="suspicious">Verified Suspicious</Badge>
                </div>
                <Link href={`/tenders/${tenderId}`} className="block group">
                  <h2 className="font-serif text-2xl md:text-3xl leading-tight tracking-tight mb-2 group-hover:underline underline-offset-4 decoration-1">
                    {tender.title}
                  </h2>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
                  <span className="font-mono">{formatEUR(tender.amountEUR)}</span>
                  <span>·</span>
                  <span>{tender.ministry}</span>
                  <span>·</span>
                  <span>{tender.contractor}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Under Review ─────────────────────────────────────────────────── */}
      <div className="border-t border-sand pt-12 mb-16">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-accent" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Under review
          </p>
        </div>
        <h2 className="font-serif text-3xl tracking-tight mb-3">
          Journalist investigation in progress
        </h2>
        <p className="text-muted max-w-2xl mb-8">
          These tenders have 1–2 journalist reports — one more report with a majority
          conclusion will determine their final status.
        </p>

        {!mounted ? null : underReview.length === 0 ? (
          <div className="border border-dashed border-sand rounded-md p-12 text-center">
            <p className="text-muted">No tenders under review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {underReview.map((tenderId) => {
              const tender = getTender(tenderId);
              if (!tender) return null;
              return (
                <article key={tenderId} className="border border-sand rounded-sm p-5 bg-surface">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="pending">Under Review</Badge>
                  </div>
                  <Link href={`/tenders/${tenderId}`} className="block group">
                    <h3 className="font-serif text-xl leading-tight tracking-tight mb-2 group-hover:underline underline-offset-4 decoration-1">
                      {tender.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="font-mono">{formatEUR(tender.amountEUR)}</span>
                    <span>·</span>
                    <span>{tender.ministry}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Clean ────────────────────────────────────────────────────────── */}
      <div className="border-t border-sand pt-12">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-muted" />
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Cleared
          </p>
        </div>
        <h2 className="font-serif text-3xl tracking-tight mb-3">
          No irregularities found
        </h2>
        <p className="text-muted max-w-2xl mb-8">
          Journalists reviewed these tenders and found them to be procedurally sound.
        </p>

        {!mounted ? null : clean.length === 0 ? (
          <div className="border border-dashed border-sand rounded-md p-12 text-center">
            <p className="text-muted">No tenders cleared yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clean.map((tenderId) => {
              const tender = getTender(tenderId);
              if (!tender) return null;
              return (
                <article key={tenderId} className="border border-sand/60 rounded-sm p-5 bg-surface/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-sm border border-sand text-muted font-medium uppercase tracking-wide">
                      Clean
                    </span>
                  </div>
                  <Link href={`/tenders/${tenderId}`} className="block group">
                    <h3 className="font-serif text-xl leading-tight tracking-tight mb-2 group-hover:underline underline-offset-4 decoration-1">
                      {tender.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="font-mono">{formatEUR(tender.amountEUR)}</span>
                    <span>·</span>
                    <span>{tender.ministry}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
