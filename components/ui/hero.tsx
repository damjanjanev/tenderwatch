"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { TENDERS } from "@/lib/tenders";
import { useFlags, useHasMounted } from "@/lib/store";
import { useAllTenderReports, getTenderReportStatus } from "@/lib/tenderReports";
import { useMemo } from "react";

export default function ContrHero() {
  const mounted    = useHasMounted();
  const flags      = useFlags();
  const allReports = useAllTenderReports();

  const stats = useMemo(() => {
    if (!mounted) return { verified: 0, flagCount: 0 };
    const byTender = new Map<string, typeof allReports>();
    for (const r of allReports) {
      const list = byTender.get(r.tenderId) ?? [];
      list.push(r);
      byTender.set(r.tenderId, list);
    }
    let verified = 0;
    for (const [, rpts] of byTender) {
      if (getTenderReportStatus(rpts) === "VerifiedSuspicious") verified++;
    }
    return { verified, flagCount: flags.length };
  }, [mounted, flags, allReports]);

  return (
    <section
      className="relative w-full overflow-hidden pb-10 pt-24 font-light text-white antialiased md:pb-20 md:pt-28"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      {/* Purple glow — top right */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      {/* Purple glow — top left */}
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">

        {/* ── Animated text block ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge */}
          <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5] tracking-widest uppercase">
            Transparency on Solana
          </span>

          {/* Headline */}
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl leading-tight">
            Every contract.{" "}
            <span className="text-[#9b87f5]">On record.</span>{" "}
            Every flag. Permanent.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
            contr indexes every government contract in one searchable place.
            Citizens flag what looks wrong. Journalists verify.
            The record lives on Solana — forever.
          </p>

          {/* Live stats strip */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <div className="font-mono text-2xl font-black text-[#9b87f5]">
                {TENDERS.length}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Contracts
              </div>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div>
              <div className="font-mono text-2xl font-black text-[#9b87f5]">
                {mounted ? stats.flagCount : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Flags raised
              </div>
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <div>
              <div className="font-mono text-2xl font-black text-[#9b87f5]">
                {mounted ? stats.verified : "—"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">
                Verified suspicious
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/tenders"
              className="neumorphic-button hover:shadow-[0_0_20px_rgba(155,135,245,0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/50 sm:w-auto text-sm font-medium tracking-wide"
            >
              Browse Contracts
            </Link>
            <Link
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto text-sm"
            >
              <span>How it works</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Globe + dashboard preview ─────────────────────────────────── */}
        <motion.div
          className="relative mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          {/* Earth globe — decorative */}
          <div className="w-full flex h-40 md:h-64 relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://blocks.mvp-subha.me/assets/earth.png"
              alt=""
              aria-hidden
              className="absolute px-4 top-0 left-1/2 -translate-x-1/2 mx-auto -z-10 opacity-60"
            />
          </div>

          {/* Dashboard preview */}
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg shadow-[0_0_50px_rgba(155,135,245,0.2)]">
            <Image
              src="https://blocks.mvp-subha.me/assets/lunexa-db.png"
              alt="contr dashboard preview"
              width={1920}
              height={1080}
              className="h-auto w-full rounded-lg border border-white/10"
              priority
            />
          </div>
        </motion.div>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <div id="how-it-works" className="mt-32 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <span className="mb-4 inline-block text-xs uppercase tracking-widest text-[#9b87f5]/70">
              How it works
            </span>
            <h2 className="mx-auto mb-16 max-w-2xl text-3xl font-light md:text-4xl text-white/90">
              Civic accountability in{" "}
              <span className="text-[#9b87f5]">three steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-lg overflow-hidden text-left">
            {[
              {
                n: "01",
                title: "Browse contracts",
                body: "Every government contract, indexed and searchable by ministry, contractor, amount, or keyword.",
              },
              {
                n: "02",
                title: "Flag what looks wrong",
                body: "Connect Phantom. Write your reason. Your wallet and a hash go on Solana — permanently.",
              },
              {
                n: "03",
                title: "Journalists verify",
                body: "Credentialed journalists review flags. Accurate tips earn CONTR tokens as proof of contribution.",
              },
            ].map(({ n, title, body }) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8"
                style={{ background: "rgba(155,135,245,0.03)" }}
              >
                <div className="font-mono text-xs text-[#9b87f5]/50 mb-4">{n}</div>
                <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
