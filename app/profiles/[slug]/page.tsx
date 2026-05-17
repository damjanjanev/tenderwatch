"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/profiles";
import { TENDERS } from "@/lib/tenders";
import { formatEUR, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ArrowLeft, ExternalLink, Building2, AlertTriangle, Calendar } from "lucide-react";

const AssetTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/[0.10] px-4 py-3 text-sm shadow-lg" style={{ background: "#0d1425" }}>
      <p className="font-semibold text-white mb-2">{d.year}</p>
      <p className="text-white/50">Real estate: <span className="text-white font-mono">{formatEUR(d.realEstateEUR)}</span></p>
      <p className="text-white/50">Vehicles: <span className="text-white font-mono">{formatEUR(d.vehiclesEUR)}</span></p>
      <p className="text-white/50">Bank: <span className="text-white font-mono">{formatEUR(d.bankEUR)}</span></p>
      <p className="text-[#0084ff] font-mono font-bold mt-2">Total: {formatEUR(d.totalEUR)}</p>
    </div>
  );
};

export default function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const profile = getProfile(slug);
  if (!profile) return notFound();

  const latestAssets = profile.assets[0];
  const assetGrowth = profile.assets.length >= 2
    ? ((profile.assets[0].totalEUR - profile.assets[profile.assets.length - 1].totalEUR) /
        profile.assets[profile.assets.length - 1].totalEUR * 100).toFixed(0)
    : null;

  const flaggedCompanies = profile.companies.filter((c) => c.tenderIds.length > 0);

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-14">

        {/* Back */}
        <Link
          href="/profiles"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All profiles
        </Link>

        {/* Header card */}
        <div className="rounded-xl border border-white/[0.06] p-8 mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  width={80}
                  height={80}
                  className="rounded-full shrink-0 border-2 border-white/[0.10]"
                  unoptimized
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-2 border-white/[0.10] shrink-0 flex items-center justify-center text-2xl font-bold text-white/30" style={{ background: "rgba(255,255,255,0.04)" }}>
                  {profile.fullName.slice(0, 1)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-light tracking-tight text-white mb-2">
                  {profile.fullName}
                </h1>
                <p className="text-base text-white/50 mb-4">{profile.position}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-medium uppercase tracking-wider border border-white/[0.10] text-white/40 px-3 py-1 rounded-md">
                    {profile.party}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-white/40">
                    <Calendar className="h-3.5 w-3.5" />
                    In office since {formatDate(profile.inOfficeFrom)}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={profile.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              DKSK source
            </a>
          </div>

          {/* Key stats */}
          {latestAssets && (
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/[0.06]">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Declared ({latestAssets.year})</p>
                <p className="font-mono text-2xl font-light text-white">{formatEUR(latestAssets.totalEUR)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Asset growth</p>
                <p className={`font-mono text-2xl font-light ${assetGrowth && parseInt(assetGrowth) > 20 ? "text-red-400" : "text-white"}`}>
                  {assetGrowth ? `+${assetGrowth}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Flagged connections</p>
                <p className={`font-mono text-2xl font-light ${flaggedCompanies.length > 0 ? "text-red-400" : "text-white/30"}`}>
                  {flaggedCompanies.length > 0 ? `${flaggedCompanies.length} ⚑` : "0"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Flag alert */}
        {flaggedCompanies.length > 0 && (
          <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-5 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-medium text-white mb-1">
                Companies connected to this official have flagged tenders
              </p>
              <p className="text-sm text-white/50">
                {flaggedCompanies.map((c) => c.companyName).join(", ")} —{" "}
                {flaggedCompanies.reduce((sum, c) => sum + c.tenderIds.length, 0)} flagged tender
                {flaggedCompanies.reduce((sum, c) => sum + c.tenderIds.length, 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Asset timeline */}
          <div>
            <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-4">
              Declared assets over time
            </p>

            <div className="rounded-xl border border-white/[0.06] p-5 mb-4" style={{ height: 220, background: "rgba(255,255,255,0.02)" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...profile.assets].reverse()} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false} tickLine={false} width={50}
                  />
                  <Tooltip content={<AssetTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="totalEUR" radius={[4, 4, 0, 0]}>
                    {[...profile.assets].reverse().map((entry, i, arr) => (
                      <Cell key={entry.year} fill={i === arr.length - 1 ? "#0084ff" : "rgba(0,132,255,0.25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Asset breakdown table */}
            <div className="rounded-xl border border-white/[0.06] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="grid grid-cols-4 px-4 py-3 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Year", "Real estate", "Vehicles", "Bank"].map((h) => (
                  <span key={h} className="text-xs uppercase tracking-wider text-white/30 font-medium">{h}</span>
                ))}
              </div>
              {profile.assets.map((a) => (
                <div key={a.year} className="grid grid-cols-4 px-4 py-3 text-sm border-b border-white/[0.04] last:border-0">
                  <span className="font-mono text-white/40">{a.year}</span>
                  <span className="font-mono text-white/70">{formatEUR(a.realEstateEUR)}</span>
                  <span className="font-mono text-white/70">{formatEUR(a.vehiclesEUR)}</span>
                  <span className="font-mono text-white/70">{formatEUR(a.bankEUR)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company connections */}
          <div>
            <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-4">
              Company connections
            </p>

            {profile.companies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                <p className="text-base text-white/30">No declared company connections.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)" }}>
                {profile.companies.map((company) => {
                  const linkedTenders = TENDERS.filter((t) => company.tenderIds.includes(t.id));
                  const hasFlaggedTenders = company.tenderIds.length > 0;

                  return (
                    <div key={company.companyName} className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Building2 className={`h-4 w-4 shrink-0 ${hasFlaggedTenders ? "text-red-400" : "text-white/30"}`} />
                          <span className="text-base font-medium text-white">{company.companyName}</span>
                        </div>
                        {hasFlaggedTenders && (
                          <span className="text-xs font-bold text-red-400 shrink-0">⚑ Flagged</span>
                        )}
                      </div>

                      <p className="text-sm text-white/40 mb-2">
                        {company.relation}
                        {company.relatedName && ` — ${company.relatedName}`}
                      </p>

                      {company.totalContractsEUR > 0 && (
                        <p className="text-sm text-white/40">
                          Received{" "}
                          <span className="font-mono font-semibold text-[#0084ff]">
                            {formatEUR(company.totalContractsEUR)}
                          </span>{" "}
                          across {company.contractCount} public contract{company.contractCount !== 1 ? "s" : ""}
                        </p>
                      )}

                      {linkedTenders.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {linkedTenders.map((t) => (
                            <Link
                              key={t.id}
                              href={`/tenders/${t.id}`}
                              className="flex items-center gap-2 text-sm text-white/30 hover:text-white transition-colors group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                              <span className="truncate group-hover:underline">{t.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 text-xs text-white/20 space-y-1">
              <p>Asset data: <a href="https://dksk.org.mk" target="_blank" className="hover:text-white underline">dksk.org.mk</a></p>
              <p>Company data: <a href="https://crm.com.mk" target="_blank" className="hover:text-white underline">crm.com.mk</a></p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-white/[0.06]">
          <p className="text-sm text-white/20">
            Profiles contain publicly available records. contr does not assert illegal conduct.
            For legal matters, consult the source documents. This is demo data only.
          </p>
        </div>
      </div>
    </div>
  );
}
