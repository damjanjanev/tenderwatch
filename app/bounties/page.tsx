"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  useBounties,
  useAllBountyReports,
  useBountyReports,
  addBountyRequest,
  submitBountyReport,
  approveReport,
  declineReport,
  type BountyRequest,
  type BountyReport,
} from "@/lib/bounties"
import { isVerifier, useHasMounted } from "@/lib/store"
import { truncateAddress, relativeTime, mockTxSignature } from "@/lib/utils"
import { PUBLIC_WALLET_ADDRESS, PUBLIC_WALLET_LABEL, fakeTxSig } from "@/lib/publicWallet"
import Link from "next/link"
import { toast } from "sonner"
import {
  Trophy,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterTab = "All" | "Open" | "Awarded"

// ---------------------------------------------------------------------------
// Preset amounts
// ---------------------------------------------------------------------------

const PRESET_AMOUNTS = [15, 25, 50, 100, 200]

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function BountyStatusBadge({ status }: { status: BountyRequest["status"] }) {
  if (status === "Open") {
    return (
      <span className="border border-accent/60 text-accent bg-accent/5 text-xs px-2 py-0.5 rounded-sm font-semibold">
        Open
      </span>
    )
  }
  return (
    <span className="border border-success/50 text-success bg-success/5 text-xs px-2 py-0.5 rounded-sm font-semibold">
      Awarded
    </span>
  )
}

function ReportStatusBadge({ status }: { status: BountyReport["status"] }) {
  if (status === "Approved") {
    return (
      <span className="flex items-center gap-1 border border-success/50 text-success bg-success/5 text-xs px-2 py-0.5 rounded-sm font-semibold">
        <CheckCircle className="h-3 w-3" />
        Winner
      </span>
    )
  }
  if (status === "Declined") {
    return (
      <span className="border border-red-800/40 text-red-400 bg-red-900/10 text-xs px-2 py-0.5 rounded-sm font-semibold">
        Declined
      </span>
    )
  }
  return (
    <span className="border border-sand text-muted bg-surface text-xs px-2 py-0.5 rounded-sm font-semibold">
      Pending
    </span>
  )
}

// ---------------------------------------------------------------------------
// Thumbnail grid
// ---------------------------------------------------------------------------

function AttachmentThumbnails({ urls }: { urls: string[] }) {
  if (!urls.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open full size"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Attachment"
            className="h-16 w-24 object-cover rounded-sm border border-sand hover:border-accent transition-colors"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement
              el.style.display = "none"
            }}
          />
        </a>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Single bounty report card
// ---------------------------------------------------------------------------

function ReportItem({
  report,
  bounty,
  myAddress,
}: {
  report: BountyReport
  bounty: BountyRequest
  myAddress: string | undefined
}) {
  const [expanded, setExpanded] = useState(false)
  const isMyBounty = myAddress === bounty.requesterWallet
  const canManage = isMyBounty && bounty.status === "Open" && report.status === "Pending"
  const [actioning, setActioning] = useState(false)

  const shortText = report.reportText.slice(0, 200)
  const needsTruncation = report.reportText.length > 200

  async function handleApprove() {
    setActioning(true)
    try {
      approveReport(bounty.id, report.id)
      toast.success("Report approved. Bounty awarded!")
    } catch {
      toast.error("Failed to approve report.")
    } finally {
      setActioning(false)
    }
  }

  async function handleDecline() {
    setActioning(true)
    try {
      declineReport(bounty.id, report.id)
      toast.success("Report declined.")
    } catch {
      toast.error("Failed to decline report.")
    } finally {
      setActioning(false)
    }
  }

  return (
    <div
      className={[
        "rounded-sm border p-4 flex flex-col gap-2",
        report.status === "Approved"
          ? "border-success/30 bg-success/5"
          : report.status === "Declined"
          ? "border-sand/50 bg-surface opacity-70"
          : "border-sand bg-surface",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-mono text-xs text-muted">
          {truncateAddress(report.journalistWallet)}
        </span>
        <div className="flex items-center gap-2">
          <ReportStatusBadge status={report.status} />
          <span className="text-xs text-muted">{relativeTime(report.createdAt)}</span>
        </div>
      </div>

      {/* Report text */}
      <p className="text-sm text-ink leading-relaxed">
        {expanded || !needsTruncation ? report.reportText : shortText + "…"}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-accent hover:underline self-start"
        >
          {expanded ? "Show less" : "Read full report"}
        </button>
      )}

      {/* Evidence links */}
      {report.evidenceLinks.length > 0 && (
        <div className="flex flex-col gap-1">
          {report.evidenceLinks.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline break-all flex items-center gap-1"
            >
              <LinkIcon className="h-3 w-3 shrink-0" />
              {url}
            </a>
          ))}
        </div>
      )}

      {/* Attachments */}
      <AttachmentThumbnails urls={report.attachmentUrls} />

      {/* Approve / Decline buttons */}
      {canManage && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={actioning}
            className="text-xs font-semibold bg-success/10 border border-success/40 text-success hover:bg-success/20"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDecline}
            disabled={actioning}
            className="text-xs font-semibold border-sand text-muted hover:text-ink"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Decline
          </Button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Submit report inline form
// ---------------------------------------------------------------------------

function SubmitReportForm({
  bountyId,
  myAddress,
  onClose,
}: {
  bountyId: string
  myAddress: string
  onClose: () => void
}) {
  const [reportText, setReportText] = useState("")
  const [evidenceInput, setEvidenceInput] = useState("")
  const [attachmentInput, setAttachmentInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit =
    reportText.trim().length >= 80 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const evidenceLinks = evidenceInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
      const attachmentUrls = attachmentInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)

      submitBountyReport({
        id: "br_" + Date.now() + "_" + Math.random().toString(36).slice(2),
        bountyId,
        journalistWallet: myAddress,
        reportText: reportText.trim(),
        evidenceLinks,
        attachmentUrls,
        status: "Pending",
        createdAt: new Date().toISOString(),
      })
      toast.success("Report submitted. The requester will review it.")
      onClose()
    } catch {
      toast.error("Failed to submit report.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-sand rounded-sm p-4 flex flex-col gap-4 bg-surface mt-2">
      <p className="text-xs uppercase tracking-wider text-muted font-semibold">
        Submit your report
      </p>

      <div>
        <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
          Report ({reportText.length}/80 min chars)
        </label>
        <Textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="Write your investigation findings here. Include specific facts, figures, and sources."
          rows={6}
          className="w-full resize-y text-sm"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
          Evidence URLs (one per line, optional)
        </label>
        <Textarea
          value={evidenceInput}
          onChange={(e) => setEvidenceInput(e.target.value)}
          placeholder={"https://e-nabavki.gov.mk/…\nhttps://crm.gov.mk/…"}
          rows={3}
          className="w-full resize-y text-sm"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
          Attachment URLs (one per line, optional)
        </label>
        <Textarea
          value={attachmentInput}
          onChange={(e) => setAttachmentInput(e.target.value)}
          placeholder="https://…/document.jpg"
          rows={2}
          className="w-full resize-y text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="font-semibold text-xs"
        >
          {submitting ? "Submitting…" : "Submit Report"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="text-xs"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bounty card
// ---------------------------------------------------------------------------

function BountyCard({
  bounty,
  myAddress,
  verifier,
  connected,
}: {
  bounty: BountyRequest
  myAddress: string | undefined
  verifier: boolean
  connected: boolean
}) {
  const reports = useBountyReports(bounty.id)
  const [reportsExpanded, setReportsExpanded] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)

  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const awardedReport = bounty.awardedReportId
    ? reports.find((r) => r.id === bounty.awardedReportId)
    : undefined

  const hasAlreadySubmitted = myAddress
    ? reports.some((r) => r.journalistWallet === myAddress)
    : false

  const canSubmit =
    connected &&
    verifier &&
    bounty.status === "Open" &&
    !hasAlreadySubmitted &&
    myAddress !== undefined

  return (
    <div className="rounded-xl border border-white/[0.06] p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.02)" }}>
      {/* Top row: status + amount */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <BountyStatusBadge status={bounty.status} />
        <span className="font-mono font-bold text-accent text-lg tabular-nums">
          ${bounty.bountyUSD}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-medium text-base text-white leading-snug">{bounty.title}</h3>

      {/* Request text */}
      <p className="text-sm text-white/50 leading-relaxed">{bounty.requestText}</p>

      {/* Source URLs */}
      {bounty.sourceUrls.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">
            Source links
          </p>
          {bounty.sourceUrls.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline break-all flex items-center gap-1"
            >
              <LinkIcon className="h-3 w-3 shrink-0" />
              {url}
            </a>
          ))}
        </div>
      )}

      {/* Attachments */}
      {bounty.attachmentUrls.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold flex items-center gap-1 mb-1">
            <ImageIcon className="h-3 w-3" />
            Evidence
          </p>
          <AttachmentThumbnails urls={bounty.attachmentUrls} />
        </div>
      )}

      {/* Awarded banner */}
      {bounty.status === "Awarded" && awardedReport && (
        <div className="flex items-start gap-2 border border-forest/30 bg-forest/5 rounded-sm px-3 py-2">
          <CheckCircle className="h-4 w-4 text-forest shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-forest font-semibold">
              Paid out via{" "}
              <Link href="/wallet" className="underline underline-offset-2 hover:text-forest/70 transition-colors">
                {PUBLIC_WALLET_LABEL}
              </Link>
              {" → "}
              <span className="font-mono">{truncateAddress(awardedReport.journalistWallet)}</span>
            </p>
            <p className="text-[11px] text-muted font-mono mt-0.5 truncate">
              tx: {truncateAddress(fakeTxSig(`payout-${awardedReport.id}`), 10)}
            </p>
          </div>
        </div>
      )}

      {/* Reports section */}
      <div className="border-t border-white/[0.06] pt-3">
        <button
          onClick={() => setReportsExpanded((v) => !v)}
          className="flex items-center justify-between w-full text-left group"
        >
          <span className="text-xs uppercase tracking-wider text-muted font-semibold flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" />
            {reports.length === 0
              ? "No reports yet"
              : reports.length === 1
              ? "1 journalist report"
              : `${reports.length} journalist reports`}
          </span>
          {reports.length > 0 && (
            <span className="text-muted group-hover:text-ink transition-colors">
              {reportsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          )}
        </button>

        {reportsExpanded && sortedReports.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            {sortedReports.map((report) => (
              <ReportItem
                key={report.id}
                report={report}
                bounty={bounty}
                myAddress={myAddress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit report section */}
      {canSubmit && (
        <div className="border-t border-white/[0.06] pt-3">
          {!submitOpen ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSubmitOpen(true)}
              className="text-xs font-semibold"
            >
              Submit Report
            </Button>
          ) : (
            <SubmitReportForm
              bountyId={bounty.id}
              myAddress={myAddress!}
              onClose={() => setSubmitOpen(false)}
            />
          )}
        </div>
      )}

      {/* Already submitted notice */}
      {connected && verifier && hasAlreadySubmitted && bounty.status === "Open" && (
        <p className="text-xs text-muted border-t border-sand pt-3 flex items-center gap-1">
          <Clock className="h-3 w-3 shrink-0" />
          You have already submitted a report for this bounty.
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.06] text-xs text-white/30 flex-wrap">
        <span>
          Posted by{" "}
          <span className="font-mono">{truncateAddress(bounty.requesterWallet)}</span>
          {" · "}
          deposited to{" "}
          <Link href="/wallet" className="text-accent hover:underline">
            {PUBLIC_WALLET_LABEL}
          </Link>
        </span>
        <span>{relativeTime(bounty.createdAt)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Dynamic URL list input
// ---------------------------------------------------------------------------

function UrlListInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (vals: string[]) => void
  placeholder: string
}) {
  function update(index: number, value: string) {
    const next = [...values]
    next[index] = value
    onChange(next)
  }

  function addRow() {
    onChange([...values, ""])
  }

  function removeRow(index: number) {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
        {label}
      </label>
      <div className="flex flex-col gap-1.5">
        {values.map((val, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={val}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 border border-sand rounded-sm px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink"
            />
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-muted hover:text-ink text-xs px-2 border border-sand rounded-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-1.5 text-xs text-accent hover:underline"
      >
        + Add {label.toLowerCase().replace(" (optional)", "")}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Post bounty form
// ---------------------------------------------------------------------------

function PostBountyForm({
  myAddress,
  onClose,
}: {
  myAddress: string
  onClose: () => void
}) {
  const [title, setTitle] = useState("")
  const [requestText, setRequestText] = useState("")
  const [sourceUrls, setSourceUrls] = useState([""])
  const [attachmentUrls, setAttachmentUrls] = useState([""])
  const [bountyUSD, setBountyUSD] = useState<number>(25)
  const [customAmount, setCustomAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const effectiveAmount =
    customAmount.trim() !== "" ? Number(customAmount) : bountyUSD

  const canSubmit =
    title.trim().length > 0 &&
    requestText.trim().length >= 50 &&
    effectiveAmount > 0 &&
    !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const cleanSourceUrls = sourceUrls.map((u) => u.trim()).filter(Boolean)
      const cleanAttachmentUrls = attachmentUrls.map((u) => u.trim()).filter(Boolean)

      const request: BountyRequest = {
        id: "bnt_" + Date.now(),
        requesterWallet: myAddress,
        title: title.trim(),
        requestText: requestText.trim(),
        sourceUrls: cleanSourceUrls,
        attachmentUrls: cleanAttachmentUrls,
        bountyUSD: effectiveAmount,
        status: "Open",
        createdAt: new Date().toISOString(),
      }
      addBountyRequest(request)
      toast.success("Bounty request posted.")
      onClose()
    } catch {
      toast.error("Failed to post bounty.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.06] p-6 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
      <h2 className="text-base font-medium text-white mb-1">Post a Bounty</h2>
      <p className="text-sm text-white/50 mb-5">
        Describe what you want investigated and set a USD reward. Multiple journalists
        can submit reports — you choose the winner.
      </p>

      <div className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title for the investigation request"
            className="w-full border border-sand rounded-sm px-3 py-2 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-1.5">
            What do you want investigated? ({requestText.length}/50 min chars)
          </label>
          <Textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            placeholder="Describe the investigation you need. Include tender IDs, companies, or specific questions you want answered."
            rows={5}
            className="w-full resize-y text-sm"
          />
        </div>

        {/* Source URLs */}
        <UrlListInput
          label="Source URLs (optional)"
          values={sourceUrls}
          onChange={setSourceUrls}
          placeholder="https://e-nabavki.gov.mk/…"
        />

        {/* Attachment URLs */}
        <UrlListInput
          label="Attachment URLs (optional)"
          values={attachmentUrls}
          onChange={setAttachmentUrls}
          placeholder="https://…/screenshot.png"
        />

        {/* Bounty amount */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted font-semibold mb-2">
            Bounty (USD)
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setBountyUSD(amt)
                  setCustomAmount("")
                }}
                className={[
                  "px-4 py-1.5 text-sm font-semibold rounded-sm border transition-colors",
                  bountyUSD === amt && customAmount === ""
                    ? "border-accent/70 bg-accent/10 text-accent"
                    : "border-sand text-muted hover:border-sand/80",
                ].join(" ")}
              >
                ${amt}
              </button>
            ))}
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom"
              min={1}
              className="w-24 border border-sand rounded-sm px-3 py-1.5 text-sm bg-surface text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button onClick={handleSubmit} disabled={!canSubmit} className="font-semibold">
            {submitting ? "Posting…" : "Post Bounty"}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BountiesPage() {
  const mounted = useHasMounted()
  const { publicKey, connected } = useWallet()
  const bounties = useBounties()
  const allReports = useAllBountyReports()
  const myAddress = publicKey?.toBase58()
  const verifier = isVerifier(myAddress)

  const [activeTab, setActiveTab] = useState<FilterTab>("All")
  const [showPostForm, setShowPostForm] = useState(false)

  const filtered =
    activeTab === "All"
      ? bounties
      : bounties.filter((b) => b.status === activeTab)

  const tabs: FilterTab[] = ["All", "Open", "Awarded"]

  const totalUSD = bounties.reduce((sum, b) => sum + b.bountyUSD, 0)

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 30% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-[60px] py-14">
      {/* Header */}
      <div className="mb-10 pb-10 border-b border-white/[0.06]">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium block mb-4">
              Bounty Board
            </span>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
              Commission an investigation
            </h1>
            <p className="text-[#b8b8b8] max-w-xl leading-relaxed">
              Post a research request with a USD reward. Multiple journalists can
              submit reports — you pick the best one and award the bounty.
            </p>
          </div>

          {mounted && (
            <Button
              onClick={() => setShowPostForm((v) => !v)}
              className="flex items-center gap-2 font-semibold shrink-0 mt-1"
            >
              <Plus className="h-4 w-4" />
              Post a Bounty
            </Button>
          )}
        </div>

        {/* Stats bar */}
        {mounted && (
          <div className="flex gap-8 mt-8 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">Total bounties</p>
              <p className="font-mono font-light text-white text-xl tabular-nums">{bounties.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">USD offered</p>
              <p className="font-mono font-light text-[#0084ff] text-xl tabular-nums">${totalUSD.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">Reports submitted</p>
              <p className="font-mono font-light text-white text-xl tabular-nums">{allReports.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Post form */}
      {showPostForm && mounted && (
        <>
          {connected && myAddress ? (
            <PostBountyForm
              myAddress={myAddress}
              onClose={() => setShowPostForm(false)}
            />
          ) : (
            <div className="rounded-xl border border-white/[0.06] p-5 mb-8 text-sm text-white/40" style={{ background: "rgba(255,255,255,0.02)" }}>
              Connect your wallet to post a bounty.
            </div>
          )}
        </>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/[0.06]">
        {tabs.map((tab) => {
          const count = tab === "All" ? bounties.length : bounties.filter((b) => b.status === tab).length
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={["px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab ? "border-[#0084ff] text-white" : "border-transparent text-white/40 hover:text-white",
              ].join(" ")}>
              {tab}
              <span className="ml-1.5 font-mono text-xs text-white/30 tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Journalist notice */}
      {mounted && connected && !verifier && (
        <div className="mb-6 rounded-lg border border-dashed border-white/10 px-4 py-3 text-sm text-white/50 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[#0084ff]" />
          Verifier access is required to submit reports. Anyone can post a bounty request.
        </div>
      )}

      {/* Bounty grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center">
          <Trophy className="h-6 w-6 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            {activeTab === "All" ? "No bounties posted yet. Be the first to commission an investigation." : `No ${activeTab.toLowerCase()} bounties at this time.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} myAddress={myAddress} verifier={verifier} connected={connected} />
          ))}
        </div>
      )}

      <p className="text-xs text-white/30 mt-12 pt-6 border-t border-white/[0.06]">
        Bounty amounts are displayed in USD and are paid out off-chain by the requester via the{" "}
        <Link href="/wallet" className="text-[#0084ff] hover:underline">contr Treasury wallet</Link>.
        Amounts are on-chain records only — contr does not guarantee fiat conversion.
      </p>
      </div>
    </div>
  )
}
