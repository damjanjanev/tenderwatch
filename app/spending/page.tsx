"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getSpendingByMinistry,
  getTopContractors,
  getSpendingStats,
} from "@/lib/spending";
import { formatEUR } from "@/lib/utils";
import { Building2, Receipt, TrendingUp, Award } from "lucide-react";

const ACCENT = "#EAB308";
const BAR_COLOR = "#EAB308";
const BAR_MUTED = "#262626";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="border border-sand rounded-sm p-5">
      <div className="flex items-center gap-2 mb-3 text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold">{label}</span>
      </div>
      <p className="font-mono text-xl font-bold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted mt-1 truncate">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-sand rounded-sm px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink mb-1">{d.ministry}</p>
      <p className="text-accent font-mono">{formatEUR(d.totalEUR)}</p>
      <p className="text-muted">{d.contractCount} contract{d.contractCount !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default function SpendingPage() {
  const stats = getSpendingStats();
  const byMinistry = getSpendingByMinistry();
  const topContractors = getTopContractors().slice(0, 10);

  return (
    <div className="container py-12 animate-fade-in">

      {/* Header */}
      <div className="mb-10 border-b border-sand pb-8">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-3">
          Public Spending
        </p>
        <h1 className="text-3xl font-black tracking-tight text-ink mb-2">
          Where the money goes
        </h1>
        <p className="text-sm text-muted max-w-xl">
          Aggregated from {stats.totalContracts} public tenders. All figures in EUR.
          Source: e-nabavki.gov.mk
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <StatCard
          label="Total spend"
          value={formatEUR(stats.totalEUR)}
          icon={TrendingUp}
        />
        <StatCard
          label="Contracts"
          value={stats.totalContracts.toString()}
          sub="seeded tenders"
          icon={Receipt}
        />
        <StatCard
          label="Top ministry"
          value={stats.topMinistry.replace("Ministry of ", "")}
          icon={Building2}
        />
        <StatCard
          label="Avg contract"
          value={formatEUR(stats.avgContractEUR)}
          icon={Award}
        />
      </div>

      {/* Ministry bar chart */}
      <div className="mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-6">
          Spend by institution
        </p>
        <div className="border border-sand rounded-sm p-6" style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={byMinistry}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => `€${(v / 1_000_000).toFixed(1)}M`}
                tick={{ fontSize: 10, fill: "#717171" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                width={110}
                tick={{ fontSize: 11, fill: "#EDEDED" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="totalEUR" radius={[0, 2, 2, 0]}>
                {byMinistry.map((entry, index) => (
                  <Cell
                    key={entry.ministry}
                    fill={index === 0 ? BAR_COLOR : index < 4 ? "#A16207" : BAR_MUTED}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top contractors table */}
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted font-semibold mb-6">
          Top contractors by total received
        </p>
        <div className="border border-sand rounded-sm divide-y divide-sand overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 bg-surface">
            <span className="col-span-1 text-[10px] uppercase tracking-widest text-muted">#</span>
            <span className="col-span-5 text-[10px] uppercase tracking-widest text-muted">Contractor</span>
            <span className="col-span-2 text-[10px] uppercase tracking-widest text-muted text-right">Contracts</span>
            <span className="col-span-2 text-[10px] uppercase tracking-widest text-muted text-right">Total</span>
            <span className="col-span-2 text-[10px] uppercase tracking-widest text-muted text-right">Ministries</span>
          </div>
          {topContractors.map((c, i) => (
            <div
              key={c.contractor}
              className="grid grid-cols-12 px-4 py-3 hover:bg-surface/50 transition-colors"
            >
              <span className="col-span-1 font-mono text-xs text-muted">{i + 1}</span>
              <span className="col-span-5 text-sm text-ink font-medium truncate pr-4">{c.contractor}</span>
              <span className="col-span-2 font-mono text-xs text-muted text-right">{c.contractCount}</span>
              <span className="col-span-2 font-mono text-xs font-bold text-accent text-right">
                {formatEUR(c.totalEUR)}
              </span>
              <span className="col-span-2 text-xs text-muted text-right">{c.ministries.length}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted mt-8 border-t border-sand pt-6">
        Data aggregated from 25 seeded public tenders. Live data will be pulled daily from e-nabavki.gov.mk.
        All amounts in EUR at current MKD/EUR rate.
      </p>
    </div>
  );
}
