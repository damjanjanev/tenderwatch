import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GradientBackground } from "@/components/GradientBackground";
import { Toaster } from "sonner";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TenderWatch — Public Tender Transparency on Solana",
  description: "Anyone can flag. Verification has skin in the game. The record is permanent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="text-ink antialiased">

        {/* Animated liquid gradient — client component with embedded keyframes */}
        <GradientBackground />

        {/* All content above the gradient */}
        <div className="relative min-h-screen flex flex-col" style={{ zIndex: 1 }}>
          <Providers>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "rgb(20,20,20)",
                  color: "#EDEDED",
                  border: "1px solid rgb(38,38,38)",
                  borderRadius: "3px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                },
              }}
            />
          </Providers>
        </div>

      </body>
    </html>
  );
}
