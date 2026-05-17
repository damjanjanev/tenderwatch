"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-[60px] py-14">

        {/* Header */}
        <div className="mb-12 pb-10 border-b border-white/[0.06]">
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium block mb-4">
            Political Profiles
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
            Who holds power — and what they own
          </h1>
          <p className="text-[#b8b8b8] leading-relaxed max-w-xl">
            Declared assets, company connections, and contractor links for elected officials and senior appointees.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, position, or party..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-white/[0.08] text-white placeholder:text-white/30 focus:outline-none focus:border-[#0084ff]/40 transition-colors"
            style={{ background: "rgba(255,255,255,0.03)" }}
          />
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 px-5 py-4 mb-10 max-w-2xl rounded-lg border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
          <AlertTriangle className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
          <p className="text-sm text-white/50 leading-relaxed">
            All information consists of public records from DKSK, SEC, and the Central Register.
            contr aggregates them — it does not produce them.{" "}
            <span className="text-white/30">Demo data for illustration purposes.</span>
          </p>
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((profile) => {
            const latestAssets = profile.assets[0];
            const flaggedCompanies = profile.companies.filter((c) => c.tenderIds.length > 0);
            const totalCompanyContracts = profile.companies.reduce((sum, c) => sum + c.totalContractsEUR, 0);

            return (
              <Link
                key={profile.slug}
                href={`/profiles/${profile.slug}`}
                className="block rounded-xl border border-white/[0.06] p-6 group transition-all hover:border-[#0084ff]/30"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <Image src={profile.avatarUrl} alt={profile.fullName} width={40} height={40} className="rounded-full shrink-0 border border-white/10" unoptimized />
                    ) : (
                      <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white/40 border border-white/10" style={{ background: "rgba(0,132,255,0.1)" }}>
                        {profile.fullName.slice(0, 1)}
                      </div>
                    )}
                    <p className="font-medium text-base text-white group-hover:text-[#0084ff] transition-colors leading-snug">
                      {profile.fullName}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/30 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                </div>

                <p className="text-sm text-white/50 mb-4 leading-snug">{profile.position}</p>

                <span className="inline-block text-[11px] font-semibold uppercase tracking-wider border border-white/[0.08] text-white/40 px-2.5 py-1 rounded-md mb-5">
                  {profile.party}
                </span>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
                  <div>
                    <p className="text-[11px] text-white/40 mb-1">Declared</p>
                    <p className="font-mono text-sm font-bold text-white">{latestAssets ? formatEUR(latestAssets.totalEUR) : "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40 mb-1">Companies</p>
                    <p className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
                      {profile.companies.length}
                      {profile.companies.length > 0 && <Building2 className="h-3 w-3 text-white/30" />}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-white/40 mb-1">Flagged</p>
                    <p className={`font-mono text-sm font-bold ${flaggedCompanies.length > 0 ? "text-red-400" : "text-white/30"}`}>
                      {flaggedCompanies.length > 0 ? `${flaggedCompanies.length} ⚑` : "0"}
                    </p>
                  </div>
                </div>

                {totalCompanyContracts > 0 && (
                  <p className="text-xs text-white/40 mt-4 pt-4 border-t border-white/[0.06] leading-relaxed">
                    Connected companies received{" "}
                    <span className="font-mono font-semibold text-[#0084ff]">{formatEUR(totalCompanyContracts)}</span>{" "}
                    in public contracts
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-white/40 py-16 text-center">No profiles match your search.</p>
        )}

        <p className="text-sm text-white/30 mt-12 pt-6 border-t border-white/[0.06]">
          {PROFILES.length} profiles · Sources:{" "}
          <a href="https://dksk.org.mk" target="_blank" className="hover:text-white underline">dksk.org.mk</a>{" · "}
          <a href="https://crm.com.mk" target="_blank" className="hover:text-white underline">crm.com.mk</a>{" · "}
          <a href="https://sec.mk" target="_blank" className="hover:text-white underline">sec.mk</a>
        </p>
      </div>
    </div>
  );
}
