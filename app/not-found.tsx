import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/images/logo/openhearts_logo.png"
          alt="Open Hearts Foundation"
          width={80}
          height={80}
          className="rounded-full object-cover mx-auto mb-6 opacity-60"
        />
        <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-4">
          Page not found
        </h1>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
