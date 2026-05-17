"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  useTenderReports,
  addTenderReport,
  likeTenderReport,
  getTenderReportStatus,
  type TenderReport,
  type TenderReportStatus,
} from "@/lib/tenderReports"
import { isVerifier, useHasMounted } from "@/lib/store"
import {
  formatDate,
  relativeTime,
  explorerTx,
  truncateAddress,
  isOnChainMode,
  mockTxSignature,
} from "@/lib/utils"
import { sendMemo } from "@/lib/solana/memo"
import { toast } from "sonner"
import {
  ThumbsUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Link2,
} from "lucide-react"

// ---------------------------------------------------------------------------
// StatusBanner
// ---------------------------------------------------------------------------

function StatusBanner({
  status,
  reportCount,
}: {
  status: TenderReportStatus
  reportCount: number
}) {
  if (status === "NoReview") return null

  if (status === "UnderReview") {
    return (
      <div className="card-solid border-accent/40 bg-accent/5 flex items-start gap-3 px-5 py-4 mb-6">
        <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
        <p className="text-sm text-accent font-medium">
          Under Review &mdash; {reportCount} journalist report
          {reportCount !== 1 ? "s" : ""} submitted, awaiting threshold (3 required)
        </p>
      </div>
    )
  }

  if (status === "VerifiedSuspicious") {
    return (
      <div className="card-solid border-oxblood/40 bg-oxblood/5 flex items-start gap-3 px-5 py-4 mb-6">
        <AlertTriangle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
        <p className="text-sm text-danger font-medium">
          Verified Suspicious &mdash; majority of journalist reports confirm irregularities
        </p>
      </div>
    )
  }

  if (status === "Clean") {
    return (
      <div className="card-solid border-success/40 bg-success/5 flex items-start gap-3 px-5 py-4 mb-6">
        <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
        <p className="text-sm text-success font-medium">
          Cleared &mdash; majority of journalist reports found no irregularities
        </p>
      </div>
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TenderReportSection({ tenderId }: { tenderId: string }) {
  const mounted = useHasMounted()
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const reports = useTenderReports(tenderId)
  const myAddress = publicKey?.toBase58()
  const verifier = isVerifier(myAddress)
  const status = getTenderReportStatus(reports)
  const hasAlreadyReported = reports.some((r) => r.journalistWallet === myAddress)

  // Form state
  const [reportText, setReportText] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const [conclusion, setConclusion] = useState<"Suspicious" | "NotSuspicious" | "">("")
  const [submitting, setSubmitting] = useState(false)

  const MIN_LEN = 100
  const canSubmit = reportText.length >= MIN_LEN && conclusion !== "" && !submitting

  // Sorted: most liked first
  const sortedReports = [...reports].sort(
    (a, b) => b.likes.length - a.likes.length
  )

  async function handleSubmit() {
    if (!myAddress || !canSubmit) return
    setSubmitting(true)
    try {
      let txSignature: string
      if (isOnChainMode()) {
        const wallet = { publicKey, sendTransaction: (window as any).__walletSendTransaction }
        const result = await sendMemo(
          connection,
          wallet as any,
          JSON.stringify({ type: "tender-report", tenderId, conclusion })
        )
        txSignature = result.signature
      } else {
        txSignature = mockTxSignature()
      }

      const report: TenderReport = {
        id: "tr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        tenderId,
        journalistWallet: myAddress,
        reportText,
        evidenceLinks: evidenceUrl.trim() ? [evidenceUrl.trim()] : [],
        conclusion: conclusion as "Suspicious" | "NotSuspicious",
        txSignature,
        createdAt: new Date().toISOString(),
        likes: [],
      }

      addTenderReport(report)
      setReportText("")
      setEvidenceUrl("")
      setConclusion("")
      toast.success("Report submitted successfully.")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit report.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleLike(reportId: string) {
    if (!connected || !verifier || !myAddress) return
    likeTenderReport(reportId, myAddress)
  }

  const showForm =
    mounted &&
    verifier &&
    connected &&
    !hasAlreadyReported &&
    status !== "VerifiedSuspicious" &&
    status !== "Clean"

  return (
    <section className="py-10 border-t border-sand">
      <h2 className="text-2xl font-bold text-ink mb-2 tracking-tight">
        Journalist Reports ({reports.length})
      </h2>
      <p className="text-sm text-muted mb-6">
        Reports from verified journalists.{" "}
        {status === "NoReview"
          ? "This tender has not been reviewed yet. "
          : ""}
        3+ reports with majority agreement determine the tender&apos;s status.
      </p>

      <StatusBanner status={status} reportCount={reports.length} />

      {/* Reports list */}
      {sortedReports.length === 0 && (
        <div className="border border-dashed border-sand rounded-sm p-10 text-center mb-6">
          <FileText className="h-6 w-6 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">No journalist reports yet.</p>
        </div>
      )}

      {sortedReports.map((report) => {
        const iLiked = myAddress ? report.likes.includes(myAddress) : false
        const canLike = connected && verifier && !!myAddress

        return (
          <article key={report.id} className="card-solid p-5 mb-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Conclusion badge */}
                {report.conclusion === "Suspicious" ? (
                  <span className="border border-oxblood/50 text-danger bg-danger/5 text-xs px-2 py-0.5 rounded-sm font-semibold">
                    Suspicious
                  </span>
                ) : (
                  <span className="border border-sand text-muted bg-surface text-xs px-2 py-0.5 rounded-sm font-semibold">
                    Not Suspicious
                  </span>
                )}
                <span className="font-mono text-xs text-muted">
                  {truncateAddress(report.journalistWallet)}
                </span>
                <span className="text-xs text-muted">·</span>
                <span
                  className="text-xs text-muted"
                  title={formatDate(report.createdAt)}
                >
                  {relativeTime(report.createdAt)}
                </span>
              </div>

              {/* Like button */}
              <button
                onClick={() => handleLike(report.id)}
                disabled={!canLike}
                title={
                  !connected
                    ? "Connect wallet to like"
                    : !verifier
                    ? "Verifier access required"
                    : iLiked
                    ? "Unlike"
                    : "Like this report"
                }
                className={[
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-sm border transition-colors",
                  iLiked
                    ? "border-accent/60 text-accent bg-accent/5"
                    : "border-sand text-muted hover:border-sand/80",
                  !canLike ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                <ThumbsUp
                  className={`h-3.5 w-3.5 ${iLiked ? "fill-accent text-accent" : ""}`}
                />
                <span className="font-mono tabular-nums">{report.likes.length}</span>
              </button>
            </div>

            {/* Report text */}
            <p className="text-sm text-ink leading-relaxed mb-3 whitespace-pre-wrap">
              {report.reportText}
            </p>

            {/* Evidence links */}
            {report.evidenceLinks.length > 0 && (
              <div className="mb-3 flex flex-col gap-1">
                {report.evidenceLinks.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent hover:underline break-all"
                  >
                    <Link2 className="h-3 w-3 shrink-0" />
                    {url}
                  </a>
                ))}
              </div>
            )}

            {/* On-chain record */}
            <div className="pt-2 border-t border-sand/60">
              <a
                href={explorerTx(report.txSignature)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                On-chain record · {truncateAddress(report.txSignature, 6)}
              </a>
            </div>
          </article>
        )
      })}

      {/* Write report form */}
      {showForm && (
        <div className="card-solid p-6 mt-6">
          <h3 className="text-base font-bold text-ink mb-1">Submit your report</h3>
          <p className="text-sm text-muted mb-5">
            You can only submit one report per tender. Your conclusion contributes to
            the tender&apos;s status.
          </p>

          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
              Report ({reportText.length}/{MIN_LEN} min chars)
            </label>
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe your findings in detail. Include pricing comparisons, procedural observations, document analysis, etc."
              rows={6}
              className="w-full resize-y text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
              Evidence URL (optional)
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://e-nabavki.gov.mk/..."
              className="w-full border border-sand rounded-sm px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-2">
              Conclusion
            </label>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConclusion((c) => (c === "Suspicious" ? "" : "Suspicious"))
                }
                className={[
                  "px-4 py-2 text-sm font-semibold rounded-sm border transition-colors",
                  conclusion === "Suspicious"
                    ? "border-danger/70 bg-danger/10 text-danger"
                    : "border-sand text-muted hover:border-sand/80",
                ].join(" ")}
              >
                Suspicious
              </button>
              <button
                onClick={() =>
                  setConclusion((c) => (c === "NotSuspicious" ? "" : "NotSuspicious"))
                }
                className={[
                  "px-4 py-2 text-sm font-semibold rounded-sm border transition-colors",
                  conclusion === "NotSuspicious"
                    ? "border-success/70 bg-success/10 text-success"
                    : "border-sand text-muted hover:border-sand/80",
                ].join(" ")}
              >
                Not Suspicious
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="font-semibold"
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </div>
      )}

      {/* Wallet / access notices */}
      {mounted && !connected && (
        <p className="text-sm text-muted mt-6 border border-dashed border-sand rounded-sm px-4 py-3">
          Connect your wallet to write a report.
        </p>
      )}
      {mounted && connected && !verifier && (
        <p className="text-sm text-muted mt-6 border border-dashed border-sand rounded-sm px-4 py-3">
          Verifier access required to write reports.
        </p>
      )}
      {mounted && connected && verifier && hasAlreadyReported && (
        <p className="text-sm text-muted mt-6 border border-dashed border-sand rounded-sm px-4 py-3">
          You have already submitted a report on this tender.
        </p>
      )}
    </section>
  )
}
