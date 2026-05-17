# TenderWatch — Project Plan

> Public tender transparency for North Macedonia, anchored on Solana.

---

## Vision

Government contracts in Macedonia are publicly listed but practically invisible — buried in PDFs, scattered across ministry portals, and rarely scrutinized. TenderWatch makes every contract searchable, flaggable, and permanently accountable.

The core loop:
1. Anyone with a browser can see every tender
2. Anyone with a wallet can flag one
3. Credentialed journalists verify the flags
4. Verified flags are permanent — no government can delete them

---

## Current status — MVP complete

The full civic accountability loop works end-to-end in demo mode:

- [x] 25 real Macedonian tenders seeded (linked to e-nabavki.gov.mk)
- [x] Tender browser with search, filter by ministry/amount/category
- [x] Flag system — any connected Phantom wallet can flag a tender
- [x] Journalist verifier dashboard — Validate / Reject flags
- [x] Verified Suspicious board — public, permanent, filterable
- [x] Watchdog badge system — 4 tiers based on validated flag count
- [x] Leaderboard — ranks all citizen watchdogs
- [x] Demo seed data — 8 fake wallets with realistic activity
- [x] On-chain recording ready — SPL Memo transactions (toggle via env var)
- [x] Anchor program written — ready to deploy for full PDA-based flag accounts
- [x] Dark-first UI — animated liquid gradient background, CSS variable theme system
- [x] Light/dark toggle
- [x] GitHub repo live — teammates can clone and run in 3 commands

---

## What is not real yet

| Feature | Status | Notes |
|---------|--------|-------|
| On-chain flag accounts | Written, not deployed | Anchor program in `solana/`, needs BPF toolchain (use Solana Playground) |
| Real verifier allowlist | Placeholder wallets | Replace `VERIFIER_ALLOWLIST` in `lib/store.ts` with real journalist pubkeys |
| Live tender data | 25 seeded, static | Would need a scraper or e-nabavki API integration |
| NFT badges | Not started | Planned — Metaplex compressed NFTs minted when a tier is reached |
| Persistent storage | localStorage only | Fine for demo, needs a DB or on-chain accounts for production |
| User accounts/profiles | None | Wallet address IS the identity |

---

## Roadmap

### Phase 1 — Make it real (next)

- [ ] Deploy the Anchor program to Solana devnet
  - Each flag becomes a deduplicated PDA account
  - Votes are recorded on-chain with verifier signatures
  - Replace the localStorage mock with program.methods calls
- [ ] Add real journalist wallets to `VERIFIER_ALLOWLIST`
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false` and `NEXT_PUBLIC_ONCHAIN_MODE=true`
- [ ] Test full on-chain flow: flag → validate → Solana Explorer link works

### Phase 2 — Expand the dataset

- [ ] Write a scraper for e-nabavki.gov.mk (or use their XML export)
- [ ] Automate nightly tender ingestion
- [ ] Add more filter dimensions: region, CPV code, contract type
- [ ] Support PDF document attachments on flags (IPFS or Arweave)

### Phase 3 — NFT badge minting

- [ ] When a citizen hits a badge tier threshold, mint a compressed NFT (Metaplex Bubblegum)
- [ ] Badge NFT = proof of civic contribution, transferable, on-chain forever
- [ ] Display NFT badge on leaderboard and flag cards
- [ ] Optional: governance weight tied to NFT badge tier

### Phase 4 — Go live

- [ ] Vercel deployment (or self-hosted)
- [ ] Real Macedonian journalist/NGO partners onboarded as verifiers
- [ ] Public launch — press, social, civil society orgs
- [ ] Mainnet migration (when volume justifies gas costs)

---

## Technical architecture

```
User browser
  └── Next.js 14 App Router (Vercel)
        ├── localStorage (demo/dev)
        └── Solana Devnet (production)
              ├── SPL Memo program (basic flag recording)
              └── Anchor program: tenderwatch (full PDA accounts)
                    └── PDAs: seeds = ["flag", tender_id, flagger_pubkey]
```

**Key files:**
- `lib/store.ts` — all flag/vote/badge logic, swap localStorage for on-chain here
- `lib/tenders.ts` — tender dataset, replace with API/DB calls
- `solana/programs/tenderwatch/src/lib.rs` — Anchor program
- `components/GradientBackground.tsx` — Canvas animated background
- `.env.local` — toggle demo vs on-chain mode

---

## Decisions made

| Decision | Rationale |
|----------|-----------|
| Solana over Ethereum | Low fees, fast finality — Macedonia is not rich, gas costs matter |
| Demo mode default | Lets anyone test without SOL — lower friction for journalists and NGOs |
| localStorage for MVP | Ship fast, validate the concept, swap storage layer later |
| 1 verifier to resolve | Low threshold for MVP — raise to 3+ in production |
| No emojis in UI | Sharp, credible, newsroom aesthetic — not a game |
| Dark default | The gradient background reads much better on dark |
| CSS variables + Tailwind | One color change switches both themes cleanly |

---

## Open questions

- Who are the first real verifiers? Need at least one journalist or NGO partner
- Should flags be anonymous (wallet only) or optionally attributed?
- What happens to a flag if a verifier rejects it? Can others re-flag the same tender?
- Governance: who decides if a verifier's allowlist entry is revoked?
- Monetization (if any): public good grants, DAO treasury, government partnership?
