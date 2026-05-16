"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { TENDERS } from "@/lib/tenders";
import { useFlags, useHasMounted } from "@/lib/store";
import { ArrowRight, FileText, Eye, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const mounted      = useHasMounted();
  const flags        = useFlags();
  const flagCount    = mounted ? flags.length : 0;
  const verifiedCount = mounted ? flags.filter((f) => f.status === "VerifiedSuspicious").length : 0;

  return (
    <div className="animate-fade-in">

      {/* Hero */}
      <section className="container pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-8">
            Public oversight &nbsp;·&nbsp; Solana Devnet
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.0] tracking-tight mb-8">
            Watch how Macedonia<br />
            spends your money.
          </h1>
          <p className="text-base text-muted max-w-xl mb-10 leading-relaxed">
            Every government contract in one searchable place. Citizens flag what looks
            wrong. Journalists verify. The record is permanent — no government, no admin,
            no court order can quietly delete it.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/tenders">
                Browse tenders <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/suspicious">View flagged</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-sand" />

      {/* Stats */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-sand border border-sand rounded-sm overflow-hidden">
          <StatCard label="Tenders indexed"    value={TENDERS.length} hint="Public procurement records" />
          <StatCard label="Citizen flags"       value={flagCount}       hint="Permanent on-chain concerns" />
          <StatCard label="Verified suspicious" value={verifiedCount}   hint="Confirmed by verifiers" />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-sand" />

      {/* How it works */}
      <section className="container py-20">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-10">
          How it works
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <Step
            number="01"
            icon={<FileText className="h-4 w-4" />}
            title="Browse public tenders"
            body="Every contract the government signs, in one searchable place. Filter by ministry, contractor, amount, or keyword."
          />
          <Step
            number="02"
            icon={<Eye className="h-4 w-4" />}
            title="Flag what looks wrong"
            body="Connect Phantom. Pick a category. Write a real reason. Your wallet and a hash of the reason are recorded permanently on Solana."
          />
          <Step
            number="03"
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Journalists verify"
            body="Credentialed journalists and NGOs review each flag. One validation moves the tender to the public Suspicious board."
          />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-sand" />

      {/* Tagline */}
      <section className="container py-20">
        <blockquote className="border-l-2 border-ink pl-8 max-w-2xl">
          <p className="text-2xl md:text-3xl font-bold leading-snug tracking-tight">
            Anyone can flag. Verification has skin in the game. The record is permanent.
          </p>
        </blockquote>
      </section>

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
    <div>
      <div className="flex items-center gap-2.5 mb-4 text-muted">
        <span className="font-mono text-[11px] font-semibold">{number}</span>
        {icon}
      </div>
      <h3 className="text-base font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  );
}
