"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlagModal } from "@/components/FlagModal";
import { FlagList } from "@/components/FlagList";
import { TenderReportSection } from "@/components/TenderReportSection";
import { TENDERS, getTender, type Tender } from "@/lib/tenders";
import { PROFILES, getProfilesForContractor } from "@/lib/profiles";
import { useTenderFlags } from "@/lib/store";
import { useTenderReports, getTenderReportStatus } from "@/lib/tenderReports";
import { formatEUR, formatDate } from "@/lib/utils";
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// AI Suspicion Score
// ---------------------------------------------------------------------------

type SuspicionSignal = {
  label: string;
  points: number;
};

type AISuspicionResult = {
  score: number;
  signals: SuspicionSignal[];
};

function computeAISuspicionScore(
  tender: Tender,
  reportStatus: "NoReview" | "UnderReview" | "VerifiedSuspicious" | "Clean",
  citizenFlagCount: number
): AISuspicionResult {
  const signals: SuspicionSignal[] = [];

  if (tender.amountEUR > 2_000_000) {
    const contractorCount = TENDERS.filter(
      (t) => t.contractor.toLowerCase() === tender.contractor.toLowerCase()
    ).length;
    if (contractorCount >= 2) {
      signals.push({ label: "Price outlier: high-value contractor with multiple awards", points: 25 });
    }
  }

  const hasPoliticalLink = PROFILES.some((p) =>
    p.companies.some(
      (c) => c.companyName.toLowerCase() === tender.contractor.toLowerCase()
    )
  );
  if (hasPoliticalLink) {
    signals.push({ label: "Contractor linked to a political profile", points: 30 });
  }

  if (reportStatus === "VerifiedSuspicious") {
    signals.push({ label: "Verified suspicious by journalist reports", points: 20 });
  }

  if (reportStatus === "UnderReview") {
    signals.push({ label: "Currently under journalist review", points: 10 });
  }

  const cappedFlags = Math.min(citizenFlagCount, 3);
  if (cappedFlags > 0) {
    signals.push({
      label: `${citizenFlagCount} community flag${citizenFlagCount !== 1 ? "s" : ""} submitted`,
      points: cappedFlags * 5,
    });
  }

  const singleBidderPattern = /single|direct|no competitive/i;
  if (singleBidderPattern.test(tender.description)) {
    signals.push({ label: "Description indicates single/direct award", points: 10 });
  }

  const rawScore = signals.reduce((sum, s) => sum + s.points, 0);
  const score = Math.min(100, Math.max(0, rawScore));

  return { score, signals };
}

