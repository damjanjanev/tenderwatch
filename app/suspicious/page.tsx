"use client";

import Link from "next/link";
import { Shield, Search, Scale, Award, LucideIcon, ExternalLink, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { useFlags, useHasMounted, getBadgeTier } from "@/lib/store";
import { getTender } from "@/lib/tenders";
import { formatEUR, relativeTime, explorerTx, truncateAddress } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield, search: Search, scale: Scale, award: Award,
};

export default function SuspiciousPage() {
  const mounted = useHasMounted();
  const flags = useFlags();
  const verified = mounted ? flags.filter((f) => f.status === "VerifiedSuspicious") : [];
  const community = mounted ? flags.filter((f) => f.status === "Pending") : [];

  return (
    <div className="container py-12 max-w-4xl animate-fade-in">
      {/* ── Verified Suspicious ─────────────────────────────────────── */}
      <p className="text-xs uppercase tracking-[0.25em] text-muted mb-3">
        Verified suspicious tenders
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-3">
        Confirmed concerns
      </h1>
      <p className="text-muted max-w-2xl mb-10">
        Tenders that a journalist or NGO verifier has confirmed are worth investigating.
        Every entry links to its permanent on-chain record.
      </p>

      {!mounted ? null : verified.length === 0 ? (
        <div className="border border-dashed border-sand rounded-md p-12 text-center mb-16">
          <p className="text-muted mb-4">
            No tenders have been verified as suspicious yet.
          </p>
          <Link href="/tenders" className="text-ink underline underline-offset-4">
            Browse tenders to flag one
          </Link>
        </div>
      ) : (
        <div className="space-y-8 mb-16">
          {verified.map((flag) => {
            const tender = getTender(flag.tenderId);
            if (!tender) return null;
            const flaggerBadge = getBadgeTier(flag.flaggerWallet);
            return (
              <article key={flag.id} className="pb-8 border-b border-sand">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="suspicious">Verified Suspicious</Badge>
                  {flag.category && (
                    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-sand/50 border border-sand text-ink/70">
                      {flag.category}
                    </span>
                  )}
                  <span className="text-xs text-muted">{relativeTime(flag.createdAt)}</span>
                </div>
                <Link href={`/tenders/${tender.id}`} className="block group">
                  <h2 className="font-serif text-2xl md:text-3xl leading-tight tracking-tight mb-3 group-hover:underline underline-offset-4 decoration-1">
                    {tender.title}
                  </h2>
                </Link>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-4">
                  <span className="font-mono">{formatEUR(tender.amountEUR)}</span>
                  <span>·</span>
                  <span>{tender.ministry}</span>
                  <span>·</span>
                  <span>{tender.contractor}</span>
                </div>
                <p className="font-serif italic text-ink/80 mb-4 leading-relaxed">
                  &ldquo;{flag.reasonText}&rdquo;
                </p>
                {flag.evidenceUrl && (
                  <a
                    href={flag.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink mb-3"
                  >
                    <Link2 className="h-3 w-3" />
                    Evidence
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href={explorerTx(flag.txSignature)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
                  >
                    View on-chain record <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-muted/40 text-xs">·</span>
                  <span className="text-xs text-muted">
                    Flagged by {truncateAddress(flag.flaggerWallet)}
                  </span>
                  {flaggerBadge && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-sand/60 border border-sand">
                      {(() => { const I = ICON_MAP[flaggerBadge.icon]; return <I className={`h-3 w-3 ${flaggerBadge.colorClass}`} />; })()} {flaggerBadge.name}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Community Flagged ────────────────────────────────────────── */}
      <div className="border-t border-sand pt-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted mb-3">
          Community flagged
        </p>
        <h2 className="font-serif text-3xl tracking-tight mb-3">
          Awaiting verification
        </h2>
        <p className="text-muted max-w-2xl mb-8">
          Citizens have raised concerns about these tenders. A journalist or NGO verifier
          will review each one — validated flags earn the flagger a Watchdog badge point.
        </p>

        {!mounted ? null : community.length === 0 ? (
          <div className="border border-dashed border-sand rounded-md p-12 text-center">
            <p className="text-muted mb-4">No community flags pending review.</p>
            <Link href="/tenders" className="text-ink underline underline-offset-4">
              Browse tenders to flag one
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {community.map((flag) => {
              const tender = getTender(flag.tenderId);
              if (!tender) return null;
              const flaggerBadge = getBadgeTier(flag.flaggerWallet);
              return (
                <article key={flag.id} className="border border-sand rounded-md p-5 bg-surface">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="pending">Community Flagged</Badge>
                    {flag.category && (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-sand/50 border border-sand text-ink/70">
                        {flag.category}
                      </span>
                    )}
                    <span className="text-xs text-muted">{relativeTime(flag.createdAt)}</span>
                  </div>
                  <Link href={`/tenders/${tender.id}`} className="block group">
                    <h3 className="font-serif text-xl leading-tight tracking-tight mb-2 group-hover:underline underline-offset-4 decoration-1">
                      {tender.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-3">
                    <span className="font-mono">{formatEUR(tender.amountEUR)}</span>
                    <span>·</span>
                    <span>{tender.ministry}</span>
                  </div>
                  <p className="font-serif italic text-ink/75 text-sm leading-relaxed mb-3 border-l-2 border-sand pl-3">
                    &ldquo;{flag.reasonText.length > 200
                      ? flag.reasonText.slice(0, 197) + "…"
                      : flag.reasonText}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>By {truncateAddress(flag.flaggerWallet)}</span>
                    {flaggerBadge && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-sand/60 border border-sand text-[11px]">
                        {(() => { const I = ICON_MAP[flaggerBadge.icon]; return <I className={`h-3 w-3 ${flaggerBadge.colorClass}`} />; })()} {flaggerBadge.name}
                      </span>
                    )}
                    {flag.evidenceUrl && (
                      <>
                        <span className="text-muted/40">·</span>
                        <a
                          href={flag.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-ink"
                        >
                          Evidence <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
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
