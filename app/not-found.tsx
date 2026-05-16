import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-24 text-center max-w-md mx-auto animate-fade-in">
      <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">404</p>
      <h1 className="font-serif text-4xl mb-4 tracking-tight">Page not found</h1>
      <p className="text-muted mb-6">
        That page doesn&apos;t exist. The on-chain record, however, still does.
      </p>
      <Link href="/" className="text-ink underline underline-offset-4">
        Return home
      </Link>
    </div>
  );
}
