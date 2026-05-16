"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { TENDERS } from "@/lib/tenders";
import { useFlags, useHasMounted } from "@/lib/store";
import { ArrowRight, Eye, FileText, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const mounted = useHasMounted();
  const flags = useFlags();
  const flagCount = mounted ? flags.length : 0;
  const verifiedCount = mounted ? flags.filter((f) => f.status === "VerifiedSuspicious").length : 0;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="container py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted mb-6">
            Public oversight · Built on Solana Devnet
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mb-6">
            Watch how Macedonia <br />
            <span className="italic">spends your money.</span>
          </h1>
          <p className="text-lg text-ink/80 max-w-2xl mb-8 leading-relaxed">
            Every government contract, in one searchable place. Citizens flag what looks
            wrong with a wallet. Verifiers stake their reputation on the answer.
            The record is permanent — no government, no admin, no court order can quietly delete it.
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

      {/* Stats */}
      <section className="container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Tenders indexed"
            value={TENDERS.length}
            hint="Public procurement records"
          />
          <StatCard
            label="Citizen flags"
            value={flagCount}
            hint="Permanent on-chain concerns"
          />
          <StatCard
            label="Verified suspicious"
            value={verifiedCount}
            hint="Confirmed by 3+ verifiers"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container pb-24">
        <h2 className="font-serif text-3xl mb-10 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Step
            number="01"
            icon={<FileText className="h-5 w-5" />}
            title="Browse public tenders"
            body="Every contract the government signs, in one searchable place. Filter by ministry, contractor, amount, or keyword."
          />
          <Step
            number="02"
            icon={<Eye className="h-5 w-5" />}
            title="Flag what looks wrong"
            body="Connect Phantom. Write a real reason. Your wallet, the reason hash, and timestamp are recorded permanently on Solana."
          />
          <Step
            number="03"
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Verifiers weigh in"
            body="Journalists and NGOs stake their reputation by voting. When 3+ verifiers agree, the tender hits the public Suspicious board."
          />
        </div>
      </section>

      {/* Tagline closer */}
      <section className="container pb-24">
        <blockquote className="border-l-2 border-ink pl-6 max-w-2xl">
          <p className="font-serif text-2xl md:text-3xl italic leading-snug text-ink">
            Anyone can flag. Verification has skin in the game. The record is permanent.
          </p>
        </blockquote>
      </section>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 text-muted">
        <span className="font-mono text-xs">{number}</span>
        {icon}
      </div>
      <h3 className="font-serif text-xl mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-ink/75 leading-relaxed">{body}</p>
    </div>
  );
}
