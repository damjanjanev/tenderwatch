"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Eye, Sun, Moon } from "lucide-react";
import { AirdropButton } from "@/components/AirdropButton";
import { isOnChainMode } from "@/lib/utils";
import { useEffect, useState } from "react";

const WalletButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center w-8 h-8 rounded-sm border border-sand/30 text-ink/50 hover:text-ink hover:border-sand/60 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}

const NAV = [
  { href: "/tenders",     label: "Browse"      },
  { href: "/suspicious",  label: "Suspicious"  },
  { href: "/spending",    label: "Spending"    },
  { href: "/profiles",    label: "Profiles"    },
  { href: "/verifier",    label: "Verifier"    },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  return (
    <header className="bg-surface border-b border-sand sticky top-0 z-40">
      <div className="container flex h-14 items-center justify-between gap-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <Eye className="h-4 w-4 text-ink/70 group-hover:text-ink transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
          </div>
          <span className="font-sans font-black text-sm tracking-tight text-ink">
            TenderWatch
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-[13px]">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted hover:text-ink transition-colors font-medium"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
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
