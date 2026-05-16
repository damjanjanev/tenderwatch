export type Tender = {
  id: string;
  title: string;
  description: string;
  amountEUR: number;
  ministry: string;
  contractor: string;
  publishedAt: string;
  deadline: string;
  sourceUrl: string;
};

export const TENDERS: Tender[] = [
  {
    id: "T-2026-0142",
    title: "Reconstruction of regional road R1102, Skopje–Tetovo, 14km section",
    description:
      "Full reconstruction including asphalt layers, drainage, signage, and three bridge sections. The bid was awarded to a single contractor without a public Q&A round, and the awarded price is 2.3× the per-kilometer average of comparable EU-funded road projects in the region over the last 5 years.",
    amountEUR: 2_400_000,
    ministry: "Ministry of Transport",
    contractor: "Granit AD Skopje",
    publishedAt: "2026-03-12",
    deadline: "2026-04-15",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0138",
    title: "IT equipment procurement for Ministry of Education — laptops and servers",
    description:
      "Procurement of 4,200 laptops and 18 rack servers for distribution across primary and secondary schools nationally. Specifications are unusually narrow and match a single OEM's product line that was discontinued in late 2025.",
    amountEUR: 3_100_000,
    ministry: "Ministry of Education",
    contractor: "EuroTech Solutions DOOEL",
    publishedAt: "2026-02-28",
    deadline: "2026-03-30",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0131",
    title: "Cleaning services contract for government buildings (24 months)",
    description:
      "Daily cleaning, sanitation, and maintenance services for 14 government buildings in central Skopje. Winning bid is identical to the previous 4 cycles, awarded to the same contractor each time since 2018.",
    amountEUR: 890_000,
    ministry: "General Secretariat",
    contractor: "Kompanija Čistota DOOEL",
    publishedAt: "2026-03-04",
    deadline: "2026-04-04",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0127",
    title: "Hospital medical equipment — University Clinic of Cardiology",
    description:
      "Two cardiac catheterization labs, monitoring equipment, and 12 ICU beds with associated electronics. Standard procurement, multiple qualified bidders, transparent specifications.",
    amountEUR: 4_750_000,
    ministry: "Ministry of Health",
    contractor: "MediSupply International",
    publishedAt: "2026-01-22",
    deadline: "2026-03-15",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0124",
    title: "Public lighting modernization — Skopje Centar municipality",
    description:
      "Replacement of 3,400 street lights with LED fixtures, installation of smart control nodes, and a central monitoring system. Awarded to a contractor whose sole owner is the brother of a municipal council member.",
    amountEUR: 1_650_000,
    ministry: "Municipality of Centar",
    contractor: "LumenGrad DOO",
    publishedAt: "2026-02-18",
    deadline: "2026-03-20",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0119",
    title: "Snow removal services, winter season 2026/27",
    description:
      "Winter road maintenance for primary and secondary national roads across 6 regions. Standard renewal of existing framework agreement with regional contractors.",
    amountEUR: 2_200_000,
    ministry: "Ministry of Transport",
    contractor: "Multiple regional contractors",
    publishedAt: "2026-04-02",
    deadline: "2026-05-15",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0115",
    title: "Marketing campaign for tourism promotion abroad",
    description:
      "12-month international marketing campaign targeting German, Dutch, and Italian markets. Includes social media, print, and partnership activations. Awarded to a Skopje agency newly registered in November 2025 with no prior public client work.",
    amountEUR: 720_000,
    ministry: "Ministry of Economy",
    contractor: "Bright Horizons Media DOOEL",
    publishedAt: "2026-03-08",
    deadline: "2026-04-08",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0112",
    title: "Reconstruction of National Library facade and roofing",
    description:
      "Heritage-grade restoration of the National Library building including roofing, facade stonework, and weatherproofing. Conducted under heritage preservation requirements with appropriate technical specifications.",
    amountEUR: 1_100_000,
    ministry: "Ministry of Culture",
    contractor: "Restavracija Trajkovski",
    publishedAt: "2026-02-10",
    deadline: "2026-03-25",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0108",
    title: "Police vehicle fleet renewal — 80 patrol vehicles",
    description:
      "Procurement of 80 marked patrol vehicles with associated equipment packages. Bid specifications were updated three times during the open period in ways that progressively narrowed the eligible vehicle models.",
    amountEUR: 3_400_000,
    ministry: "Ministry of Interior",
    contractor: "AutoFleet Balkan DOO",
    publishedAt: "2026-01-15",
    deadline: "2026-03-01",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0103",
    title: "School textbook printing, 2026/27 academic year",
    description:
      "Printing and distribution of approximately 2.1 million textbook copies across grades 1–12 for the upcoming academic year. Standard annual procurement with consistent vendor base.",
    amountEUR: 1_800_000,
    ministry: "Ministry of Education",
    contractor: "Stamparija Kočo Racin",
    publishedAt: "2026-02-05",
    deadline: "2026-03-12",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0099",
    title: "Water treatment plant upgrade, Kumanovo",
    description:
      "Capacity expansion and filtration system upgrade for Kumanovo's municipal water treatment plant. Multiple qualified European engineering firms in the bid pool.",
    amountEUR: 6_200_000,
    ministry: "Ministry of Environment",
    contractor: "Hydro Engineering AG (joint venture)",
    publishedAt: "2026-01-08",
    deadline: "2026-03-08",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0094",
    title: "Catering services for parliamentary sessions and state events",
    description:
      "12-month catering contract for parliamentary sessions, state visits, and official ceremonies. Awarded at 4.2× the previous comparable contract's per-event rate.",
    amountEUR: 420_000,
    ministry: "Parliament Secretariat",
    contractor: "Skopje Premium Catering DOOEL",
    publishedAt: "2026-03-18",
    deadline: "2026-04-18",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0089",
    title: "Public transport bus procurement — 25 city buses for Skopje",
    description:
      "Procurement of 25 articulated city buses with CNG drivetrains for JSP Skopje. Open tender with multiple international bidders, transparent specifications aligned with EU emission standards.",
    amountEUR: 8_700_000,
    ministry: "City of Skopje",
    contractor: "Solaris Bus & Coach (Poland)",
    publishedAt: "2025-12-22",
    deadline: "2026-02-22",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0085",
    title: "Sewage system extension, Aerodrom municipality, Phase 3",
    description:
      "Third phase of sewage network extension covering an additional 4.2km of residential streets. Phases 1 and 2 were awarded to the same contractor over the previous 2 years at sequentially increasing per-meter rates.",
    amountEUR: 950_000,
    ministry: "Municipality of Aerodrom",
    contractor: "Gradba Infra DOOEL",
    publishedAt: "2026-02-25",
    deadline: "2026-03-28",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0081",
    title: "University dormitory renovation — Goce Delčev complex",
    description:
      "Full renovation of 4 dormitory buildings including plumbing, electrical, common areas, and 380 individual rooms. Three qualified bidders, awarded to lowest compliant bid.",
    amountEUR: 2_900_000,
    ministry: "Ministry of Education",
    contractor: "Beton AD Skopje",
    publishedAt: "2026-01-30",
    deadline: "2026-03-18",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0077",
    title: "Cybersecurity audit and penetration testing — national tax system",
    description:
      "External cybersecurity audit and penetration testing of the Public Revenue Office's central tax processing systems. Awarded to a consulting firm registered 5 months prior to the bid with no prior cybersecurity portfolio.",
    amountEUR: 380_000,
    ministry: "Public Revenue Office",
    contractor: "CyberShield Consulting DOOEL",
    publishedAt: "2026-03-22",
    deadline: "2026-04-22",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0073",
    title: "Forestry equipment procurement — fire prevention package",
    description:
      "Procurement of fire prevention equipment including 12 specialized vehicles, drone units, and field gear for the public forestry agency.",
    amountEUR: 1_400_000,
    ministry: "Public Enterprise Macedonian Forests",
    contractor: "ForestTech Equipment GmbH",
    publishedAt: "2026-02-14",
    deadline: "2026-03-22",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0068",
    title: "Translation services for EU accession documents",
    description:
      "Specialized legal and technical translation services for EU accession-related legislative documents. Framework agreement with three qualified translation firms.",
    amountEUR: 280_000,
    ministry: "Secretariat for European Affairs",
    contractor: "Multiple framework partners",
    publishedAt: "2026-01-12",
    deadline: "2026-02-12",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0064",
    title: "National stadium pitch and lighting upgrade",
    description:
      "Replacement of stadium turf, drainage, and lighting system at the National Arena. Awarded to a contractor based in a different region with no prior stadium projects, at a price 1.8× the regional benchmark.",
    amountEUR: 1_950_000,
    ministry: "Agency for Youth and Sports",
    contractor: "Sportska Gradba DOO",
    publishedAt: "2026-02-22",
    deadline: "2026-04-01",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0061",
    title: "Mobile X-ray units for rural health centers",
    description:
      "Procurement of 8 mobile X-ray imaging units for deployment in rural primary health centers. Open tender, three international bidders, awarded to lowest compliant.",
    amountEUR: 1_240_000,
    ministry: "Ministry of Health",
    contractor: "Philips Healthcare Adriatic",
    publishedAt: "2026-01-05",
    deadline: "2026-02-28",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0057",
    title: "Office furniture procurement, Ministry of Finance HQ",
    description:
      "Replacement of office furniture across 4 floors of the Ministry of Finance HQ. Awarded at a per-workstation cost 3.1× the standard public-sector benchmark, to a contractor specializing in luxury hospitality fit-outs.",
    amountEUR: 540_000,
    ministry: "Ministry of Finance",
    contractor: "Elegance Interiors DOOEL",
    publishedAt: "2026-03-15",
    deadline: "2026-04-15",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0053",
    title: "Public broadcaster content licensing — international sports",
    description:
      "Multi-year content licensing agreement for international sports broadcasting rights on the public broadcaster. Negotiated through a standard rights distribution channel.",
    amountEUR: 1_100_000,
    ministry: "Macedonian Radio Television",
    contractor: "Sportradar Distribution AG",
    publishedAt: "2025-12-18",
    deadline: "2026-02-18",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0049",
    title: "Customs office IT infrastructure upgrade",
    description:
      "Upgrade of customs office IT infrastructure including border crossing terminals, scanning equipment integration, and central database modernization. Direct award without open tender, justified under national security exemption.",
    amountEUR: 2_700_000,
    ministry: "Customs Administration",
    contractor: "Sigma Systems Group DOO",
    publishedAt: "2026-02-08",
    deadline: "2026-03-08",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0045",
    title: "School meals program — central kitchen contract",
    description:
      "Daily school meal preparation and distribution to 142 primary schools in the Skopje region. Standard recompete won by an existing operator at slightly lower per-meal cost than prior cycle.",
    amountEUR: 4_100_000,
    ministry: "Ministry of Education",
    contractor: "Detska Kujna AD",
    publishedAt: "2026-01-25",
    deadline: "2026-03-10",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
  {
    id: "T-2026-0042",
    title: "Park reconstruction, City Park Skopje, eastern section",
    description:
      "Landscape reconstruction of the eastern section of City Park including pathways, irrigation, and lighting. Contract awarded after 4 prior identical tenders were cancelled due to lack of qualifying bidders, finally awarded to a single bidder at 1.6× the original budget.",
    amountEUR: 1_280_000,
    ministry: "City of Skopje",
    contractor: "Pejzaž Plus DOOEL",
    publishedAt: "2026-03-01",
    deadline: "2026-04-05",
    sourceUrl: "https://e-nabavki.gov.mk/PublicAccess/home.aspx#/dossie-ac",
  },
];

export function getTender(id: string): Tender | undefined {
  return TENDERS.find((t) => t.id === id);
}

export function getMinistries(): string[] {
  return Array.from(new Set(TENDERS.map((t) => t.ministry))).sort();
}
