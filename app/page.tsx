"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TENDERS } from "@/lib/tenders";
import { useFlags, useHasMounted } from "@/lib/store";
import { ArrowRight, FileText, Eye, ShieldCheck, ArrowUpRight } from "lucide-react";

export default function HomePage() {
  const mounted       = useHasMounted();
  const flags         = useFlags();
  const flagCount     = mounted ? flags.length : 0;
  const verifiedCount = mounted ? flags.filter((f) => f.status === "VerifiedSuspicious").length : 0;
  const pendingCount  = mounted ? flags.filter((f) => f.status === "Pending").length : 0;

  return (
    <div className="animate-fade-in">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="container pt-20 pb-16 md:pt-28 md:pb-20 border-b border-sand">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                Live · Solana Devnet
              </span>
            </div>
            <h1 className="text-5xl md:text-[68px] font-black leading-[0.95] tracking-tight mb-8">
              Watch how<br />
              Macedonia<br />
              <span className="text-muted">spends your</span><br />
              money.
            </h1>
            <p className="text-sm text-muted max-w-md leading-relaxed mb-8">
              Every government contract in one searchable place. Citizens flag what
              looks wrong. Journalists verify. The record is permanent.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/tenders">
                  Browse tenders <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/suspicious">
                  View flagged <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Live stats panel */}
          <div className="border border-sand rounded-sm divide-y divide-sand min-w-[200px] shrink-0">
            <StatRow label="Tenders" value={TENDERS.length} />
            <StatRow label="Flags raised" value={flagCount} live />
            <StatRow label="Pending review" value={pendingCount} />
            <StatRow label="Verified suspicious" value={verifiedCount} highlight />
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="container py-20 border-b border-sand">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-12">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-sand">
          <Step
            number="01"
            icon={<FileText className="h-4 w-4" />}
            title="Browse public tenders"
            body="Every contract the government signs, searchable and filterable by ministry, contractor, amount, or keyword."
          />
          <Step
            number="02"
            icon={<Eye className="h-4 w-4" />}
            title="Flag what looks wrong"
            body="Connect Phantom. Pick a category. Write a real reason. Your wallet and a hash of the reason go on Solana permanently."
          />
          <Step
            number="03"
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Journalists verify"
            body="Credentialed journalists review each flag. One validation moves the tender to the public Suspicious board."
          />
        </div>
      </section>

      {/* ── Tagline ───────────────────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-6">
            The principle
          </p>
          <p className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Anyone can flag.<br />
            <span className="text-muted font-normal">Verification has skin in the game.</span><br />
            The record is permanent.
          </p>
        </div>
      </section>

    </div>
  );
}

function StatRow({
  label, value, live, highlight,
}: {
  label: string;
  value: number;
  live?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-6">
      <div className="flex items-center gap-1.5">
        {live && <span className="w-1 h-1 rounded-full bg-accent animate-pulse-dot shrink-0" />}
        <span className="text-xs text-muted">{label}</span>
      </div>
      <span className={`font-mono text-sm font-bold tabular-nums ${highlight ? "text-oxblood" : "text-ink"}`}>
        {value}
      </span>
    </div>
  );
}

function Step({
  number, icon, title, body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="py-8 md:py-0 md:px-8 first:pl-0 last:pr-0">
      <div className="flex items-center gap-2 mb-5 text-muted">
        <span className="font-mono text-[10px] font-bold">{number}</span>
        {icon}
      </div>
      <h3 className="text-sm font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  );
}
