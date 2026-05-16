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
    <header className="bg-ink text-paper sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Eye className="h-4 w-4 text-paper/80 group-hover:text-paper transition-colors" />
          <span className="font-sans font-bold text-sm tracking-tight text-paper">
            TenderWatch
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-[13px]">
          {[
            { href: "/tenders",     label: "Browse" },
            { href: "/suspicious",  label: "Suspicious" },
            { href: "/verifier",    label: "Verifier" },
            { href: "/leaderboard", label: "Leaderboard" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-paper/60 hover:text-paper transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
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
