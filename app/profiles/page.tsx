"use client";

import { useState } from "react";
import Link from "next/link";
import { PROFILES } from "@/lib/profiles";
import { formatEUR } from "@/lib/utils";
import { Building2, Search, ChevronRight, AlertTriangle } from "lucide-react";

export default function ProfilesPage() {
  const [query, setQuery] = useState("");

  const filtered = PROFILES.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.party.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container py-12 animate-fade-in">

      {/* Header */}
      <div className="mb-10 border-b border-sand pb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">
          Political Profiles
        </p>
        <h1 className="text-3xl font-black tracking-tight text-ink mb-2">
          Who holds power — and what they own
        </h1>
        <p className="text-sm text-muted max-w-xl">
          Declared assets, company connections, and contractor links for elected officials
          and senior appointees. All data from public records — DKSK, CRM, SEC.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
        <input
          type="text"
          placeholder="Search by name, position, or party..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-surface border border-sand rounded-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink/30"
        />
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-surface border border-sand rounded-sm px-4 py-3 mb-8 max-w-2xl">
        <AlertTriangle className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          All displayed information consists of public records available through DKSK, SEC, and the
          Central Register. TenderWatch aggregates them — it does not produce them. Demo data only.
        </p>
      </div>

      {/* Profile grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((profile) => {
          const latestAssets = profile.assets[0];
          const flaggedCompanies = profile.companies.filter((c) => c.tenderIds.length > 0);
          const totalCompanyContracts = profile.companies.reduce(
            (sum, c) => sum + c.totalContractsEUR,
            0
          );

          return (
            <Link
              key={profile.slug}
              href={`/profiles/${profile.slug}`}
              className="border border-sand rounded-sm p-5 hover:border-ink/30 hover:bg-surface transition-all group"
            >
              {/* Name + party */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-sm text-ink group-hover:text-accent transition-colors">
                    {profile.fullName}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{profile.position}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted shrink-0 mt-0.5 group-hover:text-ink transition-colors" />
              </div>

              {/* Party badge */}
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider border border-sand text-muted px-2 py-0.5 rounded-sm mb-4">
                {profile.party}
              </span>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-sand">
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Declared</p>
                  <p className="font-mono text-xs font-bold text-ink">
                    {latestAssets ? formatEUR(latestAssets.totalEUR) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Companies</p>
                  <p className="font-mono text-xs font-bold text-ink flex items-center gap-1">
                    {profile.companies.length}
                    {profile.companies.length > 0 && (
                      <Building2 className="h-2.5 w-2.5 text-muted" />
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted mb-0.5">Linked flags</p>
                  <p className={`font-mono text-xs font-bold ${flaggedCompanies.length > 0 ? "text-oxblood" : "text-muted"}`}>
                    {flaggedCompanies.length > 0 ? `${flaggedCompanies.length} ⚑` : "0"}
                  </p>
                </div>
              </div>

              {/* Contract total if any */}
              {totalCompanyContracts > 0 && (
                <p className="text-[10px] text-muted mt-3 pt-3 border-t border-sand">
                  Connected companies received{" "}
                  <span className="text-accent font-mono font-semibold">
                    {formatEUR(totalCompanyContracts)}
                  </span>{" "}
                  in public contracts
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted py-12 text-center">No profiles match your search.</p>
      )}

      <p className="text-xs text-muted mt-10 pt-6 border-t border-sand">
        {PROFILES.length} profiles · Sources: dksk.org.mk · crm.com.mk · sec.mk
      </p>
    </div>
  );
}
