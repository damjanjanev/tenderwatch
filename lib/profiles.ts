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
  avatarUrl?: string;
};

export const PROFILES: PoliticalProfile[] = [
  {
    slug: "aleksandar-nikolovski",
    fullName: "Aleksandar Nikolovski",
    position: "Minister of Transport and Communications",
    party: "VMRO-DPMNE",
    inOfficeFrom: "2024-01-23",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Aleksandar+Nikolovski&size=128&background=1a1a1a&color=EAB308&bold=true",
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
    avatarUrl:
      "https://ui-avatars.com/api/?name=Mila+Carovska&size=128&background=1a1a1a&color=EAB308&bold=true",
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
    avatarUrl:
      "https://ui-avatars.com/api/?name=Oliver+Spasovski&size=128&background=1a1a1a&color=EAB308&bold=true",
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
    avatarUrl:
      "https://ui-avatars.com/api/?name=Fatmir+Bytyqi&size=128&background=1a1a1a&color=EAB308&bold=true",
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
    avatarUrl:
      "https://ui-avatars.com/api/?name=Slavica+Grkovska&size=128&background=1a1a1a&color=EAB308&bold=true",
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
    avatarUrl:
      "https://ui-avatars.com/api/?name=Kreshnik+Bekteshi&size=128&background=1a1a1a&color=EAB308&bold=true",
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
  // New profiles
  {
    slug: "dragan-kovacevski",
    fullName: "Dragan Kovačevski",
    position: "Prime Minister",
    party: "SDSM",
    inOfficeFrom: "2022-01-17",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Dragan+Kovacevski&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 298000, vehiclesEUR: 41000, bankEUR: 76000, totalEUR: 415000 },
      { year: 2023, realEstateEUR: 272000, vehiclesEUR: 41000, bankEUR: 59000, totalEUR: 372000 },
      { year: 2022, realEstateEUR: 255000, vehiclesEUR: 35000, bankEUR: 48000, totalEUR: 338000 },
    ],
    companies: [
      {
        companyName: "Kozuvčanka DOOEL",
        relation: "Family member",
        relatedName: "Sonja Kovačevska (spouse)",
        totalContractsEUR: 1_870_000,
        contractCount: 4,
        tenderIds: ["T-2026-0045", "T-2026-0094"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "bujar-osmani",
    fullName: "Bujar Osmani",
    position: "Minister of Foreign Affairs",
    party: "DUI",
    inOfficeFrom: "2019-05-30",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Bujar+Osmani&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 340000, vehiclesEUR: 58000, bankEUR: 112000, totalEUR: 510000 },
      { year: 2023, realEstateEUR: 310000, vehiclesEUR: 58000, bankEUR: 94000, totalEUR: 462000 },
      { year: 2022, realEstateEUR: 290000, vehiclesEUR: 48000, bankEUR: 79000, totalEUR: 417000 },
    ],
    companies: [
      {
        companyName: "Osmani Trading SH.P.K.",
        relation: "Owner",
        totalContractsEUR: 620_000,
        contractCount: 2,
        tenderIds: ["T-2026-0068"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "arben-taravari",
    fullName: "Arben Taravari",
    position: "Minister of Finance",
    party: "BDI",
    inOfficeFrom: "2024-06-23",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Arben+Taravari&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 480000, vehiclesEUR: 72000, bankEUR: 155000, totalEUR: 707000 },
      { year: 2023, realEstateEUR: 445000, vehiclesEUR: 68000, bankEUR: 128000, totalEUR: 641000 },
      { year: 2022, realEstateEUR: 410000, vehiclesEUR: 62000, bankEUR: 104000, totalEUR: 576000 },
    ],
    companies: [
      {
        companyName: "Taravari Invest DOOEL",
        relation: "Owner",
        totalContractsEUR: 2_340_000,
        contractCount: 5,
        tenderIds: ["T-2026-0057", "T-2026-0099"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "vlado-misajlovski",
    fullName: "Vlado Misajlovski",
    position: "Minister of Interior",
    party: "VMRO-DPMNE",
    inOfficeFrom: "2024-01-23",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Vlado+Misajlovski&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 225000, vehiclesEUR: 44000, bankEUR: 63000, totalEUR: 332000 },
      { year: 2023, realEstateEUR: 205000, vehiclesEUR: 44000, bankEUR: 51000, totalEUR: 300000 },
      { year: 2022, realEstateEUR: 192000, vehiclesEUR: 38000, bankEUR: 40000, totalEUR: 270000 },
    ],
    companies: [
      {
        companyName: "SecureGuard DOOEL",
        relation: "Shareholder",
        totalContractsEUR: 3_400_000,
        contractCount: 2,
        tenderIds: ["T-2026-0108", "T-2026-0119"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "izet-mexhiti",
    fullName: "Izet Mexhiti",
    position: "Mayor of Tetovo",
    party: "DUI",
    inOfficeFrom: "2013-03-31",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Izet+Mexhiti&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 390000, vehiclesEUR: 67000, bankEUR: 98000, totalEUR: 555000 },
      { year: 2023, realEstateEUR: 365000, vehiclesEUR: 67000, bankEUR: 82000, totalEUR: 514000 },
      { year: 2022, realEstateEUR: 340000, vehiclesEUR: 55000, bankEUR: 67000, totalEUR: 462000 },
    ],
    companies: [
      {
        companyName: "Mexhiti Konstrukt SH.P.K.",
        relation: "Owner",
        totalContractsEUR: 1_580_000,
        contractCount: 3,
        tenderIds: ["T-2026-0085"],
      },
      {
        companyName: "Tetova Urban DOOEL",
        relation: "Board member",
        totalContractsEUR: 760_000,
        contractCount: 2,
        tenderIds: ["T-2026-0064"],
      },
    ],
    sourceUrl: "https://dksk.org.mk",
  },
  {
    slug: "biljana-shekerkali",
    fullName: "Biljana Shekerkali",
    position: "Director of Public Revenue Office",
    party: "VMRO-DPMNE",
    inOfficeFrom: "2024-02-14",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Biljana+Shekerkali&size=128&background=1a1a1a&color=EAB308&bold=true",
    assets: [
      { year: 2024, realEstateEUR: 168000, vehiclesEUR: 23000, bankEUR: 44000, totalEUR: 235000 },
      { year: 2023, realEstateEUR: 155000, vehiclesEUR: 23000, bankEUR: 34000, totalEUR: 212000 },
      { year: 2022, realEstateEUR: 148000, vehiclesEUR: 18000, bankEUR: 27000, totalEUR: 193000 },
    ],
    companies: [
      {
        companyName: "Shekerkali Consulting DOOEL",
        relation: "Owner",
        totalContractsEUR: 760_000,
        contractCount: 3,
        tenderIds: ["T-2026-0077", "T-2026-0057"],
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
