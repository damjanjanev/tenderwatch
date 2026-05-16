"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import {
  useFlags, useHasMounted, isVerifier, addVote,
  getBadgeTier, getValidatedFlagCount,
} from "@/lib/store";
import { getTender } from "@/lib/tenders";
import { formatEUR, relativeTime, explorerTx, truncateAddress, isOnChainMode, mockTxSignature } from "@/lib/utils";
import { sendMemo } from "@/lib/solana/memo";
import { toast } from "sonner";
import { CheckCircle, XCircle, ExternalLink, ShieldCheck, Link2, Shield, Search, Scale, Award, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  shield: Shield, search: Search, scale: Scale, award: Award,
};

export default function VerifierPage() {
  const mounted = useHasMounted();
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const flags = useFlags();
  const [pendingTx, setPendingTx] = useState<string | null>(null);

  const myAddress = publicKey?.toBase58();
  const verifier = isVerifier(myAddress);

  const handleVote = async (flagId: string, verdict: "Validate" | "Reject") => {
    if (!myAddress || pendingTx) return;
    setPendingTx(flagId);
    const toastId = `vote-${flagId}`;
    try {
      let signature: string;
      if (isOnChainMode()) {
        toast.loading("Sending vote to Solana devnet…", { id: toastId });
        const memo = `TenderWatch|VOTE|${flagId}|${verdict}`;
        ({ signature } = await sendMemo(connection, wallet, memo));
      } else {
        signature = mockTxSignature();
      }
      addVote(flagId, {
        flagId,
        verifierWallet: myAddress,
        verdict,
        txSignature: signature,
        createdAt: new Date().toISOString(),
      });
      toast.success(
        verdict === "Validate"
          ? "✅ Flag validated — tender is now Verified Suspicious"
          : "🗑️ Flag rejected — marked as spam",
        {
          id: toastId,
          description: isOnChainMode()
            ? "Your decision is now part of the on-chain record."
            : "Demo mode — decision saved locally.",
          action: isOnChainMode()
            ? { label: "View tx", onClick: () => window.open(explorerTx(signature), "_blank") }
            : undefined,
        },
      );
    } catch (e) {
      toast.error("Vote failed", {
        id: toastId,
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setPendingTx(null);
    }
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <EmptyState
        title="Verifier dashboard"
        body="Connect your Phantom wallet to review flagged tenders. Verifier access is gated by an allowlist — credentials are issued to known journalists and NGOs."
      />
    );
  }

  if (!verifier) {
    return (
      <EmptyState
        title="Not a verifier"
        body={`The wallet ${truncateAddress(myAddress || "")} is not in the verifier allowlist. Verifier credentials are issued to known journalists and NGOs.`}
      />
    );
  }

  const pending = flags.filter((f) => f.status === "Pending");
  const voted = flags.filter((f) =>
    f.votes.some((v) => v.verifierWallet === myAddress),
  );

  return (
    <div className="container py-12 max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <ShieldCheck className="h-5 w-5 text-forest" />
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Verifier dashboard</p>
      </div>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-3">
        Review citizen flags
      </h1>
      <p className="text-muted max-w-2xl mb-8">
        You are the final check. Validate a flag to move it to the public Suspicious board —
        the citizen who flagged it earns a badge point toward their Watchdog rank.
      </p>

      {/* Verifier's own badge */}
      {myAddress && (
        <div className="mb-10">
          <BadgeDisplay walletAddress={myAddress} />
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="voted">Voted ({voted.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pending.length === 0 ? (
            <div className="border border-dashed border-sand rounded-md p-12 text-center">
              <p className="text-muted">No pending flags right now.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pending.map((flag) => {
                const tender = getTender(flag.tenderId);
                if (!tender) return null;
                const flaggerBadge = getBadgeTier(flag.flaggerWallet);
                const flaggerCount = getValidatedFlagCount(flag.flaggerWallet);
                return (
                  <article key={flag.id} className="border border-sand rounded-md p-6 bg-surface space-y-4">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="pending">Community Flagged</Badge>
                      {flag.category && (
                        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-sand/50 border border-sand text-ink/70">
                          {flag.category}
                        </span>
                      )}
                      <span className="text-xs text-muted">{relativeTime(flag.createdAt)}</span>
                    </div>

                    {/* Tender info */}
                    <div>
                      <h3 className="font-serif text-xl leading-tight tracking-tight mb-1">
                        {tender.title}
                      </h3>
                      <div className="text-xs text-muted font-mono">
                        {formatEUR(tender.amountEUR)} · {tender.contractor} · {tender.ministry}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="font-serif italic text-ink/85 leading-relaxed border-l-2 border-sand pl-4 break-words overflow-hidden">
                      &ldquo;{flag.reasonText}&rdquo;
                    </p>

                    {/* Evidence link */}
                    {flag.evidenceUrl && (
                      <a
                        href={flag.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink break-all"
                      >
                        <Link2 className="h-3 w-3" />
                        Evidence: {flag.evidenceUrl.length > 60
                          ? flag.evidenceUrl.slice(0, 57) + "…"
                          : flag.evidenceUrl}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {/* Flagger info */}
                    <div className="flex items-center gap-2 text-xs text-muted border-t border-sand pt-3">
                      <span>Flagged by:</span>
                      <span className="font-mono">{truncateAddress(flag.flaggerWallet)}</span>
                      {flaggerBadge ? (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[11px] font-medium ${flaggerBadge.bgClass} ${flaggerBadge.colorClass}`}>
                          {(() => { const I = ICON_MAP[flaggerBadge.icon]; return <I className="h-3 w-3" />; })()} {flaggerBadge.name}
                        </span>
                      ) : (
                        <span className="text-muted/60">
                          ({flaggerCount} validated flag{flaggerCount !== 1 ? "s" : ""})
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 justify-end pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(flag.id, "Reject")}
                        disabled={pendingTx !== null}
                      >
                        <XCircle className="h-4 w-4" />
                        {pendingTx === flag.id ? "Sending…" : "Reject"}
                      </Button>
                      <Button
                        variant="forest"
                        size="sm"
                        onClick={() => handleVote(flag.id, "Validate")}
                        disabled={pendingTx !== null}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {pendingTx === flag.id ? "Sending…" : "Validate"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voted">
          {voted.length === 0 ? (
            <div className="border border-dashed border-sand rounded-md p-12 text-center">
              <p className="text-muted">You haven&apos;t voted on any flags yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {voted.map((flag) => {
                const myVote = flag.votes.find((v) => v.verifierWallet === myAddress);
                const tender = getTender(flag.tenderId);
                if (!tender || !myVote) return null;
                return (
                  <article key={flag.id} className="border-l-2 border-sand pl-5 py-2">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        variant={
                          flag.status === "VerifiedSuspicious"
                            ? "suspicious"
                            : flag.status === "DismissedAsSpam"
                              ? "dismissed"
                              : "pending"
                        }
                      >
                        {flag.status === "VerifiedSuspicious"
                          ? "Verified Suspicious"
                          : flag.status === "DismissedAsSpam"
                            ? "Dismissed"
                            : "Still pending"}
                      </Badge>
                      <span className={`text-xs font-medium ${myVote.verdict === "Validate" ? "text-forest" : "text-oxblood"}`}>
                        You: {myVote.verdict === "Validate" ? "✅ Validated" : "🗑️ Rejected"}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg leading-tight mb-1">{tender.title}</h4>
                    {flag.category && (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-sand/50 border border-sand text-ink/70 mb-2">
                        {flag.category}
                      </span>
                    )}
                    <div className="mt-2">
                      <a
                        href={explorerTx(myVote.txSignature)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted hover:text-ink inline-flex items-center gap-1"
                      >
                        Your vote on-chain <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="container py-20 max-w-xl text-center animate-fade-in">
      <ShieldCheck className="h-10 w-10 text-muted mx-auto mb-6" />
      <h1 className="font-serif text-3xl tracking-tight mb-3">{title}</h1>
      <p className="text-muted leading-relaxed">{body}</p>
    </div>
  );
}