function ScoreGauge({ score }: { score: number }) {
  const isLow      = score <= 30;
  const isModerate = score > 30 && score <= 60;
  const isHigh     = score > 60;

  const barColor   = isHigh ? "bg-red-500"     : isModerate ? "bg-amber-500"    : "bg-emerald-500";
  const labelColor = isHigh ? "text-red-400"   : isModerate ? "text-amber-400"  : "text-emerald-400";
  const label      = isHigh ? "High risk"      : isModerate ? "Moderate risk"   : "Low risk";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={`font-semibold ${labelColor}`}>{label}</span>
        <span className={`font-mono font-bold text-lg ${labelColor}`}>{score}/100</span>
      </div>
      <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Related Tenders
// ---------------------------------------------------------------------------

function RelatedTenders({ tender }: { tender: Tender }) {
  const contractorMatches = TENDERS.filter(
    (t) => t.id !== tender.id && t.contractor.toLowerCase() === tender.contractor.toLowerCase()
  );
  const ministryMatches = TENDERS.filter(
    (t) => t.id !== tender.id && t.ministry === tender.ministry && !contractorMatches.some((c) => c.id === t.id)
  );

  const related = [...contractorMatches, ...ministryMatches].slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="text-2xl font-light tracking-tight text-white mb-6">Related tenders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((t) => {
          const isContractorMatch = t.contractor.toLowerCase() === tender.contractor.toLowerCase();
          return (
            <Link
              key={t.id}
              href={`/tenders/${t.id}`}
              className="block rounded-xl border border-white/[0.06] p-4 hover:border-[#0084ff]/30 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs text-white/40">{t.id}</span>
                {isContractorMatch && (
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-white/[0.06] text-white/40 font-medium">
                    Same contractor
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-white/80 leading-snug line-clamp-2 mb-2 group-hover:text-white transition-colors">
                {t.title}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-[#0084ff]">{formatEUR(t.amountEUR)}</span>
                <span className="text-xs text-white/40 truncate max-w-[140px] text-right">{t.ministry}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TenderDetailPage() {
  const params  = useParams<{ id: string }>();
  const tender  = getTender(params.id);
  const flags   = useTenderFlags(params.id);
  const reports = useTenderReports(params.id);
  const status  = getTenderReportStatus(reports);

  if (!tender) return notFound();

  const linkedProfiles = getProfilesForContractor(tender.contractor);
  const aiResult = computeAISuspicionScore(tender, status, flags.length);

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">

        <Link
          href="/tenders"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all tenders
        </Link>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className="font-mono normal-case tracking-normal border-white/[0.12] text-white/50">
            {tender.id}
          </Badge>
          <span className="text-xs px-2 py-0.5 rounded-md border border-[#0084ff]/30 bg-[#0084ff]/10 text-[#0084ff] font-medium">
            {tender.ministry}
          </span>
          {status === "VerifiedSuspicious" && <Badge variant="suspicious">Verified Suspicious</Badge>}
          {status === "UnderReview"        && <Badge variant="pending">Under Review</Badge>}
          {status === "Clean"              && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium">
              <CheckCircle className="h-3 w-3" /> Clean
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight text-white mb-6">
          {tender.title}
        </h1>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-white/[0.06]">
          <Meta label="Amount"    value={formatEUR(tender.amountEUR)} mono />
          <Meta label="Contractor" value={tender.contractor} />
          <Meta label="Published" value={formatDate(tender.publishedAt)} />
          <Meta label="Deadline"  value={formatDate(tender.deadline)} />
        </div>

        {/* Political link banner */}
        {linkedProfiles.length > 0 && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">
                This contractor is connected to a political profile
              </p>
              <div className="space-y-0.5">
                {linkedProfiles.map((profile) => {
                  const link = profile.companies.find(
                    (c) => c.companyName.toLowerCase() === tender.contractor.toLowerCase()
                  );
                  return (
                    <p key={profile.slug} className="text-xs text-white/50">
                      <Link href={`/profiles/${profile.slug}`} className="text-red-400 hover:underline font-semibold">
                        {profile.fullName}
                      </Link>
                      {" "}({profile.position})
                      {link && ` — ${link.relation}${link.relatedName ? ` (${link.relatedName})` : ""}`}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <article className="text-base leading-relaxed text-white/70 mb-10">
          {tender.description}
        </article>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-12">
          <FlagModal tenderId={tender.id} />
          <Button asChild variant="outline" className="border-white/[0.12] text-white/60 hover:text-white hover:border-white/30 bg-transparent">
            <a href={tender.sourceUrl} target="_blank" rel="noreferrer">
              Original source <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        {/* AI Suspicion Assessment */}
        <div className="rounded-xl border border-white/[0.06] p-6 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-4">AI Suspicion Assessment</p>
          <ScoreGauge score={aiResult.score} />
          {aiResult.signals.length > 0 ? (
            <ul className="mt-4 space-y-1.5">
              {aiResult.signals.map((signal) => (
                <li key={signal.label} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="mt-0.5 text-red-400 shrink-0">•</span>
                  <span>
                    {signal.label}{" "}
                    <span className="text-white/30 font-mono text-xs">(+{signal.points} pts)</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-white/40">No risk signals detected.</p>
          )}
          <p className="mt-5 text-xs text-white/20 border-t border-white/[0.06] pt-4">
            This rating is heuristic, not legal assessment.
          </p>
        </div>

        {/* Journalist Reports */}
        <TenderReportSection tenderId={tender.id} />

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-2" />

        {/* Community Flags */}
        <section className="py-10">
          <h2 className="text-2xl font-light tracking-tight text-white mb-6">
            Community flags ({flags.length})
          </h2>
          <FlagList flags={flags} />
        </section>

        {/* Divider */}
        <div className="border-t border-white/[0.06] my-2" />

        {/* Related Tenders */}
        <RelatedTenders tender={tender} />
      </div>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-white/30 mb-1">{label}</div>
      <div className={`text-white/80 ${mono ? "font-mono text-base font-semibold text-[#0084ff]" : "text-sm"}`}>{value}</div>
    </div>
  );
}
