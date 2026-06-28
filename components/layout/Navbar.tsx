import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-[var(--color-foreground)]">
          Open Hearts Foundation
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/sponsor"
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Sponsor a child
          </Link>
        </div>
      </div>
    </nav>
  );
}
