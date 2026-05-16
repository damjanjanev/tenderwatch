# TenderWatch

Public oversight platform for Macedonian government tenders, built on Solana Devnet.

> Anyone can flag. Journalists verify. The record is permanent.

## What this is

A working MVP of the civic accountability loop:

1. Browse 25 preloaded public tenders (filter by ministry, amount, keyword)
2. Connect Phantom (empty wallet is fine in demo mode), pick a category, write a detailed reason (100+ chars), optionally attach an evidence URL
3. Your flag appears immediately as **Community Flagged** — publicly visible on the tender and on `/suspicious`
4. A journalist or NGO verifier reviews it on `/verifier` and clicks **Validate** or **Reject**
5. One validation moves the tender to the public **Verified Suspicious** board
6. The citizen who flagged it earns a **Watchdog badge point** — enough points unlock badge tiers with increasing voting weight
7. The `/leaderboard` ranks all citizens by validated flag count
8. Every flag and vote links to a real Solana Explorer transaction

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/tenders` | Browse + filter all 25 tenders |
| `/tenders/[id]` | Tender detail, flag button, public flag list |
| `/suspicious` | Community Flagged (pending) + Verified Suspicious board |
| `/verifier` | Journalist/NGO review queue — Validate or Reject flags |
| `/leaderboard` | Citizen watchdogs ranked by validated flags + badge tiers |

## Watchdog badge system

Citizens earn badge points for every flag a verifier validates. Points unlock badge tiers:

| Badge | Tier | Flags needed | Voting weight |
|-------|------|-------------|---------------|
| 🐕 | Street Watchdog | 10 | 1.5× |
| 🔍 | Civic Investigator | 25 | 2× |
| ⚖️ | Justice Guardian | 50 | 3× |
| 🏆 | Civic Champion | 100 | 4× |

Badges appear on flags, on the verifier dashboard, on the suspicious board, and on the leaderboard — giving credibility signals to verifiers and the public.

## Flag categories

- Price seems inflated
- Contractor has political connections
- No competitive bidding
- Contract awarded too fast
- Specifications favor one company
- Scope changed after awarding
- Other

## Two modes

- **Demo mode** (default — `NEXT_PUBLIC_DEMO_MODE=true`) — flags and votes are simulated client-side with realistic-looking tx signatures. Any connected wallet acts as a verifier. No SOL needed. Fully testable in one browser tab.
- **On-chain mode** (`NEXT_PUBLIC_ONCHAIN_MODE=true`) — flags and votes are recorded as SPL Memo transactions on Solana Devnet. Requires a small amount of devnet SOL for gas (~0.000005 SOL per tx). The Anchor program in `solana/` is ready to deploy for full PDA-based flag accounts.

## Quick start

```bash
cd tenderwatch
npm install
cp .env.local.example .env.local
# Make sure NEXT_PUBLIC_DEMO_MODE=true is set in .env.local
npm run dev
# → http://localhost:3000
```

If the UI appears unstyled (white background, plain text), the `.next` cache is stale:

```bash
rm -rf .next && npm run dev
```

## Demo seed data

On first load, the app auto-seeds realistic fake flags from 8 different citizen wallets so the app looks populated:

| Citizen | Badge | Validated flags | Notes |
|---------|-------|----------------|-------|
| Bojan | ⚖️ Justice Guardian | 52 | Top watchdog |
| Aleksandra | 🔍 Civic Investigator | 28 | Active across ministries |
| Elena | 🐕 Street Watchdog | 11 | Focus on political connections |
| Dragan | — | 6 | Close to first badge |
| Stefan | — | 2 | New but quality flags |
| Ivana | — | 3 pending | Awaiting verification |
| Nina | — | 1 pending | Awaiting verification |
| Marko | — | 2 rejected | Shows spam filtering in action |

Seed data is written once to `localStorage` under key `tenderwatch.seeded.v2` and never overwrites user flags.

## Testing badge tiers manually

Open DevTools console on any page and paste (replace wallet with yours):

```js
const wallet = "YOUR_WALLET_ADDRESS_HERE";
const flags = JSON.parse(localStorage.getItem("tenderwatch.flags.v2") || "[]");
for (let i = 0; i < 12; i++) {
  flags.unshift({
    id: `flag_test_${i}`,
    tenderId: `T-2026-000${i}`,
    flaggerWallet: wallet,
    category: "Price seems inflated",
    reasonText: "Test flag for badge seeding — price is clearly inflated beyond EU benchmarks for this region.",
    reasonHash: "abc123",
    txSignature: "mockSig" + i,
    createdAt: new Date().toISOString(),
    status: "VerifiedSuspicious",
    votes: [],
  });
}
localStorage.setItem("tenderwatch.flags.v2", JSON.stringify(flags));
location.reload();
```

Change `12` to `26` for 🔍, `51` for ⚖️, `101` for 🏆.

## End-to-end demo flow

1. Connect Phantom (any wallet, can be empty — demo mode)
2. `/tenders` → open any tender
3. **"Flag this tender"** → pick category → write 100+ char reason → submit
4. See **"Community Flagged"** badge on the tender and on `/suspicious`
5. Go to `/verifier` → find flag in Pending tab → click **"Validate"**
6. Tender moves to Confirmed Concerns on `/suspicious`
7. Check `/leaderboard` — your wallet appears with 1 validated flag

## Project structure

```
tenderwatch/
├── app/
│   ├── page.tsx             # Landing
│   ├── tenders/             # Browse + detail
│   ├── suspicious/          # Community Flagged + Verified Suspicious
│   ├── verifier/            # Journalist review queue
│   └── leaderboard/         # Citizen rankings + badge tiers
├── components/
│   ├── BadgeDisplay.tsx     # Badge tier card + progress bar (full + compact)
│   ├── FlagModal.tsx        # Citizen flag dialog (category, reason, evidence)
│   ├── FlagList.tsx         # Per-tender public flag list
│   ├── SiteHeader.tsx       # Nav: Browse, Suspicious, Verifier, Leaderboard
│   └── ui/                  # shadcn primitives
├── lib/
│   ├── tenders.ts           # 25 seeded tender records (source URLs → e-nabavki.gov.mk)
│   ├── store.ts             # Flag/vote localStorage store + badge tier logic
│   ├── seed.ts              # Auto-seed demo flags on first load
│   └── utils.ts             # Formatters, sha256, explorer links
└── solana/                  # Anchor workspace (written, ready to deploy)
    ├── Anchor.toml
    └── programs/tenderwatch/src/lib.rs
