"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";
import { AirdropButton } from "@/components/AirdropButton";
import { isOnChainMode } from "@/lib/utils";

const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export function SiteHeader() {
  return (
    <header className="border-b border-sand bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Eye className="h-5 w-5 text-ink transition-transform group-hover:scale-110" />
          <span className="font-serif text-xl tracking-tight">TenderWatch</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/tenders" className="text-ink hover:text-ink/70 transition-colors">
            Browse
          </Link>
          <Link href="/suspicious" className="text-ink hover:text-ink/70 transition-colors">
            Suspicious
          </Link>
          <Link href="/verifier" className="text-ink hover:text-ink/70 transition-colors">
            Verifier
          </Link>
          <Link href="/leaderboard" className="text-ink hover:text-ink/70 transition-colors">
            Leaderboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {isOnChainMode() && (
            <div className="hidden sm:block">
              <AirdropButton />
            </div>
          )}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
