export function SiteFooter() {
  return (
    <footer
      className="border-t"
      style={{
        background: "#0a0a0a",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <p className="text-xs text-white/25 tracking-wide">
          Anyone can flag. Verification has skin in the game. The record is permanent.
        </p>
        <p className="text-xs text-white/20 font-mono">
          Built on Blockchain
        </p>
      </div>
    </footer>
  );
}