```

## Key implementation details

- **Storage**: `useSyncExternalStore` + `localStorage` — reactive across tabs, no server needed
- **Storage key**: `tenderwatch.flags.v2` (v1 data is ignored)
- **Threshold**: 1 verifier validation resolves a flag (frontend); Rust program uses `VOTE_THRESHOLD = 3`
- **Verifier gate**: `NEXT_PUBLIC_DEMO_MODE=true` → any wallet; `false` → `VERIFIER_ALLOWLIST` in `store.ts`
- **On-chain recording**: SPL Memo program (no custom program needed for basic recording)
- **Wallet requirement**: Must be connected; no SOL required in demo mode

## Verifier allowlist (production)

In `lib/store.ts`, replace the three placeholder addresses with real journalist/NGO wallet pubkeys:

```ts
export const VERIFIER_ALLOWLIST = [
  "REAL_JOURNALIST_WALLET_1",
  "REAL_NGO_WALLET_2",
  "REAL_PARTNER_WALLET_3",
];
```

Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local` to enforce the allowlist.

## Anchor program (deploy when ready)

Prerequisites: Solana CLI + Rust + Anchor 0.30.1.

```bash
cd solana
anchor build
anchor deploy --provider.cluster devnet
# Copy printed program ID into .env.local as NEXT_PUBLIC_PROGRAM_ID
# Copy target/idl/tenderwatch.json into lib/idl/
# Update lib/store.ts flag/vote handlers to call program.methods.flagTender(...) / voteOnFlag(...)
```

The on-chain program uses PDAs (`seeds = ["flag", tender_id, flagger_pubkey]`) — each flag is a deduplicated, immutable on-chain account. Currently blocked from deployment: devnet faucet rate limits + Windows admin required for BPF toolchain install. Use Solana Playground (beta.solpg.io) as an alternative.

## Design

Warm editorial palette: cream paper (`#FAF8F3`) background, deep ink (`#1A1A1A`) text, oxblood red (`#C8443C`) for flags/danger, forest green (`#2D5F3F`) for verified. Serif headings (Fraunces), Inter body, JetBrains Mono for amounts and wallet addresses. Feels like a newsroom data desk, not a crypto app.

## License

MIT
