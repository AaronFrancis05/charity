"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { initiateDonation } from "@/actions/donations";
import { Navbar } from "@/components/layout/Navbar";
import { PaymentSelector } from "@/components/donation/PaymentSelector";
import { TurnstileWidget } from "@/components/donation/TurnstileWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { posthog } from "@/lib/posthog-client";

type Provider = "FLUTTERWAVE" | "MTN_MOMO" | "AIRTEL_MONEY";

export default function DonatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [amountUgx, setAmountUgx] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(amountUgx);
    if (num < 5000) {
      setError("Minimum donation is UGX 5,000");
      return;
    }
    if (!donorName || donorName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!donorEmail || !donorEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) {
      setError("Please select a payment method");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check");
      return;
    }

    setSubmitting(true);
    setError(null);

    posthog.capture("donation_initiated", {
      childId: id,
      currency: "UGX",
      provider,
    });

    const result = await initiateDonation({
      childId: id,
      donorEmail,
      donorName,
      provider,
      amountUgx: Number(amountUgx),
      turnstileToken,
    });

    if (result.success) {
      router.push(result.paymentUrl);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <Link
          href={`/sponsor/${id}`}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] mb-6 inline-block"
        >
          &larr; Back to child profile
        </Link>

        <h1 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-2">
          Sponsor a child
        </h1>
        <p className="text-[14px] text-[var(--color-text-muted)] mb-8">
          {step === 1 ? "Enter your contribution details" : "Choose your payment method"}
        </p>

        {error && (
          <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-[var(--radius-md)] px-4 py-3 mb-6">
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-6">
            <label className="block">
              <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                Donation amount (UGX)
              </span>
              <Input
                type="number"
                value={amountUgx}
                onChange={(e) => setAmountUgx(e.target.value)}
                placeholder="50000"
                min={5000}
                required
              />
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                Minimum UGX 5,000
              </p>
            </label>

            <label className="block">
              <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                Your name
              </span>
              <Input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. John Smith"
                required
                minLength={2}
              />
            </label>

            <label className="block">
              <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                Your email
              </span>
              <Input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                required
              />
            </label>

            <Button type="submit" variant="default" className="w-full">
              Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="text-[14px] font-medium text-[var(--color-foreground)] mb-3">
                Payment method
              </p>
              <PaymentSelector
                selected={provider}
                onSelect={setProvider}
              />
            </div>

            <div>
              <p className="text-[14px] font-medium text-[var(--color-foreground)] mb-3">
                Security check
              </p>
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={submitting}
                disabled={submitting}
                className="flex-1"
              >
                Complete sponsorship
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
