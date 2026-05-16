# TenderWatch

Public oversight platform for Macedonian government tenders, built on Solana Devnet.

> Anyone can flag. Journalists verify. The record is permanent.

---

## What this is

A working MVP of the civic accountability loop:

1. Browse 25 preloaded public tenders (filter by ministry, amount, keyword)
2. Connect Phantom (empty wallet is fine in demo mode), pick a category, write a detailed reason (100+ chars), optionally attach an evidence URL
3. Your flag appears immediately as **Community Flagged** — publicly visible on the tender and on `/suspicious`
4. A journalist or NGO verifier reviews it on `/verifier` and clicks **Validate** or **Reject**
5. One validation moves the tender to the public **Verified Suspicious** board
6. The citizen who flagged earns a **Watchdog badge point** — enough points unlock badge tiers with increasing voting weight
7. `/leaderboard` ranks all citizens by validated flag count
8. Every flag and vote links to a real Solana Explorer transaction

---

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page with live stats |
| `/tenders` | Browse + filter all 25 tenders |
| `/tenders/[id]` | Tender detail, flag button, public flag list |
| `/suspicious` | Community Flagged (pending) + Verified Suspicious board |
| `/verifier` | Journalist/NGO review queue — Validate or Reject flags |
| `/leaderboard` | Citizen watchdogs ranked by validated flags + badge tiers |

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

If the UI appears unstyled (white background, plain text), the `.next` cache is stale — this can happen after a fresh clone:

```bash
rm -rf .next && npm run dev
```

---

## Environment variables

Copy `.env.local.example` to `.env.local`. The defaults work out of the box:

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
| `NEXT_PUBLIC_ONCHAIN_MODE=true` | Flags/votes are real SPL Memo txs on devnet (requires ~0.000005 SOL per tx). |
| `NEXT_PUBLIC_ONCHAIN_MODE=false` | Flags/votes are simulated locally with realistic-looking signatures. |

---

## Watchdog badge system

Citizens earn badge points for every flag a verifier validates. Points unlock badge tiers:

| Tier | Flags needed | Voting weight |
|------|-------------|---------------|
| Street Watchdog | 10 | 1.5× |
| Civic Investigator | 25 | 2× |
| Justice Guardian | 50 | 3× |
| Civic Champion | 100 | 4× |

Badges (Lucide icons — Shield, Search, Scale, Award) appear on flags, the verifier dashboard, the suspicious board, and the leaderboard.

---

## Flag categories

- Price seems inflated
- Contractor has political connections
- No competitive bidding
- Contract awarded too fast
- Specifications favor one company
- Scope changed after awarding
- Other

---

## Demo seed data

On first load the app auto-seeds realistic fake flags from 8 different citizen wallets so the app looks populated right away:

| Citizen | Tier | Validated | Notes |
|---------|------|-----------|-------|
| Bojan | Justice Guardian | 52 | Top watchdog |
| Aleksandra | Civic Investigator | 28 | Active across ministries |
| Elena | Street Watchdog | 11 | Focus on political connections |
| Dragan | — | 6 | Close to first badge |
| Stefan | — | 2 | New but quality flags |
| Ivana | — | 3 pending | Awaiting verification |
| Nina | — | 1 pending | Awaiting verification |
| Marko | — | 2 rejected | Shows spam filtering in action |

Seed data is written once to `localStorage` under key `tenderwatch.seeded.v2` and never overwrites user flags. To re-seed, clear that key in DevTools → Application → Local Storage.

---

## End-to-end demo flow

1. Connect Phantom (any wallet, can be empty — demo mode)
2. `/tenders` → open any tender → **"Flag this tender"**
3. Pick a category → write 100+ char reason → submit
4. See **"Community Flagged"** badge on the tender and on `/suspicious`
5. Go to `/verifier` → find the flag in the Pending tab → click **"Validate"**
6. Tender moves to Confirmed Concerns on `/suspicious`
7. Check `/leaderboard` — your wallet appears with 1 validated flag

---

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
    reasonText: "Test flag for badge seeding — price is clearly inflated beyond EU benchmarks.",
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

Change `12` → `26` for Civic Investigator, `51` for Justice Guardian, `101` for Civic Champion.

---

