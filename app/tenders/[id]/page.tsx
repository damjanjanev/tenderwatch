"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FlagModal } from "@/components/FlagModal";
import { FlagList } from "@/components/FlagList";
import { getTender } from "@/lib/tenders";
import { useTenderFlags } from "@/lib/store";
import { getProfilesForContractor } from "@/lib/profiles";
import { formatEUR, formatDate } from "@/lib/utils";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";

export default function TenderDetailPage() {
  const params = useParams<{ id: string }>();
  const tender = getTender(params.id);
  const flags = useTenderFlags(params.id);

  if (!tender) return notFound();

  const verified = flags.find((f) => f.status === "VerifiedSuspicious");
  const communityFlagged = !verified && flags.some((f) => f.status === "Pending");
  const linkedProfiles = getProfilesForContractor(tender.contractor);

  return (
    <div className="container py-12 max-w-3xl animate-fade-in">
      <Link
        href="/tenders"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-8"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all tenders
      </Link>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="outline" className="font-mono normal-case tracking-normal">
          {tender.id}
        </Badge>
        <Badge variant="default" className="normal-case tracking-normal">
          {tender.ministry}
        </Badge>
        {verified && <Badge variant="suspicious">Verified Suspicious</Badge>}
        {communityFlagged && <Badge variant="pending">Community Flagged</Badge>}
      </div>

      <h1 className="font-serif text-3xl md:text-4xl leading-tight tracking-tight mb-6">
        {tender.title}
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 pb-8 border-b border-sand">
        <Meta label="Amount" value={formatEUR(tender.amountEUR)} mono />
        <Meta label="Contractor" value={tender.contractor} />
        <Meta label="Published" value={formatDate(tender.publishedAt)} />
        <Meta label="Deadline" value={formatDate(tender.deadline)} />
      </div>

      {/* Cross-reference banner */}
      {linkedProfiles.length > 0 && (
        <div className="border border-oxblood/40 bg-oxblood/5 rounded-sm p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-oxblood shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink mb-1">
              This contractor is connected to a political profile
            </p>
            <div className="space-y-0.5">
              {linkedProfiles.map((profile) => {
                const link = profile.companies.find(
                  (c) => c.companyName.toLowerCase() === tender.contractor.toLowerCase()
                );
                return (
                  <p key={profile.slug} className="text-xs text-muted">
                    <Link href={`/profiles/${profile.slug}`} className="text-oxblood hover:underline font-semibold">
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

      <article className="font-serif text-lg leading-relaxed text-ink/90 mb-10">
        {tender.description}
      </article>

      <div className="flex flex-wrap items-center gap-4 mb-12">
        <FlagModal tenderId={tender.id} />
        <Button asChild variant="outline">
          <a href={tender.sourceUrl} target="_blank" rel="noreferrer">
            Original source <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>

      <Separator />

      <section className="py-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl tracking-tight">
            Public flags ({flags.length})
          </h2>
        </div>
        <FlagList flags={flags} />
      </section>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted mb-1">{label}</div>
      <div className={mono ? "font-mono font-tabular text-base" : "text-sm"}>{value}</div>
    </div>
  );
}
