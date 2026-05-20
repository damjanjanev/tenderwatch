'use client'

import { useEffect, useState, useMemo, useRef } from "react"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { TENDERS } from "@/lib/tenders"
import { useFlags, useHasMounted } from "@/lib/store"
import { useAllTenderReports, getTenderReportStatus } from "@/lib/tenderReports"
import ShaderBackground from "@/components/ui/shader-background"

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || value === 0) return
    const duration = 1200
    const steps = 40
    const increment = value / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setDisplay(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  return (
    <div ref={ref} className="font-light leading-none tabular-nums">
      {display}{suffix}
    </div>
  )
}

// ── Stagger helpers ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0 },
}
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

// ── Main component ────────────────────────────────────────────────────────────
export function TuringLanding() {
  const mounted    = useHasMounted()
  const flags      = useFlags()
  const allReports = useAllTenderReports()

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlBg = html.style.backgroundColor
    const prevBodyBg = body.style.backgroundColor
    html.style.backgroundColor = 'transparent'
    body.style.backgroundColor = 'transparent'
    return () => {
      html.style.backgroundColor = prevHtmlBg
      body.style.backgroundColor = prevBodyBg
    }
  }, [])

  const stats = useMemo(() => {
    if (!mounted) return { verified: 0, flagCount: 0, underReview: 0 }
    const byTender = new Map<string, typeof allReports>()
    for (const r of allReports) {
      const list = byTender.get(r.tenderId) ?? []
      list.push(r)
      byTender.set(r.tenderId, list)
    }
    let verified = 0, underReview = 0
    for (const [, rpts] of byTender) {
      const s = getTenderReportStatus(rpts)
      if (s === "VerifiedSuspicious") verified++
      else if (s === "UnderReview")   underReview++
    }
    return { verified, flagCount: flags.length, underReview }
  }, [mounted, flags, allReports])

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

      <ShaderBackground />

      <div className="fixed inset-0 pointer-events-none select-none"
        style={{ zIndex: 1, background: "rgba(5,5,18,0.38)" }}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <main className="min-h-screen pt-[120px] md:pt-[200px] pb-24" style={{ position: 'relative', zIndex: 2 }}>

        <div className="absolute bottom-0 left-0 w-full h-40 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(5,5,15,0.9))" }}
        />

        <div className="max-w-[1400px] mx-auto px-5 md:px-[60px] flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 lg:gap-8 relative z-[2]">

          {/* ── Left: headline + CTA ─────────────────────────────────── */}
          <motion.div
            className="w-full max-w-[780px]"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 text-[#0084ff] text-[10px] uppercase tracking-[0.2em] mb-6 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0084ff] animate-pulse" />
                Public Contract Transparency
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-light leading-[1.05] mb-6 tracking-[-1px] md:tracking-[-2px]"
            >
              Track every<br />
              <span className="text-[#0084ff]">government</span><br />
              contract.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7 }}
              className="text-base md:text-lg leading-relaxed text-[#b8b8b8] mb-10 font-normal max-w-[560px]"
            >
              Citizens flag suspicious tenders. Journalists verify.<br className="hidden sm:block" />
              Every record is permanent and public.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center"
            >
              <Link
                href="/tenders"
                className="inline-flex items-center gap-2.5 bg-[#0084ff] text-white py-3.5 px-7 rounded-md text-base font-medium hover:bg-[#0066cc] transition-all duration-200 w-full sm:w-auto justify-center"
              >
                Browse Contracts
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="text-[#b8b8b8] py-3 px-2 text-base font-medium hover:text-white transition-colors duration-200"
              >
                How it works
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Right: live stats ────────────────────────────────────── */}
          <motion.div
            className="flex flex-row gap-8 sm:gap-12 lg:gap-20 items-end shrink-0 w-full lg:w-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
          >
            <div className="text-center">
              <div className="text-[40px] sm:text-[52px] md:text-[64px] mb-1">
                <AnimatedNumber value={TENDERS.length} />
              </div>
              <div className="text-[10px] sm:text-sm text-[#b8b8b8] font-normal uppercase tracking-widest">
                Contracts
              </div>
            </div>
            <div className="text-center">
              <div className="text-[40px] sm:text-[52px] md:text-[64px] mb-1">
                {mounted
                  ? <AnimatedNumber value={stats.flagCount} suffix="+" />
                  : <span className="text-[#444]">—</span>
                }
              </div>
              <div className="text-[10px] sm:text-sm text-[#b8b8b8] font-normal uppercase tracking-widest">
                Flags raised
              </div>
            </div>
            <div className="text-center">
              <div className="text-[40px] sm:text-[52px] md:text-[64px] mb-1 text-[#0084ff]">
                {mounted
                  ? <AnimatedNumber value={stats.verified} />
                  : <span className="text-[#444]">—</span>
                }
              </div>
              <div className="text-[10px] sm:text-sm text-[#b8b8b8] font-normal uppercase tracking-widest">
                Verified
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <div style={{ background: "rgba(5,5,18,0.92)", position: 'relative', zIndex: 2 }}>
        <section id="how-it-works" className="relative py-20 md:py-32 px-5 md:px-[60px] max-w-[1400px] mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-12 md:mb-20"
          >
            <span className="text-[#0084ff] text-[10px] uppercase tracking-[0.25em] font-medium block mb-4">
              How it works
            </span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
              Civic accountability<br />in three steps.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden">
            {[
              {
                n: "01",
                title: "Browse contracts",
                body: "Every government contract indexed and searchable by ministry, contractor, amount, or keyword.",
                href: "/tenders",
              },
              {
                n: "02",
                title: "Flag what's wrong",
                body: "Connect your wallet. Write your reason. Your flag is hashed and stored on blockchain — permanently.",
                href: "/tenders",
              },
              {
                n: "03",
                title: "Journalists verify",
                body: "Credentialed journalists review every flag. Accurate tips earn contr tokens on-chain.",
                href: "/leaderboard",
              },
            ].map(({ n, title, body, href }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="group relative p-7 md:p-10 cursor-pointer overflow-hidden"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(circle at 50% 100%, rgba(0,132,255,0.08) 0%, transparent 70%)" }}
                />
                <div className="relative z-10">
                  <div className="font-mono text-xs text-[#0084ff]/60 mb-5">{n}</div>
                  <h3 className="text-lg md:text-xl font-light text-white mb-3">{title}</h3>
                  <p className="text-sm text-[#b8b8b8] leading-relaxed mb-6">{body}</p>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-[#0084ff] text-sm hover:gap-3 transition-all duration-200"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-14 md:mt-24 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/5 rounded-xl p-7 md:p-10"
            style={{ background: "rgba(0,132,255,0.04)" }}
          >
            <div>
              <p className="text-xl md:text-2xl font-light text-white mb-2">Ready to follow the money?</p>
              <p className="text-[#b8b8b8] text-sm">Start browsing — no account needed.</p>
            </div>
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2.5 bg-[#0084ff] text-white py-3.5 px-8 rounded-md font-medium hover:bg-[#0066cc] transition-colors duration-200 shrink-0 w-full sm:w-auto justify-center"
            >
              Browse Contracts <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

        </section>
      </div>
    </div>
  )
}
