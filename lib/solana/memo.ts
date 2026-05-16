"use client";

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

// SPL Memo program — pre-deployed on all Solana clusters.
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export type MemoResult = { signature: string };

export async function sendMemo(
  connection: Connection,
  wallet: WalletContextState,
  memo: string,
): Promise<MemoResult> {
  if (!wallet.publicKey || !wallet.sendTransaction) {
    throw new Error("Wallet not connected");
  }

  const balance = await connection.getBalance(wallet.publicKey);
  if (balance < 5000) {
    throw new Error(
      "Not enough devnet SOL to pay tx fee. Use the 'Airdrop devnet SOL' button or visit faucet.solana.com",
    );
  }

  const data = new TextEncoder().encode(memo);
  const ix = new TransactionInstruction({
    keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(data),
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: wallet.publicKey,
    blockhash,
    lastValidBlockHeight,
  }).add(ix);

  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return { signature };
}

export async function requestDevnetAirdrop(
  connection: Connection,
  publicKey: PublicKey,
  sol = 1,
): Promise<string> {
  const sig = await connection.requestAirdrop(publicKey, sol * LAMPORTS_PER_SOL);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return sig;
}
