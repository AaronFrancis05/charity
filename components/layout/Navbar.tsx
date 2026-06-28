import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo/openhearts_logo.png"
            alt="Open Hearts Foundation"
            width={40}
            height={40}
            className="rounded-full object-cover"
            priority
          />
          <span className="font-semibold text-base text-[var(--color-brand-purple)] hidden sm:inline">
            Open Hearts Foundation
          </span>
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
