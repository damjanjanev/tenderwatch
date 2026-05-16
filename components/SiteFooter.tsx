export function SiteFooter() {
  return (
    <footer className="border-t border-sand mt-20">
      <div className="container py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="text-xs text-muted max-w-md leading-relaxed">
          Anyone can flag. Verification has skin in the game. The record is permanent.
        </p>
        <p className="text-[11px] text-muted font-mono">
          Built on Solana Devnet · Powered by Phantom
        </p>
      </div>
    </footer>
  );
}
