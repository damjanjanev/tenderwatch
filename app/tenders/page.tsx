"use client";

import { useState, useMemo } from "react";
import { TENDERS, getMinistries } from "@/lib/tenders";
import { TenderCard } from "@/components/TenderCard";
import {
  TenderFilters,
  DEFAULT_FILTERS,
  applyFilters,
  type FilterState,
} from "@/components/TenderFilters";

export default function TendersPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const ministries = useMemo(() => getMinistries(), []);
  const filtered = useMemo(() => applyFilters(TENDERS, filters), [filters]);

  return (
    <div className="container py-12 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-muted mb-3">
          Public tenders
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-3">
          Browse government contracts
        </h1>
        <p className="text-muted max-w-2xl">
          {TENDERS.length} tenders indexed. Click any contract to see the details and
          flag it if something looks wrong.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <TenderFilters filters={filters} setFilters={setFilters} ministries={ministries} />
        <div>
          <div className="text-sm text-muted mb-4">
            Showing {filtered.length} of {TENDERS.length} tenders
          </div>
          {filtered.length === 0 ? (
            <div className="border border-dashed border-sand rounded-md p-12 text-center">
              <p className="text-muted">No tenders match these filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <TenderCard key={t.id} tender={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
