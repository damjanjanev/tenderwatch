# contr

 [tenderwatch](tenderwatch-eight.vercel.app) - live preview

Public contract transparency platform — citizens flag suspicious government tenders, journalists verify, every record is stored on blockchain permanently.

> Anyone can flag. Verification has skin in the game. The record is permanent.

---

## What this is

A civic accountability platform for tracking public procurement contracts:

1. Browse a searchable database of government contracts (filter by ministry, amount, keyword, status)
2. Connect a Phantom wallet (demo mode: any wallet works, no SOL needed), write a reason (100+ chars), optionally attach evidence
3. Your flag is hashed and stored on-chain — publicly visible on the tender and on `/suspicious`
4. Credentialed journalists review flagged tenders on `/verifier`, publish reports, and give a verdict (Suspicious / Not Suspicious)
5. A consensus of journalist reports moves the tender to **Verified Suspicious**
6. Citizens whose flags hit verified-suspicious tenders earn **contr tokens** — token levels unlock titles and voting weight
7. `/leaderboard` ranks citizens by tokens and journalists by credibility score
8. Every flag and report links to a real blockchain Explorer transaction

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Hero landing page with shader background + live stats |
| `/tenders` | Browse + filter all contracts |
| `/tenders/[id]` | Contract detail, AI suspicion score, flag button, journalist reports, community flags |
| `/spending` | Ministry spending analytics — bar charts, YoY comparison, allocation breakdown |
| `/profiles` | Searchable political profile directory |
| `/profiles/[slug]` | Individual politician — declared assets chart, company connections, flagged tender links |
| `/bounties` | Post and browse open investigation bounties with USD rewards |
| `/wallet` | Platform treasury ledger — all on-chain deposits and payouts |
| `/suspicious` | Community Flagged (pending) + Verified Suspicious board |
| `/verifier` | Journalist dashboard — publish reports, track credibility score |
| `/leaderboard` | Citizens ranked by contr tokens · Journalists ranked by credibility |

---

## Quick start

```bash
git clone https://github.com/damjanjanev/tenderwatch.git
cd tenderwatch
npm install
cp .env.local.example .env.local
npm run dev
# → http://localhost:3000
```

> **Note:** `.env.local.example` already has `NEXT_PUBLIC_DEMO_MODE=true` set. No Phantom SOL needed.

If the UI appears unstyled, clear the Next.js cache:

```bash
rm -rf .next && npm run dev
```

---

## Environment variables

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=
NEXT_PUBLIC_ONCHAIN_MODE=false
NEXT_PUBLIC_DEMO_MODE=true
```

| Variable | Effect |
|----------|--------|
| `NEXT_PUBLIC_DEMO_MODE=true` | Any connected wallet acts as a verifier. No SOL needed. |
| `NEXT_PUBLIC_DEMO_MODE=false` | Only wallets in `VERIFIER_ALLOWLIST` (in `lib/store.ts`) can verify. |
| `NEXT_PUBLIC_ONCHAIN_MODE=true` | Flags/reports are real SPL Memo txs on devnet. |
| `NEXT_PUBLIC_ONCHAIN_MODE=false` | Flags/reports are simulated locally with realistic-looking signatures. |

---

## Design system

Dark navy throughout. Background: `#080c1a`. Accent: `#0084ff`. All pages use a consistent dark glass card language:

- Cards: `rounded-xl border border-white/[0.06] bg-white/[0.02]`
- Text hierarchy: `text-white` → `text-white/70` → `text-white/40` → `text-white/20`
- Active states / links: `#0084ff`
- Risk indicators: `text-red-400` / `text-emerald-400` / `text-amber-400`
- Homepage: WebGL shader canvas background (dark navy → blue, animated) with transparent html/body so the fixed canvas shows through

---

## Token + incentive system

Citizens earn **contr tokens** for accurate flags:

| Level | Tokens | Title |
|-------|--------|-------|
| Newcomer | 0+ | Starting out |
| Watchdog | 5+ | Active contributor |
| Sentinel | 15+ | Trusted flagger |
| Guardian | 30+ | Top civic watchdog |

Each flag on a tender that reaches **Verified Suspicious** earns tokens (configured in `lib/points.ts`).

Watchdog badge tiers (by flag count) grant increasing vote weight:

| Tier | Min flags | Vote weight |
|------|-----------|-------------|
| Street Watchdog | 10 | 1.5× |
| Civic Investigator | 25 | 2× |
| Justice Guardian | 50 | 3× |
| Civic Champion | 100 | 4× |

---

## Journalist credibility scoring

Score = `reports + floor(likes / 5) + accurate_calls × 2`

- **+1** per report submitted
- **+1** per 5 likes received across all reports
- **+2** per report whose conclusion matched the final tender verdict

---

## AI Suspicion Score

Each tender detail page runs a heuristic risk score (0–100):

| Signal | Points |
|--------|--------|
| High-value contractor with multiple awards | +25 |
| Contractor linked to a political profile | +30 |
| Currently under journalist review | +10 |
| Verified suspicious by journalists | +20 |
| Community flags (max 3 counted) | +5 each |
| Single/direct award language in description | +10 |

---

## Project structure

```
tenderwatch/
├── app/
│   ├── globals.css              # CSS variable color system
│   ├── layout.tsx               # Root layout: wallet providers + nav + footer
│   ├── page.tsx                 # Landing page
│   ├── tenders/                 # Browse list + [id] detail
│   ├── spending/                # Ministry spending analytics
│   ├── profiles/                # Profile list + [slug] detail
│   ├── bounties/                # Investigation bounty board
│   ├── wallet/                  # Platform treasury ledger
│   ├── suspicious/              # Flagged + verified board
│   ├── verifier/                # Journalist dashboard
│   └── leaderboard/             # Rankings
├── components/
│   ├── ui/
│   │   ├── hero-landing-page.tsx   # Homepage hero + How It Works
│   │   └── shader-background.tsx   # WebGL animated dark navy/blue background
│   ├── BadgeDisplay.tsx
│   ├── FlagModal.tsx
│   ├── FlagList.tsx
│   ├── TenderReportSection.tsx     # Journalist report form + report list
│   ├── SiteHeader.tsx
│   └── SiteFooter.tsx
├── lib/
│   ├── tenders.ts               # Seeded tender records
│   ├── profiles.ts              # Politician profile data
│   ├── spending.ts              # Ministry spending data
│   ├── bounties.ts              # Bounty board data
│   ├── tenderReports.ts         # Journalist report store + scoring
│   ├── points.ts                # contr token logic + levels
│   ├── publicWallet.ts          # Platform treasury ledger data
│   ├── store.ts                 # Flag store + badge tiers + verifier allowlist
│   ├── seed.ts                  # Auto-seeds demo data on first load
│   └── utils.ts                 # Formatters, sha256, Explorer links
```

---

## Demo seed data

Auto-seeded on first load from 8 citizen wallets so the app looks populated. Seed is written once to `localStorage` under `tenderwatch.seeded.v2` — never overwrites real user flags. To re-seed, clear that key in DevTools → Application → Local Storage.

---

## Verifier allowlist (production)

In `lib/store.ts`, replace placeholder addresses with real journalist wallet pubkeys:

```ts
export const VERIFIER_ALLOWLIST = [
  "REAL_JOURNALIST_WALLET_1",
  "REAL_NGO_WALLET_2",
];
```

Then set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local`.

---

## Git branches

| Branch | Purpose |
|--------|---------|
| `new-design` | Current active development |
| `master` | Earlier design backup |

---

## License

MIT
