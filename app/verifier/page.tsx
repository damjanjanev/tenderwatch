"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { isVerifier, useHasMounted } from "@/lib/store";
import { useAllTenderReports, getTenderReportStatus, getJournalistStats } from "@/lib/tenderReports";
import { getTender } from "@/lib/tenders";
import { formatEUR, relativeTime, explorerTx, truncateAddress } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, CheckCircle, ThumbsUp, ExternalLink, Link2, Star } from "lucide-react";

export default function VerifierPage() {
  const mounted = useHasMounted();
  const { publicKey, connected } = useWallet();
  const allReports = useAllTenderReports();
  const myAddress = publicKey?.toBase58();
  const verifier = isVerifier(myAddress);

  if (!mounted) return null;
  if (!connected) return <EmptyState title="Journalist dashboard" body="Connect your Phantom wallet to see your reports and credibility score. Journalist access is gated." />;
  if (!verifier) return <EmptyState title="Not a verified journalist" body={`The wallet ${truncateAddress(myAddress ?? "")} is not in the verifier allowlist.`} />;

  const myReports = allReports.filter((r) => r.journalistWallet === myAddress);
  const stats = getJournalistStats(myAddress!);

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-14">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-[#0084ff]" />
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium">Journalist dashboard</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">My reports</h1>
        <p className="text-[#b8b8b8] max-w-2xl mb-8 leading-relaxed">
          Your published tender reports, credibility score, and contribution to the public record.
          Each report you write influences a tender status — reports from multiple journalists determine the final verdict.
        </p>

        {myAddress && <div className="mb-8"><BadgeDisplay walletAddress={myAddress} /></div>}

        <div className="rounded-xl border border-white/[0.06] p-6 mb-10 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Stat label="Reports" value={stats.reportCount} icon={<ShieldCheck className="h-4 w-4 text-white/30" />} />
          <Stat label="Total likes" value={stats.totalLikes} icon={<ThumbsUp className="h-4 w-4 text-white/30" />} />
          <Stat label="Accurate" value={stats.accurateCount} icon={<CheckCircle className="h-4 w-4 text-white/30" />} />
          <Stat label="Credibility" value={stats.credibilityScore} icon={<Star className="h-4 w-4 text-[#0084ff]" />} highlight />
        </div>

        {myReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
            <ShieldCheck className="h-8 w-8 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-4">You have not submitted any reports yet.</p>
            <Link href="/tenders" className="text-[#0084ff] hover:underline underline-offset-4">Browse tenders to report on</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {[...myReports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((report) => {
              const tender = getTender(report.tenderId);
              if (!tender) return null;
              const tenderReports = allReports.filter((r) => r.tenderId === report.tenderId);
              const tenderStatus = getTenderReportStatus(tenderReports);
              const conclusionIsSuspicious = report.conclusion === "Suspicious";
              const accurate = (conclusionIsSuspicious && tenderStatus === "VerifiedSuspicious") || (!conclusionIsSuspicious && tenderStatus === "Clean");
              return (
                <article key={report.id} className="rounded-xl border border-white/[0.06] p-5" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {conclusionIsSuspicious
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 border border-red-500/30 bg-red-500/5 px-2 py-0.5 rounded-md"><AlertTriangle className="h-3 w-3" /> Suspicious</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/40 border border-white/[0.08] px-2 py-0.5 rounded-md"><CheckCircle className="h-3 w-3" /> Not Suspicious</span>
                    }
                    {tenderStatus === "VerifiedSuspicious" && <Badge variant="suspicious">Tender: Verified Suspicious</Badge>}
                    {tenderStatus === "UnderReview" && <Badge variant="pending">Tender: Under Review</Badge>}
                    {tenderStatus === "Clean" && <span className="text-[11px] px-2 py-0.5 rounded-md border border-white/[0.08] text-white/40 font-medium">Tender: Clean</span>}
                    {(tenderStatus === "VerifiedSuspicious" || tenderStatus === "Clean") && (
                      accurate
                        ? <span className="inline-flex items-center gap-1 text-[11px] text-[#0084ff] font-semibold px-1.5 py-0.5 rounded-md bg-[#0084ff]/10 border border-[#0084ff]/30"><CheckCircle className="h-3 w-3" /> Accurate</span>
                        : <span className="inline-flex items-center gap-1 text-[11px] text-white/30 px-1.5 py-0.5 rounded-md border border-white/[0.06]">Inaccurate</span>
                    )}
                    <span className="text-xs text-white/30 ml-auto">{relativeTime(report.createdAt)}</span>
                  </div>
                  <Link href={`/tenders/${report.tenderId}`} className="block group mb-1">
                    <h3 className="text-lg font-light leading-tight tracking-tight text-white group-hover:text-[#0084ff] transition-colors">{tender.title}</h3>
                  </Link>
                  <p className="text-xs text-white/40 font-mono mb-3">{formatEUR(tender.amountEUR)} · {tender.ministry}</p>
                  <p className="text-sm text-white/60 leading-relaxed border-l-2 border-white/[0.06] pl-3 mb-3 break-words">
                    {report.reportText.length > 220 ? report.reportText.slice(0, 217) + "..." : report.reportText}
                  </p>
                  {report.evidenceLinks.length > 0 && (
                    <a href={report.evidenceLinks[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-[#0084ff] mb-3 transition-colors">
                      <Link2 className="h-3 w-3" /> Evidence <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/30 border-t border-white/[0.06] pt-3 mt-1">
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{report.likes.length} like{report.likes.length !== 1 ? "s" : ""}</span>
                    <a href={explorerTx(report.txSignature)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white transition-colors">On-chain record <ExternalLink className="h-3 w-3" /></a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-12 border-t border-white/[0.06] pt-8">
          <h2 className="text-xl font-light tracking-tight mb-4 text-white/50">How credibility is scored</h2>
          <div className="space-y-2 text-sm text-white/40">
            <p><span className="font-semibold text-white">+1</span> per report submitted</p>
            <p><span className="font-semibold text-white">+1</span> for every 5 likes received across all reports</p>
            <p><span className="font-semibold text-white">+2</span> per report whose conclusion matched the final tender verdict</p>
            <p className="text-xs text-white/20 pt-2">Score = reports + floor(likes / 5) + accurate x 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, highlight }: { label: string; value: number; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span></div>
      <div className={`text-2xl font-light tabular-nums ${highlight ? "text-[#0084ff]" : "text-white"}`}>{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-[#080c1a] flex items-center justify-center">
      <div className="max-w-xl text-center px-6">
        <ShieldCheck className="h-10 w-10 text-white/20 mx-auto mb-6" />
        <h1 className="text-3xl font-light tracking-tight text-white mb-3">{title}</h1>
        <p className="text-[#b8b8b8] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
