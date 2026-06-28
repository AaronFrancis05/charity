"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-4">
          Something went wrong
        </h1>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
