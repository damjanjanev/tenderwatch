import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fs from "node:fs";
import path from "node:path";

const ENV_PATH = path.resolve(".env.local");
const RPC = "https://api.devnet.solana.com";

async function loadOrCreate() {
  if (fs.existsSync(ENV_PATH)) {
    const env = fs.readFileSync(ENV_PATH, "utf-8");
    const m = env.match(/^SPONSOR_SECRET_KEY=(\[.*\])\s*$/m);
    if (m) {
      const arr = JSON.parse(m[1]);
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
  }
  return Keypair.generate();
}

function writeEnv(kp) {
  const secret = JSON.stringify(Array.from(kp.secretKey));
  let env = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf-8") : "";
  if (!env.includes("NEXT_PUBLIC_SOLANA_NETWORK")) {
    env += "NEXT_PUBLIC_SOLANA_NETWORK=devnet\n";
  }
  if (!env.includes("NEXT_PUBLIC_SOLANA_RPC_URL")) {
    env += "NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com\n";
  }
  if (env.match(/^SPONSOR_SECRET_KEY=/m)) {
    env = env.replace(/^SPONSOR_SECRET_KEY=.*$/m, `SPONSOR_SECRET_KEY=${secret}`);
  } else {
    env += `SPONSOR_SECRET_KEY=${secret}\n`;
  }
  if (env.match(/^NEXT_PUBLIC_SPONSOR_PUBKEY=/m)) {
    env = env.replace(
      /^NEXT_PUBLIC_SPONSOR_PUBKEY=.*$/m,
      `NEXT_PUBLIC_SPONSOR_PUBKEY=${kp.publicKey.toBase58()}`,
    );
  } else {
    env += `NEXT_PUBLIC_SPONSOR_PUBKEY=${kp.publicKey.toBase58()}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);
}

const kp = await loadOrCreate();
writeEnv(kp);
const conn = new Connection(RPC, "confirmed");
const before = await conn.getBalance(kp.publicKey);
console.log(`Sponsor pubkey: ${kp.publicKey.toBase58()}`);
console.log(`Current balance: ${(before / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

if (before < 1 * LAMPORTS_PER_SOL) {
  console.log("Requesting 2 SOL airdrop from devnet…");
  try {
    const sig = await conn.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
    await conn.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");
    const after = await conn.getBalance(kp.publicKey);
    console.log(`Airdrop confirmed. New balance: ${(after / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    console.log(`Tx: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
  } catch (e) {
    console.error(`Airdrop failed: ${e.message}`);
    console.log("");
    console.log("Manual fallback:");
    console.log(`  1. Open https://faucet.solana.com`);
    console.log(`  2. Paste this address: ${kp.publicKey.toBase58()}`);
    console.log(`  3. Request 2 SOL`);
  }
} else {
  console.log("Sponsor wallet already funded.");
}