## Project structure

```
tenderwatch/
├── app/
│   ├── globals.css          # CSS variable color system (light + dark themes)
│   ├── layout.tsx           # Root layout: GradientBackground + nav + footer
│   ├── page.tsx             # Landing page with live stats
│   ├── tenders/             # Browse + detail pages
│   ├── suspicious/          # Community Flagged + Verified Suspicious board
│   ├── verifier/            # Journalist review queue
│   └── leaderboard/         # Citizen rankings + badge tier legend
├── components/
│   ├── GradientBackground.tsx  # Canvas animated liquid blobs (dark mode background)
│   ├── BadgeDisplay.tsx        # Badge tier card + progress bar (full + compact)
│   ├── FlagModal.tsx           # Citizen flag dialog
│   ├── FlagList.tsx            # Per-tender public flag list
│   ├── Providers.tsx           # Solana wallet + next-themes providers
│   ├── SiteHeader.tsx          # Nav + dark/light theme toggle
│   ├── SiteFooter.tsx
│   └── ui/                     # shadcn primitives (Button, Badge, Dialog, etc.)
├── lib/
│   ├── tenders.ts           # 25 seeded tender records (source URLs → e-nabavki.gov.mk)
│   ├── store.ts             # Flag/vote localStorage store + badge tier logic
│   ├── seed.ts              # Auto-seeds demo flags on first load
│   └── utils.ts             # Formatters, sha256, Solana Explorer links
└── solana/                  # Anchor workspace (ready to deploy)
    ├── Anchor.toml
    └── programs/tenderwatch/src/lib.rs
```

---

## Key implementation details

- **Storage**: `useSyncExternalStore` + `localStorage` — reactive across tabs, no server needed
- **Storage key**: `tenderwatch.flags.v2` (v1 data is ignored)
- **Threshold**: 1 verifier validation resolves a flag (frontend); Rust program uses `VOTE_THRESHOLD = 3`
- **Verifier gate**: `NEXT_PUBLIC_DEMO_MODE=true` → any wallet; `false` → `VERIFIER_ALLOWLIST` in `lib/store.ts`
- **On-chain recording**: SPL Memo program (no custom Anchor program needed for basic recording)
- **Animated background**: Canvas + `requestAnimationFrame` — 6 morphing liquid blobs, visible in dark mode only
- **Theme**: `next-themes` with `defaultTheme="dark"`, CSS variable color system, Tailwind semantic classes

---

## Verifier allowlist (production)

In `lib/store.ts`, replace the placeholder addresses with real journalist/NGO wallet pubkeys:

```ts
export const VERIFIER_ALLOWLIST = [
  "REAL_JOURNALIST_WALLET_1",
  "REAL_NGO_WALLET_2",
  "REAL_PARTNER_WALLET_3",
];
```

Then set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local` to enforce the allowlist.

---

## Anchor program (deploy when ready)

Prerequisites: Solana CLI + Rust + Anchor 0.30.1

```bash
cd solana
anchor build
anchor deploy --provider.cluster devnet
# Copy the printed program ID into .env.local as NEXT_PUBLIC_PROGRAM_ID
# Copy target/idl/tenderwatch.json into lib/idl/
# Update lib/store.ts to call program.methods.flagTender(...) / voteOnFlag(...)
```

The program uses PDAs (`seeds = ["flag", tender_id, flagger_pubkey]`) — each flag is a deduplicated, immutable on-chain account.

> Deployment blocker on Windows: BPF toolchain requires WSL or Linux. Use [Solana Playground](https://beta.solpg.io) as an alternative.

---

## Design

Dark-first design. Near-black background (`#090807`) with an animated liquid gradient canvas layer (6 organic blobs: gold, orange, crimson, rose, purple, amber) — only visible in dark mode. All colors are CSS variables so light/dark themes switch cleanly via Tailwind semantic classes (`bg-paper`, `text-ink`, `border-sand`). Inter body font, JetBrains Mono for amounts and addresses, minimal radius (2-4px), no decorative icons or emojis in the UI.

---

## Git branches

| Branch | Purpose |
|--------|---------|
| `new-design` | Current active development |
| `master` | Warm editorial backup (earlier design) |

---

## License

MIT
