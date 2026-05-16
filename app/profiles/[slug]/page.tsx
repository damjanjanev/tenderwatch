"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfile } from "@/lib/profiles";
import { TENDERS } from "@/lib/tenders";
import { formatEUR, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  ArrowLeft, ExternalLink, Building2, AlertTriangle, Calendar,
} from "lucide-react";

const AssetTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-sand rounded-sm px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink mb-1">{d.year}</p>
      <p className="text-muted">Real estate: <span className="text-ink font-mono">{formatEUR(d.realEstateEUR)}</span></p>
      <p className="text-muted">Vehicles: <span className="text-ink font-mono">{formatEUR(d.vehiclesEUR)}</span></p>
      <p className="text-muted">Bank: <span className="text-ink font-mono">{formatEUR(d.bankEUR)}</span></p>
      <p className="text-accent font-mono font-bold mt-1">Total: {formatEUR(d.totalEUR)}</p>
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
    <div className="container py-12 max-w-4xl animate-fade-in">

      {/* Back */}
      <Link
        href="/profiles"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All profiles
      </Link>

      {/* Header */}
      <div className="border border-sand rounded-sm p-6 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-ink mb-1">
              {profile.fullName}
            </h1>
            <p className="text-sm text-muted mb-3">{profile.position}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider border border-sand text-muted px-2 py-0.5 rounded-sm">
                {profile.party}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <Calendar className="h-3 w-3" />
                In office since {formatDate(profile.inOfficeFrom)}
              </span>
            </div>
          </div>
          <a
            href={profile.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            DKSK source
          </a>
        </div>

        {/* Key stats */}
        {latestAssets && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-sand">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Declared ({latestAssets.year})</p>
              <p className="font-mono text-lg font-bold text-ink">{formatEUR(latestAssets.totalEUR)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Asset growth</p>
              <p className={`font-mono text-lg font-bold ${assetGrowth && parseInt(assetGrowth) > 20 ? "text-oxblood" : "text-ink"}`}>
                {assetGrowth ? `+${assetGrowth}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted mb-1">Flagged connections</p>
              <p className={`font-mono text-lg font-bold ${flaggedCompanies.length > 0 ? "text-oxblood" : "text-muted"}`}>
                {flaggedCompanies.length > 0 ? `${flaggedCompanies.length} ⚑` : "0"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Flag alert */}
      {flaggedCompanies.length > 0 && (
        <div className="border border-oxblood/40 bg-oxblood/5 rounded-sm p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-oxblood shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink mb-1">
              Companies connected to this official have flagged tenders
            </p>
            <p className="text-xs text-muted">
              {flaggedCompanies.map((c) => c.companyName).join(", ")} —{" "}
              {flaggedCompanies.reduce((sum, c) => sum + c.tenderIds.length, 0)} flagged tender{flaggedCompanies.reduce((sum, c) => sum + c.tenderIds.length, 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Asset timeline */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-4">
            Declared assets over time
          </p>
          <div className="border border-sand rounded-sm p-5" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...profile.assets].reverse()} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#717171" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 9, fill: "#717171" }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip content={<AssetTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="totalEUR" radius={[2, 2, 0, 0]}>
                  {[...profile.assets].reverse().map((entry, i, arr) => (
                    <Cell
                      key={entry.year}
                      fill={i === arr.length - 1 ? "#EAB308" : "#262626"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Asset breakdown table */}
          <div className="border border-sand rounded-sm divide-y divide-sand mt-4 overflow-hidden">
            <div className="grid grid-cols-4 px-3 py-2 bg-surface">
              {["Year", "Real estate", "Vehicles", "Bank"].map((h) => (
                <span key={h} className="text-[10px] uppercase tracking-widest text-muted">{h}</span>
              ))}
            </div>
            {profile.assets.map((a) => (
              <div key={a.year} className="grid grid-cols-4 px-3 py-2 text-xs">
                <span className="font-mono text-muted">{a.year}</span>
                <span className="font-mono text-ink">{formatEUR(a.realEstateEUR)}</span>
                <span className="font-mono text-ink">{formatEUR(a.vehiclesEUR)}</span>
                <span className="font-mono text-ink">{formatEUR(a.bankEUR)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company connections */}
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-4">
            Company connections
          </p>

          {profile.companies.length === 0 ? (
            <div className="border border-sand rounded-sm p-6 text-center">
              <p className="text-sm text-muted">No declared company connections.</p>
            </div>
          ) : (
            <div className="border border-sand rounded-sm divide-y divide-sand overflow-hidden">
              {profile.companies.map((company) => {
                const linkedTenders = TENDERS.filter((t) =>
                  company.tenderIds.includes(t.id)
                );
                const hasFlaggedTenders = company.tenderIds.length > 0;

                return (
                  <div key={company.companyName} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className={`h-3.5 w-3.5 shrink-0 ${hasFlaggedTenders ? "text-oxblood" : "text-muted"}`} />
                        <span className="text-sm font-semibold text-ink">{company.companyName}</span>
                      </div>
                      {hasFlaggedTenders && (
                        <span className="text-[10px] font-bold text-oxblood shrink-0">⚑ Flagged</span>
                      )}
                    </div>

                    <p className="text-xs text-muted mb-1">
                      {company.relation}
                      {company.relatedName && ` — ${company.relatedName}`}
                    </p>

                    {company.totalContractsEUR > 0 && (
                      <p className="text-xs text-muted">
                        Received{" "}
                        <span className="font-mono font-semibold text-accent">
                          {formatEUR(company.totalContractsEUR)}
                        </span>{" "}
                        across {company.contractCount} public contract{company.contractCount !== 1 ? "s" : ""}
                      </p>
                    )}

                    {linkedTenders.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {linkedTenders.map((t) => (
                          <Link
                            key={t.id}
                            href={`/tenders/${t.id}`}
                            className="flex items-center gap-2 text-xs text-muted hover:text-ink transition-colors group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-oxblood shrink-0" />
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

          {/* Source note */}
          <div className="mt-4 text-[10px] text-muted space-y-0.5">
            <p>Asset data: <a href="https://dksk.org.mk" target="_blank" className="hover:text-ink underline">dksk.org.mk</a></p>
            <p>Company data: <a href="https://crm.com.mk" target="_blank" className="hover:text-ink underline">crm.com.mk</a></p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-10 pt-6 border-t border-sand">
        <p className="text-xs text-muted">
          Profiles contain publicly available records. TenderWatch does not assert illegal conduct.
          For legal matters, consult the source documents. This is demo data only.
        </p>
      </div>
    </div>
  );
}
