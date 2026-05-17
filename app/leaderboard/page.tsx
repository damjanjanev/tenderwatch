"use client";

import { useMemo, useState } from "react";
import {
  Shield, Search, Scale, Award, LucideIcon,
  Trophy, ThumbsUp, FileText, Star, CheckCircle, Newspaper,
} from "lucide-react";
import { useFlags, useHasMounted, getBadgeTier, BADGE_TIERS } from "@/lib/store";
import { useAllTenderReports, getJournalistStats } from "@/lib/tenderReports";
import {
  TOKEN_TICKER, TOKENS_PER_ACCURATE_FLAG, TOKEN_LEVELS,
  buildReportsByTender, getAccurateFlagCount, getCitizenPoints,
} from "@/lib/points";
import { truncateAddress } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield, search: Search, scale: Scale, award: Award,
};

type Tab = "citizens" | "journalists";

// ── Token pill ────────────────────────────────────────────────────────────────

function TokenPill({ tokens }: { tokens: number }) {
  if (tokens === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-sm border border-accent/40 bg-accent/10 text-accent font-mono">
      {tokens} {TOKEN_TICKER}
    </span>
  );
}

// ── Citizens leaderboard ──────────────────────────────────────────────────────

function CitizensTab() {
  const flags      = useFlags();
  const allReports = useAllTenderReports();

  const leaderboard = useMemo(() => {
    const reportsByTender = buildReportsByTender(allReports);
    const walletSet = new Set(flags.map((f) => f.flaggerWallet));

    return Array.from(walletSet)
      .map((wallet) => {
        const flagCount     = flags.filter((f) => f.flaggerWallet === wallet).length;
        const accurateCount = getAccurateFlagCount(wallet, flags, reportsByTender);
        const tokens        = getCitizenPoints(wallet, flags, reportsByTender);
        const badge         = getBadgeTier(wallet);
        return { wallet, flagCount, accurateCount, tokens, badge };
      })
      .sort((a, b) => b.tokens - a.tokens || b.flagCount - a.flagCount);
  }, [flags, allReports]);

  return (
    <div>
      {/* Token info card */}
      <div className="rounded-xl border border-white/[0.06] p-5 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-4">
          How to earn {TOKEN_TICKER} tokens
        </p>
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-ink leading-relaxed">
            Every flag you submit on a tender that journalists later confirm as{" "}
            <span className="text-oxblood font-semibold">Verified Suspicious</span> earns you{" "}
            <span className="font-black text-accent">{TOKENS_PER_ACCURATE_FLAG} {TOKEN_TICKER}</span>.
            Tokens are recorded on Solana as proof of civic contribution.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-sand">
          {TOKEN_LEVELS.map((level) => (
            <div key={level.name} className="text-center">
              <div className={`text-sm font-bold ${level.colorClass}`}>{level.name}</div>
              <div className="font-mono text-xs text-muted mt-0.5">{level.minTokens}+ {TOKEN_TICKER}</div>
              <div className="text-[11px] text-muted/70 mt-0.5">{level.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Watchdog badge legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-10">
        {BADGE_TIERS.map((tier) => {
          const Icon = ICON_MAP[tier.icon];
          return (
            <div key={tier.name} className={`border border-sand rounded-sm p-3 ${tier.bgClass}`}>
              <Icon className={`h-4 w-4 mb-2 ${tier.colorClass}`} />
              <div className={`text-xs font-bold ${tier.colorClass}`}>{tier.name}</div>
              <div className="text-[11px] text-muted mt-0.5">
                {tier.minFlags}+ flags · {tier.votingWeight}× vote weight
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <p className="text-white/40 text-sm">No citizen flaggers yet — be the first.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
          {leaderboard.map((entry, idx) => {
            const BadgeIcon = entry.badge ? ICON_MAP[entry.badge.icon] : null;
            return (
              <div
                key={entry.wallet}
                className="px-4 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    <span className="text-xs font-mono font-semibold text-muted">#{idx + 1}</span>
                  </div>

                  {/* Watchdog badge icon */}
                  <div className="w-7 shrink-0 flex justify-center">
                    {BadgeIcon && entry.badge ? (
                      <div className={`p-1 rounded-sm ${entry.badge.bgClass}`}>
                        <BadgeIcon className={`h-3.5 w-3.5 ${entry.badge.colorClass}`} />
                      </div>
                    ) : (
                      <div className="p-1 rounded-sm bg-surface">
                        <Shield className="h-3.5 w-3.5 text-muted/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-sm font-medium">{truncateAddress(entry.wallet)}</span>
                      {entry.badge && (
                        <span className={`text-[11px] font-semibold ${entry.badge.colorClass}`}>
                          {entry.badge.name}
                        </span>
                      )}
                      <TokenPill tokens={entry.tokens} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                      <span>{entry.flagCount} flags submitted</span>
                      {entry.accurateCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-accent font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          {entry.accurateCount} hit suspicious
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Token balance */}
                  <div className="shrink-0 text-right">
                    <div className={`text-base font-black tabular-nums font-mono ${entry.tokens > 0 ? "text-accent" : "text-muted"}`}>
                      {entry.tokens}
                    </div>
                    <div className="text-[10px] text-muted uppercase tracking-wider">
                      {TOKEN_TICKER}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Journalists leaderboard ───────────────────────────────────────────────────

function JournalistsTab() {
  const allReports = useAllTenderReports();

  const leaderboard = useMemo(() => {
    const walletSet = new Set(allReports.map((r) => r.journalistWallet));
    return Array.from(walletSet)
      .map((wallet) => ({ wallet, ...getJournalistStats(wallet) }))
      .sort((a, b) => b.credibilityScore - a.credibilityScore);
  }, [allReports]);

  const maxScore = leaderboard[0]?.credibilityScore ?? 1;

  return (
    <div>
      {/* Scoring explanation */}
      <div className="rounded-xl border border-white/[0.06] p-5 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-4">
          How credibility is scored
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-ink">+1 per report</div>
              <div className="text-xs text-muted">Every published tender report</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ThumbsUp className="h-4 w-4 text-muted shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-ink">+1 per 5 likes</div>
              <div className="text-xs text-muted">Likes received across all reports</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-ink">+2 per accurate call</div>
              <div className="text-xs text-muted">When your conclusion matched the final verdict</div>
            </div>
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <Newspaper className="h-6 w-6 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No journalist reports yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
          {leaderboard.map((entry, idx) => {
            const pct = maxScore > 0 ? (entry.credibilityScore / maxScore) * 100 : 0;
            const isTopThree = idx < 3;

            return (
              <div
                key={entry.wallet}
                className="px-5 py-4 transition-colors hover:bg-white/[0.02]"
                style={isTopThree ? { background: "rgba(0,132,255,0.03)" } : undefined}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-8 shrink-0 text-center">
                    <span className="text-xs font-mono font-semibold text-muted">#{idx + 1}</span>
                  </div>

                  {/* Info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-mono text-sm font-medium">{truncateAddress(entry.wallet)}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <FileText className="h-3 w-3" />
                        {entry.reportCount} report{entry.reportCount !== 1 ? "s" : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <ThumbsUp className="h-3 w-3" />
                        {entry.totalLikes} likes
                      </span>
                      {entry.accurateCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          {entry.accurateCount} accurate
                        </span>
                      )}
                    </div>
                    {/* Score bar */}
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full bg-[#0084ff] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Star className="h-3.5 w-3.5 text-accent fill-accent" />
                      <span className="text-base font-black tabular-nums text-accent">
                        {entry.credibilityScore}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted">credibility</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const mounted = useHasMounted();
  const [tab, setTab] = useState<Tab>("citizens");

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-4 w-4 text-[#0084ff]" />
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium">Community</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">Leaderboard</h1>
        <p className="text-[#b8b8b8] text-sm max-w-xl mb-8 leading-relaxed">
          Citizens earn <span className="font-semibold text-[#0084ff]">{TOKEN_TICKER}</span> tokens by flagging tenders that journalists later confirm as suspicious.
          Journalists are ranked by credibility — a composite of reports, likes, and accuracy.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-white/[0.06]">
          <button onClick={() => setTab("citizens")}
            className={["px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === "citizens" ? "border-[#0084ff] text-white" : "border-transparent text-white/40 hover:text-white",
            ].join(" ")}>
            🏛 Citizens
          </button>
          <button onClick={() => setTab("journalists")}
            className={["px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === "journalists" ? "border-[#0084ff] text-white" : "border-transparent text-white/40 hover:text-white",
            ].join(" ")}>
            📰 Journalists
          </button>
        </div>

        {tab === "citizens" ? <CitizensTab /> : <JournalistsTab />}
      </div>
    </div>
  );
}
