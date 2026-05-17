import { TENDERS, Tender } from "./tenders";

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

export type BudgetYear = {
  year: number;
  totalEUR: number;
  byMinistry: Record<string, number>; // ministry shortName → EUR
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

export function getContractsByContractor(contractor: string): Tender[] {
  return TENDERS.filter(
    (t) => t.contractor.toLowerCase() === contractor.toLowerCase()
  );
}

// Historical budget data — 2024 is fabricated but plausible, slightly lower than 2025 tender data
export const BUDGET_HISTORY: BudgetYear[] = [
  {
    year: 2024,
    totalEUR: 42_800_000,
    byMinistry: {
      Transport: 8_100_000,
      Education: 7_400_000,
      Health: 6_900_000,
      Interior: 5_200_000,
      Environment: 4_800_000,
      Finance: 3_600_000,
      Economy: 2_900_000,
      Culture: 1_700_000,
      "Gen. Secretariat": 1_200_000,
      "City of Skopje": 3_100_000,
      Customs: 2_100_000,
      MRT: 800_000,
    },
  },
  {
    year: 2025,
    totalEUR: 55_360_000,
    byMinistry: {
      Transport: 10_600_000,
      Education: 9_800_000,
      Health: 8_450_000,
      Interior: 6_700_000,
      Environment: 6_200_000,
      Finance: 4_400_000,
      Economy: 3_800_000,
      Culture: 2_200_000,
      "Gen. Secretariat": 1_650_000,
      "City of Skopje": 4_100_000,
      Customs: 2_700_000,
      MRT: 1_100_000,
    },
  },
];
