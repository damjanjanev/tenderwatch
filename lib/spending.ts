import { TENDERS } from "./tenders";

export type MinistrySpend = {
  ministry: string;
  totalEUR: number;
  contractCount: number;
  shortName: string;
};

export type TopContractor = {
  contractor: string;
  totalEUR: number;
  contractCount: number;
  ministries: string[];
};

export type SpendingStats = {
  totalEUR: number;
  totalContracts: number;
  topMinistry: string;
  topContractor: string;
  avgContractEUR: number;
};

// Shorten long ministry names for chart labels
function shortName(ministry: string): string {
  return ministry
    .replace("Ministry of ", "")
    .replace("Municipality of ", "Mun. ")
    .replace("Secretariat for ", "")
    .replace("Public Enterprise ", "")
    .replace("Public Revenue Office", "Revenue Office")
    .replace("Macedonian Radio Television", "MRT")
    .replace("General Secretariat", "Gen. Secretariat")
    .replace("Agency for Youth and Sports", "Youth & Sports")
    .replace("Customs Administration", "Customs")
    .replace("Parliament Secretariat", "Parliament");
}

export function getSpendingByMinistry(): MinistrySpend[] {
  const map = new Map<string, MinistrySpend>();
  for (const t of TENDERS) {
    const existing = map.get(t.ministry) ?? {
      ministry: t.ministry,
      shortName: shortName(t.ministry),
      totalEUR: 0,
      contractCount: 0,
    };
    map.set(t.ministry, {
      ...existing,
      totalEUR: existing.totalEUR + t.amountEUR,
      contractCount: existing.contractCount + 1,
    });
  }
  return Array.from(map.values()).sort((a, b) => b.totalEUR - a.totalEUR);
}

export function getTopContractors(): TopContractor[] {
  const map = new Map<string, TopContractor>();
  for (const t of TENDERS) {
    const existing = map.get(t.contractor) ?? {
      contractor: t.contractor,
      totalEUR: 0,
      contractCount: 0,
      ministries: [],
    };
    map.set(t.contractor, {
      ...existing,
      totalEUR: existing.totalEUR + t.amountEUR,
      contractCount: existing.contractCount + 1,
      ministries: existing.ministries.includes(t.ministry)
        ? existing.ministries
        : [...existing.ministries, t.ministry],
    });
  }
  return Array.from(map.values()).sort((a, b) => b.totalEUR - a.totalEUR);
}

export function getSpendingStats(): SpendingStats {
  const byMinistry = getSpendingByMinistry();
  const byContractor = getTopContractors();
  const totalEUR = TENDERS.reduce((sum, t) => sum + t.amountEUR, 0);
  return {
    totalEUR,
    totalContracts: TENDERS.length,
    topMinistry: byMinistry[0]?.ministry ?? "-",
    topContractor: byContractor[0]?.contractor ?? "-",
    avgContractEUR: Math.round(totalEUR / TENDERS.length),
  };
}
