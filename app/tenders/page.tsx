"use client";

import { useState, useMemo } from "react";
import { TENDERS, getMinistries } from "@/lib/tenders";
import { PROFILES } from "@/lib/profiles";
import { useAllTenderReports, getTenderReportStatus } from "@/lib/tenderReports";
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

  const allReports = useAllTenderReports();

  // Build suspiciousSet: tenderIds that are VerifiedSuspicious or UnderReview
  const suspiciousSet = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    // Group reports by tenderId
    const byTender = new Map<string, typeof allReports>();
    for (const report of allReports) {
      const existing = byTender.get(report.tenderId) ?? [];
      existing.push(report);
      byTender.set(report.tenderId, existing);
    }
    for (const [tenderId, reports] of byTender) {
      const status = getTenderReportStatus(reports);
      if (status === "VerifiedSuspicious" || status === "UnderReview") {
        set.add(tenderId);
      }
    }
    return set;
  }, [allReports]);

  // Build politicalSet: tenderIds where a PROFILE has a company matching the contractor
  const politicalSet = useMemo<Set<string>>(() => {
    // Build a lookup: companyName (lowercase) -> true
    const linkedCompanies = new Set<string>();
    for (const profile of PROFILES) {
      for (const company of profile.companies) {
        linkedCompanies.add(company.companyName.toLowerCase());
      }
    }
    const set = new Set<string>();
    for (const tender of TENDERS) {
      if (linkedCompanies.has(tender.contractor.toLowerCase())) {
        set.add(tender.id);
      }
    }
    return set;
  }, []);

  const filtered = useMemo(
    () => applyFilters(TENDERS, filters, suspiciousSet, politicalSet),
    [filters, suspiciousSet, politicalSet]
  );

  return (
    <div className="min-h-screen bg-[#080c1a] text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "radial-gradient(ellipse at 15% 0%, rgba(0,132,255,0.07) 0%, transparent 55%)" }} />
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-[60px] py-14">

        <div className="mb-12">
          <span className="text-[#0084ff] text-[11px] uppercase tracking-[0.25em] font-medium block mb-4">
            Public contracts
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
            Government contracts
          </h1>
          <p className="text-[#b8b8b8] leading-relaxed max-w-2xl">
            {TENDERS.length} contracts indexed. Click any entry to see details and flag it if something looks wrong.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          <TenderFilters filters={filters} setFilters={setFilters} ministries={ministries} />
          <div>
            <div className="text-sm text-white/40 mb-5 font-mono">
              Showing {filtered.length} of {TENDERS.length} contracts
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-16 text-center">
                <p className="text-white/40">No contracts match these filters.</p>
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
    </div>
  );
}
