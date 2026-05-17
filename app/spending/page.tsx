"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Legend,
} from "recharts";
import {
  getSpendingByMinistry,
  getTopContractors,
  getSpendingStats,
  getContractsByContractor,
  BUDGET_HISTORY,
} from "@/lib/spending";
import { formatEUR } from "@/lib/utils";
import { Building2, Receipt, TrendingUp, Award, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card-solid px-4 py-3 text-sm shadow-lg">
      <p className="font-semibold text-ink mb-1">{d.ministry}</p>
      <p className="text-accent font-mono font-bold">{formatEUR(d.totalEUR)}</p>
      <p className="text-muted">{d.contractCount} contract{d.contractCount !== 1 ? "s" : ""}</p>
    </div>
  );
};

const YoYTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-solid px-4 py-3 text-sm shadow-lg">
      <p className="font-semibold text-ink mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-mono" style={{ color: p.fill }}>
          {p.name}: {formatEUR(p.value)}
        </p>
      ))}
    </div>
  );
};

function StatCard({
  label, value, sub, icon: Icon,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-[#0084ff]/20 transition-colors">
      <div className="flex items-center gap-2 mb-4 text-white/40">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">{label}</span>
      </div>
      <p className="font-mono text-2xl font-bold text-white tabular-nums">{value}</p>
      {sub && <p className="text-sm text-white/40 mt-1 truncate">{sub}</p>}
    </div>
  );
}

// Build year-over-year grouped chart data
function buildYoYData() {
  const h2024 = BUDGET_HISTORY[0];
  const h2025 = BUDGET_HISTORY[1];
  const ministries = Object.keys(h2025.byMinistry);
  return ministries.map((m) => ({
    ministry: m,
    "2024": h2024.byMinistry[m] ?? 0,
    "2025": h2025.byMinistry[m] ?? 0,
  }));
}

// Build top-5 allocation cards from 2025 data
function buildAllocationData() {
  const h2025 = BUDGET_HISTORY[1];
  const entries = Object.entries(h2025.byMinistry)
    .map(([name, eur]) => ({ name, eur }))
    .sort((a, b) => b.eur - a.eur)
    .slice(0, 5);
  const total = Object.values(h2025.byMinistry).reduce((s, v) => s + v, 0);
  return { entries, total };
}

// Fake tenders for contractors with no real TENDERS data
const FAKE_TENDERS: Record<string, { id: string; title: string; ministry: string; amountEUR: number }[]> = {
  "Multiple regional contractors": [
    { id: "FAKE-001", title: "Winter road maintenance Region Vardar 2026/27", ministry: "Ministry of Transport", amountEUR: 740_000 },
    { id: "FAKE-002", title: "Road gritting services — Pelagonia region", ministry: "Ministry of Transport", amountEUR: 490_000 },
    { id: "FAKE-003", title: "Emergency snow clearance — Polog mountain roads", ministry: "Ministry of Transport", amountEUR: 380_000 },
  ],
  "Multiple framework partners": [
    { id: "FAKE-010", title: "Legal translation — EU Chapter 23 documents", ministry: "Secretariat for European Affairs", amountEUR: 98_000 },
    { id: "FAKE-011", title: "Technical translation — environmental acquis alignment", ministry: "Secretariat for European Affairs", amountEUR: 112_000 },
  ],
};

export default function SpendingPage() {
  const stats = getSpendingStats();
  const byMinistry = getSpendingByMinistry();
  const topContractors = getTopContractors().slice(0, 10);
  const yoyData = buildYoYData();
  const { entries: allocationEntries, total: allocationTotal } = buildAllocationData();

  const [expandedContractor, setExpandedContractor] = useState<string | null>(null);

  function toggleContractor(name: string) {
    setExpandedContractor((prev) => (prev === name ? null : name));
  }

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 80% 0%, rgba(0,132,255,0.06) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-[60px] py-14">

        {/* Header */}
        <div className="mb-12 pb-10 border-b border-white/[0.06]">
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium block mb-4">
            Public Spending
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
            Where the money goes
          </h1>
          <p className="text-[#b8b8b8] leading-relaxed max-w-xl">
            Aggregated from {stats.totalContracts} public tenders. All figures in EUR.
            Source: e-nabavki.gov.mk
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          <StatCard label="Total spend" value={formatEUR(stats.totalEUR)} icon={TrendingUp} />
          <StatCard label="Contracts" value={stats.totalContracts.toString()} sub="seeded tenders" icon={Receipt} />
          <StatCard label="Top ministry" value={stats.topMinistry.replace("Ministry of ", "")} icon={Building2} />
          <StatCard label="Avg contract" value={formatEUR(stats.avgContractEUR)} icon={Award} />
        </div>

        {/* Ministry bar chart */}
        <div className="mb-14">
          <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-6">
            Spend by institution
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6" style={{ height: 440 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMinistry} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" tickFormatter={(v) => `€${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 12, fill: "#ffffff50" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="shortName" width={120} tick={{ fontSize: 12, fill: "#b8b8b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,132,255,0.05)" }} />
                <Bar dataKey="totalEUR" radius={[0, 3, 3, 0]}>
                  {byMinistry.map((entry, index) => (
                    <Cell key={entry.ministry} fill={index === 0 ? "#0084ff" : index < 4 ? "#0054a3" : "#1a2a4a"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year-over-year comparison */}
        <div className="mb-14">
          <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-2">
            Year-over-year comparison
          </p>
          <p className="text-sm text-white/40 mb-6">Budget allocation 2024 vs 2025 by ministry sector</p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6" style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                <XAxis type="number" tickFormatter={(v) => `€${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 12, fill: "#ffffff50" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="ministry" width={90} tick={{ fontSize: 11, fill: "#b8b8b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<YoYTooltip />} cursor={{ fill: "rgba(0,132,255,0.05)" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(value) => <span style={{ color: "#b8b8b8", fontSize: 12 }}>{value}</span>} />
                <Bar dataKey="2024" fill="#1a2a4a" radius={[0, 2, 2, 0]} />
                <Bar dataKey="2025" fill="#0084ff" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Allocation 2025 */}
        <div className="mb-14">
          <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-6">
            Budget allocation 2025
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allocationEntries.map((entry, i) => {
              const pct = Math.round((entry.eur / allocationTotal) * 100);
              return (
                <div key={entry.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/30 w-5">{i + 1}</span>
                      <span className="text-sm font-medium text-white">{entry.name}</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#0084ff]">{formatEUR(entry.eur)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: i === 0 ? "#0084ff" : i < 3 ? "#0054a3" : "#1a2a4a" }} />
                    </div>
                    <span className="font-mono text-xs text-white/40 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top contractors table */}
        <div>
          <p className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium mb-6">
            Top contractors by total received
          </p>
          <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <span className="col-span-1 text-[11px] uppercase tracking-wider text-white/40 font-semibold">#</span>
              <span className="col-span-5 text-[11px] uppercase tracking-wider text-white/40 font-semibold">Contractor</span>
              <span className="col-span-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold text-right">Contracts</span>
              <span className="col-span-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold text-right">Total</span>
              <span className="col-span-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold text-right">Ministries</span>
            </div>
            {topContractors.map((c, i) => {
              const isExpanded = expandedContractor === c.contractor;
              const realTenders = getContractsByContractor(c.contractor);
              const fakeTenders = FAKE_TENDERS[c.contractor] ?? [];
              const tenderList = realTenders.length > 0 ? realTenders : null;

              return (
                <div key={c.contractor} className="border-b border-white/[0.04] last:border-0">
                  <button onClick={() => toggleContractor(c.contractor)} className="w-full grid grid-cols-12 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left">
                    <span className="col-span-1 font-mono text-sm text-white/40">{i + 1}</span>
                    <span className="col-span-5 text-sm text-white font-medium truncate pr-4 flex items-center gap-2">
                      {c.contractor}
                      {isExpanded ? <ChevronUp className="h-3 w-3 text-white/40 shrink-0" /> : <ChevronDown className="h-3 w-3 text-white/40 shrink-0" />}
                    </span>
                    <span className="col-span-2 font-mono text-sm text-white/50 text-right">{c.contractCount}</span>
                    <span className="col-span-2 font-mono text-sm font-bold text-[#0084ff] text-right">{formatEUR(c.totalEUR)}</span>
                    <span className="col-span-2 text-sm text-white/50 text-right">{c.ministries.length}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/[0.04]" style={{ background: "rgba(0,132,255,0.03)" }}>
                      <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold pt-4 mb-3">
                        {tenderList ? "Contracts in database" : "Example contracts"}
                      </p>
                      <div className="space-y-2">
                        {tenderList
                          ? tenderList.map((t) => (
                              <Link key={t.id} href={`/tenders/${t.id}`} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-white/[0.06] hover:border-[#0084ff]/30 hover:bg-white/[0.02] transition-all group">
                                <div className="min-w-0">
                                  <p className="text-xs font-mono text-white/30 mb-0.5">{t.id}</p>
                                  <p className="text-sm text-white truncate group-hover:text-[#0084ff] transition-colors">{t.title.length > 64 ? t.title.slice(0, 64) + "…" : t.title}</p>
                                  <p className="text-xs text-white/40 mt-0.5">{t.ministry}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono text-sm font-bold text-[#0084ff]">{formatEUR(t.amountEUR)}</span>
                                  <ExternalLink className="h-3 w-3 text-white/30 group-hover:text-white transition-colors" />
                                </div>
                              </Link>
                            ))
                          : fakeTenders.map((t) => (
                              <div key={t.id} className="flex items-start justify-between gap-4 p-3 rounded-lg border border-white/[0.04]">
                                <div className="min-w-0">
                                  <p className="text-xs font-mono text-white/20 mb-0.5">{t.id}</p>
                                  <p className="text-sm text-white/50 truncate">{t.title.length > 64 ? t.title.slice(0, 64) + "…" : t.title}</p>
                                  <p className="text-xs text-white/30 mt-0.5">{t.ministry}</p>
                                </div>
                                <span className="font-mono text-sm font-bold text-white/30 shrink-0">{formatEUR(t.amountEUR)}</span>
                              </div>
                            ))}
                      </div>
                      {!tenderList && <p className="text-xs text-white/30 mt-3 italic">Example contracts — live data will include all awarded tenders.</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-white/30 mt-10 pt-6 border-t border-white/[0.06]">
          Data aggregated from 25 seeded public tenders. Live data will be pulled daily from e-nabavki.gov.mk. All amounts in EUR.
        </p>
      </div>
    </div>
  );
}
