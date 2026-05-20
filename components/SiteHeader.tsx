"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu, X } from "lucide-react";
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
      className="flex items-center justify-center w-8 h-8 rounded-md border border-white/10 text-white/40 hover:text-white hover:border-[#0084ff]/40 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}

const NAV = [
  { href: "/tenders",     label: "Contracts"   },
  { href: "/spending",    label: "Spending"    },
  { href: "/profiles",    label: "Profiles"    },
  { href: "/bounties",    label: "Bounties"    },
  { href: "/wallet",      label: "Wallet"      },
  { href: "/verifier",    label: "Verifier"    },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          background: "rgba(10,10,10,0.8)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="container flex h-14 items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="group shrink-0">
            <span className="font-bold text-base tracking-tight text-white group-hover:text-[#0084ff] transition-colors duration-200">
              contr
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[12px] font-medium text-white/45 hover:text-white transition-colors duration-200 tracking-wide"
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
            <div className="hidden sm:block">
              <WalletButton />
            </div>
            {/* Hamburger — mobile only */}
            <button
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-md border border-white/10 text-white/40 hover:text-white hover:border-[#0084ff]/40 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: "rgba(8,12,26,0.98)", top: "56px" }}
        >
          <nav className="flex flex-col px-6 py-8 gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-lg font-light text-white/60 hover:text-white py-3 border-b border-white/[0.06] transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="mt-6">
              <WalletButton />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
