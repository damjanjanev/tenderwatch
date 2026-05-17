"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Tender } from "@/lib/tenders";
import { Search, X } from "lucide-react";

export type FilterState = {
  search: string;
  ministry: string;
  minAmount: number;
  maxAmount: number;
  onlySuspicious: boolean;
  onlyPoliticalConnections: boolean;
};

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  ministry: "",
  minAmount: 0,
  maxAmount: 10_000_000,
  onlySuspicious: false,
  onlyPoliticalConnections: false,
};

export function TenderFilters({
  filters,
  setFilters,
  ministries,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  ministries: string[];
}) {
  const update = (patch: Partial<FilterState>) => setFilters({ ...filters, ...patch });
  const isDirty =
    filters.search !== "" ||
    filters.ministry !== "" ||
    filters.minAmount !== 0 ||
    filters.maxAmount !== 10_000_000 ||
    filters.onlySuspicious ||
    filters.onlyPoliticalConnections;

  return (
    <aside className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-wider text-muted mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Title, contractor, ministry…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-muted mb-2">
          Ministry
        </label>
        <select
          value={filters.ministry}
          onChange={(e) => update({ ministry: e.target.value })}
          className="w-full h-9 rounded-md border border-sand bg-surface px-3 text-sm"
        >
          <option value="">All ministries</option>
          {ministries.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-muted mb-2">
          Amount range (EUR)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="0"
            value={filters.minAmount || ""}
            onChange={(e) => update({ minAmount: Number(e.target.value) || 0 })}
          />
          <span className="text-muted">—</span>
          <Input
            type="number"
            placeholder="10M"
            value={filters.maxAmount === 10_000_000 ? "" : filters.maxAmount}
            onChange={(e) => update({ maxAmount: Number(e.target.value) || 10_000_000 })}
          />
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-sand">
        <label className="block text-xs uppercase tracking-wider text-muted mb-2">
          Special filters
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.onlySuspicious}
            onChange={(e) => update({ onlySuspicious: e.target.checked })}
            className="h-4 w-4 rounded border-sand accent-oxblood cursor-pointer"
          />
          <span
            className={`text-sm font-medium transition-colors ${
              filters.onlySuspicious ? "text-oxblood" : "text-ink/70 group-hover:text-ink"
            }`}
          >
            ⚠ Suspicious tenders only
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.onlyPoliticalConnections}
            onChange={(e) => update({ onlyPoliticalConnections: e.target.checked })}
            className="h-4 w-4 rounded border-sand accent-amber-600 cursor-pointer"
          />
          <span
            className={`text-sm font-medium transition-colors ${
              filters.onlyPoliticalConnections
                ? "text-amber-700"
                : "text-ink/70 group-hover:text-ink"
            }`}
          >
            🏛 Political connections only
          </span>
        </label>
      </div>

      {isDirty && (
        <Button variant="ghost" size="sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
          <X className="h-3 w-3 mr-1" />
          Clear filters
        </Button>
      )}
    </aside>
  );
}

export function applyFilters(
  tenders: Tender[],
  f: FilterState,
  suspiciousSet?: Set<string>,
  politicalSet?: Set<string>
): Tender[] {
  const q = f.search.toLowerCase();
  return tenders.filter((t) => {
    if (q && !`${t.title} ${t.contractor} ${t.ministry} ${t.id}`.toLowerCase().includes(q))
      return false;
    if (f.ministry && t.ministry !== f.ministry) return false;
    if (t.amountEUR < f.minAmount) return false;
    if (t.amountEUR > f.maxAmount) return false;
    if (f.onlySuspicious && suspiciousSet && !suspiciousSet.has(t.id)) return false;
    if (f.onlyPoliticalConnections && politicalSet && !politicalSet.has(t.id)) return false;
    return true;
  });
}
