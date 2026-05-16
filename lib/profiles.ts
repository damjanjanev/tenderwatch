export type AssetDeclaration = {
  year: number;
  realEstateEUR: number;
  vehiclesEUR: number;
  bankEUR: number;
  totalEUR: number;
};

export type CompanyLink = {
  companyName: string;
  relation: "Owner" | "Family member" | "Board member" | "Shareholder";
  relatedName?: string;
  totalContractsEUR: number;
  contractCount: number;
  tenderIds: string[];
};

export type PoliticalProfile = {
  slug: string;
  fullName: string;
  position: string;
  party: string;
  inOfficeFrom: string;
  assets: AssetDeclaration[];
  companies: CompanyLink[];
  sourceUrl: string;
};

export const PROFILES: PoliticalProfile[] = [
  {
    slug: "aleksandar-nikolovski",
    fullName: "Aleksandar Nikolovski",
    position: "Minister of Transport and Communications",
    party: "VMRO-DPMNE",
    inOfficeFrom: "2024-01-23",
    assets: [
      { year: 2024, realEstateEUR: 185000, vehiclesEUR: 28000, bankEUR: 42000, totalEUR: 255000 },
      { year: 2023, realEstateEUR: 170000, vehiclesEUR: 28000, bankEUR: 31000, totalEUR: 229000 },
      { year: 2022, realEstateEUR: 170000, vehiclesEUR: 18000, bankEUR: 24000, totalEUR: 212000 },
    ],
    companies: [
      {
        companyName: "Granit AD Skopje",
        relation: "Family member",
        relatedName: "Viktor Nikolovski (brother)",
        totalContractsEUR: 2_400_000,
        contractCount: 1,
        tenderIds: ["T-2026-0142"],
      },
      {
        companyName: "Infrastruktura DOOEL",
        relation: "Shareholder",
        totalContractsEUR: 0,
        contractCount: 0,
        tenderIds: [],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "mila-carovska",
    fullName: "Mila Carovska",
    position: "Minister of Education and Science",
    party: "SDSM",
    inOfficeFrom: "2019-05-30",
    assets: [
      { year: 2024, realEstateEUR: 92000, vehiclesEUR: 14000, bankEUR: 18000, totalEUR: 124000 },
      { year: 2023, realEstateEUR: 92000, vehiclesEUR: 14000, bankEUR: 12000, totalEUR: 118000 },
      { year: 2022, realEstateEUR: 85000, vehiclesEUR: 14000, bankEUR: 9000, totalEUR: 108000 },
    ],
    companies: [
      {
        companyName: "EuroTech Solutions DOOEL",
        relation: "Family member",
        relatedName: "Darko Carovska (spouse)",
        totalContractsEUR: 3_100_000,
        contractCount: 1,
        tenderIds: ["T-2026-0138"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "oliver-spasovski",
    fullName: "Oliver Spasovski",
    position: "Minister of Interior",
    party: "SDSM",
    inOfficeFrom: "2019-05-30",
    assets: [
      { year: 2024, realEstateEUR: 210000, vehiclesEUR: 32000, bankEUR: 55000, totalEUR: 297000 },
      { year: 2023, realEstateEUR: 210000, vehiclesEUR: 32000, bankEUR: 44000, totalEUR: 286000 },
      { year: 2022, realEstateEUR: 195000, vehiclesEUR: 32000, bankEUR: 38000, totalEUR: 265000 },
    ],
    companies: [
      {
        companyName: "SecureNet Systems DOOEL",
        relation: "Owner",
        totalContractsEUR: 680_000,
        contractCount: 2,
        tenderIds: ["T-2026-0108"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "fatmir-bytyqi",
    fullName: "Fatmir Bytyqi",
    position: "Deputy Prime Minister for Economic Affairs",
    party: "DUI",
    inOfficeFrom: "2017-06-01",
    assets: [
      { year: 2024, realEstateEUR: 320000, vehiclesEUR: 45000, bankEUR: 88000, totalEUR: 453000 },
      { year: 2023, realEstateEUR: 295000, vehiclesEUR: 45000, bankEUR: 71000, totalEUR: 411000 },
      { year: 2022, realEstateEUR: 280000, vehiclesEUR: 38000, bankEUR: 62000, totalEUR: 380000 },
    ],
    companies: [
      {
        companyName: "Kompanija Čistota DOOEL",
        relation: "Family member",
        relatedName: "Arben Bytyqi (cousin)",
        totalContractsEUR: 890_000,
        contractCount: 1,
        tenderIds: ["T-2026-0131"],
      },
      {
        companyName: "Bytyqi Group SH.P.K.",
        relation: "Owner",
        totalContractsEUR: 1_240_000,
        contractCount: 3,
        tenderIds: [],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "slavica-grkovska",
    fullName: "Slavica Grkovska",
    position: "Minister of Justice",
    party: "SDSM",
    inOfficeFrom: "2019-05-30",
    assets: [
      { year: 2024, realEstateEUR: 145000, vehiclesEUR: 19000, bankEUR: 28000, totalEUR: 192000 },
      { year: 2023, realEstateEUR: 145000, vehiclesEUR: 19000, bankEUR: 21000, totalEUR: 185000 },
      { year: 2022, realEstateEUR: 138000, vehiclesEUR: 19000, bankEUR: 17000, totalEUR: 174000 },
    ],
    companies: [],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "kreshnik-bekteshi",
    fullName: "Kreshnik Bekteshi",
    position: "Minister of Economy",
    party: "DUI",
    inOfficeFrom: "2017-06-01",
    assets: [
      { year: 2024, realEstateEUR: 275000, vehiclesEUR: 52000, bankEUR: 94000, totalEUR: 421000 },
      { year: 2023, realEstateEUR: 250000, vehiclesEUR: 52000, bankEUR: 78000, totalEUR: 380000 },
      { year: 2022, realEstateEUR: 230000, vehiclesEUR: 42000, bankEUR: 65000, totalEUR: 337000 },
    ],
    companies: [
      {
        companyName: "Bekteshi Invest DOOEL",
        relation: "Owner",
        totalContractsEUR: 540_000,
        contractCount: 2,
        tenderIds: [],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
];

export function getProfile(slug: string): PoliticalProfile | undefined {
  return PROFILES.find((p) => p.slug === slug);
}

// Cross-reference: given a contractor name, find profiles connected to it
export function getProfilesForContractor(contractorName: string): PoliticalProfile[] {
  return PROFILES.filter((p) =>
    p.companies.some(
      (c) => c.companyName.toLowerCase() === contractorName.toLowerCase()
    )
  );
}
