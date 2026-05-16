"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { requestDevnetAirdrop } from "@/lib/solana/memo";
import { Droplet } from "lucide-react";
import { toast } from "sonner";
import { explorerTx, formatEUR } from "@/lib/utils";

export function AirdropButton() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    let cancelled = false;
    const refresh = async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) setBalance(lamports / 1_000_000_000);
      } catch {
        if (!cancelled) setBalance(null);
      }
    };
    refresh();
    const id = setInterval(refresh, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicKey, connection]);

  if (!connected || !publicKey) return null;

  const handleAirdrop = async () => {
    setLoading(true);
    try {
      const sig = await requestDevnetAirdrop(connection, publicKey, 1);
      toast.success("1 devnet SOL airdropped", {
        description: "Faucet credited your wallet. You can now flag tenders.",
        action: { label: "View tx", onClick: () => window.open(explorerTx(sig), "_blank") },
      });
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1_000_000_000);
    } catch (e) {
      toast.error("Airdrop failed", {
        description:
          e instanceof Error
            ? `${e.message}. Devnet faucet is rate-limited — try faucet.solana.com.`
            : "Devnet faucet is rate-limited. Try faucet.solana.com.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="font-mono">
        {balance === null ? "…" : `${balance.toFixed(3)} SOL`}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAirdrop}
        disabled={loading || (balance !== null && balance >= 2)}
        title={balance !== null && balance >= 2 ? "You already have enough SOL" : "Request 1 SOL from devnet faucet"}
      >
        <Droplet className="h-3 w-3" />
        {loading ? "Requesting…" : "Airdrop"}
      </Button>
    </div>
  );
}
