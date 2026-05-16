"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addFlag, FLAG_CATEGORIES, type FlagCategory } from "@/lib/store";
import { sha256Hex, explorerTx, isOnChainMode, mockTxSignature } from "@/lib/utils";
import { sendMemo } from "@/lib/solana/memo";
import { toast } from "sonner";
import { Flag, ExternalLink } from "lucide-react";

const MIN_LEN = 100;

export function FlagModal({ tenderId }: { tenderId: string }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FlagCategory | "">("");
  const [reason, setReason] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = category !== "" && reason.length >= MIN_LEN && !submitting;

  const handleSubmit = async () => {
    if (!publicKey || !canSubmit || !category) return;
    setSubmitting(true);
    try {
      const reasonHash = await sha256Hex(reason);
      let signature: string;
      if (isOnChainMode()) {
        const memo = `TenderWatch|FLAG|${tenderId}|${reasonHash.slice(0, 32)}`;
        toast.loading("Sending transaction to Solana devnet…", { id: "flag-tx" });
        ({ signature } = await sendMemo(connection, wallet, memo));
      } else {
        signature = mockTxSignature();
      }
      const id = `flag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      addFlag({
        id,
        tenderId,
        flaggerWallet: publicKey.toBase58(),
        category: category as FlagCategory,
        reasonText: reason,
        evidenceUrl: evidenceUrl.trim() || undefined,
        reasonHash,
        txSignature: signature,
        createdAt: new Date().toISOString(),
        status: "Pending",
        votes: [],
      });
      toast.success(
        isOnChainMode() ? "Flag recorded on Solana Devnet" : "Flag submitted",
        {
          id: "flag-tx",
          description: isOnChainMode()
            ? "Your concern is now part of the permanent public record."
            : "Flag is live — a journalist or NGO will review it.",
          action: isOnChainMode()
            ? { label: "View tx", onClick: () => window.open(explorerTx(signature), "_blank") }
            : undefined,
        },
      );
      setCategory("");
      setReason("");
      setEvidenceUrl("");
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error("Could not record flag", { id: "flag-tx", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <Button variant="destructive" disabled className="w-full sm:w-auto">
        <Flag className="h-4 w-4" />
        Connect Phantom to flag
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full sm:w-auto">
          <Flag className="h-4 w-4" />
          Flag this tender
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Flag this tender as suspicious</DialogTitle>
          <DialogDescription>
            Your flag will be publicly visible immediately as &ldquo;Community Flagged.&rdquo;
            A journalist or NGO verifier will review it — if validated, it moves to Verified Suspicious.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted">
              Reason category <span className="text-oxblood">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FlagCategory)}
              className="w-full rounded-md border border-sand bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="">Select a reason…</option>
              {FLAG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted">
              Detailed explanation <span className="text-oxblood">*</span>
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Be specific. E.g. 'The per-km cost is 2.3× the EU benchmark and the same contractor won 8 of the last 10 road bids in this region.'"
              className="font-serif text-base min-h-[100px]"
            />
            <div className="flex items-center justify-between text-xs">
              <span className={reason.length < MIN_LEN ? "text-oxblood" : "text-forest"}>
                {reason.length} / {MIN_LEN} minimum characters
              </span>
              <a
                href="https://explorer.solana.com/?cluster=devnet"
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-ink inline-flex items-center gap-1"
              >
                Solana Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Evidence URL */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-muted">
              Evidence link <span className="text-muted/60">(optional — IPFS, document, article)</span>
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://ipfs.io/ipfs/… or https://…"
              className="w-full rounded-md border border-sand bg-paper px-3 py-2 text-sm text-ink font-mono focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting
              ? isOnChainMode() ? "Sending tx…" : "Submitting…"
              : "Submit flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
