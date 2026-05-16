import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "sonner";

const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "TenderWatch — Public Tender Transparency on Solana",
  description:
    "Anyone can flag. Verification has skin in the game. The record is permanent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col bg-paper text-ink antialiased">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#1A1A1A",
                border: "1px solid #E5E0D5",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
