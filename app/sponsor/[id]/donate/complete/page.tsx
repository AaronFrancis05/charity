import Link from "next/link";
import { insforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";

export default async function CompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tx_ref?: string }>;
}) {
  const { id } = await params;
  const { tx_ref: txRef } = await searchParams;
  let status: string | null = null;

  if (txRef) {
    const { data } = await insforgeServer.database
      .from("donations_ledger")
      .select("status")
      .eq("provider_reference", txRef)
      .single();
    status = data?.status ?? null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        {status === "failed" ? (
          <>
            <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-4">
              Payment failed
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
              Your payment could not be processed. Please try again.
            </p>
            <Link
              href={`/sponsor/${id}/donate`}
              className="inline-block rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)]"
            >
              Try again
            </Link>
          </>
        ) : status === "settled" || status === "pending" || status === "initiated" ? (
          <>
            <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-4">
              Thank you for your sponsorship!
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
              Your payment was received. A confirmation email will be sent to you shortly.
            </p>
            <Link
              href="/sponsor"
              className="inline-block rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)]"
            >
              Browse more children
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-4">
              Payment not found
            </h1>
            <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
              We could not find a record of this payment.
            </p>
            <Link
              href={`/sponsor/${id}/donate`}
              className="inline-block rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)]"
            >
              Try donating again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
