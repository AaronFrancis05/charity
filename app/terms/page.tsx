import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const LAST_UPDATED = "29 June 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] mb-8 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-[clamp(28px,4vw,40px)] font-bold text-[var(--color-foreground)] mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-[14px] leading-relaxed text-[var(--color-foreground)]">
          <section>
            <h2 className="text-[16px] font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-[var(--color-text-secondary)]">
              By accessing or using the Open Hearts Foundation sponsorship platform, you agree to
              be bound by these Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">2. Sponsorship Donations</h2>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
              <li>All donations are made in Ugandan Shillings (UGX) with a minimum of UGX 5,000 per transaction</li>
              <li>Donations are processed through Flutterwave and subject to their terms and privacy policy</li>
              <li>Sponsorship contributions are non-refundable except in cases of confirmed processing error</li>
              <li>Donations are pooled toward the child&apos;s combined care goal — not earmarked for specific categories</li>
              <li>A receipt reference is generated for every settled donation and sent via email</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">3. Use of the Platform</h2>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
              <li>You agree not to use the platform for any unlawful purpose or in violation of applicable laws</li>
              <li>You agree not to attempt to circumvent security measures, rate limits, or payment verification</li>
              <li>You agree not to scrape, harvest, or collect child or donor data from the platform</li>
              <li>Admin accounts are provided solely to authorised personnel and must not be shared</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">4. Child Images and Stories</h2>
            <p className="text-[var(--color-text-secondary)]">
              Child profiles, images, and narratives are published with guardian consent and in
              coordination with local welfare authorities. You may not reproduce, redistribute, or
              use child images or stories outside the platform without explicit written permission
              from Open Hearts Foundation.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-[var(--color-text-secondary)]">
              Open Hearts Foundation is a registered charity operating in Uganda. We make every
              effort to ensure the platform is available and accurate but provide no guarantee of
              uninterrupted access. To the fullest extent permitted by law, we disclaim liability
              for any indirect, incidental, or consequential damages arising from your use of the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">6. Changes to Terms</h2>
            <p className="text-[var(--color-text-secondary)]">
              We reserve the right to update these terms at any time. Changes will be posted on
              this page with an updated revision date. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">7. Governing Law</h2>
            <p className="text-[var(--color-text-secondary)]">
              These terms are governed by the laws of the Republic of Uganda. Any disputes shall
              be resolved through amicable negotiation or, if necessary, in the courts of Kampala, Uganda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
