import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

const LAST_UPDATED = "29 June 2026";

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-[14px] leading-relaxed text-[var(--color-foreground)]">
          <section>
            <h2 className="text-[16px] font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-[var(--color-text-secondary)] mb-2">
              When you sponsor a child through Open Hearts Foundation, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
              <li>Your full name and email address (provided at donation)</li>
              <li>Donation amount, payment method, and transaction reference</li>
              <li>Technical data such as IP address and browser fingerprint (for fraud prevention and rate limiting)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
              <li>Process your sponsorship donation securely via Flutterwave</li>
              <li>Send you a confirmation email and receipt for your donation</li>
              <li>Maintain accurate financial records for audit and regulatory compliance</li>
              <li>Display aggregated donor counts on child profiles (never individual names)</li>
              <li>Prevent fraud through rate limiting and Turnstile verification</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">3. Data Sharing</h2>
            <p className="text-[var(--color-text-secondary)] mb-2">
              We share your data only with essential service providers who process it on our behalf:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
              <li><strong>Flutterwave</strong> — payment processing (card and mobile money)</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>InsForge</strong> — secure database and authentication infrastructure</li>
            </ul>
            <p className="text-[var(--color-text-secondary)] mt-2">
              We never sell, rent, or trade your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">4. Child Privacy</h2>
            <p className="text-[var(--color-text-secondary)]">
              The children featured on this platform are photographed and profiled with full consent
              from their guardians and in coordination with local child welfare authorities. We
              never disclose a child&apos;s exact location, family details, or sensitive personal
              information. All child images and narratives are used exclusively for sponsorship
              purposes and are removed upon request if a child exits the programme.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">5. Data Retention</h2>
            <p className="text-[var(--color-text-secondary)]">
              Donation records are retained permanently for financial audit and regulatory compliance
              as required by Ugandan and UK charity law. Personal data such as email addresses may
              be retained for ongoing sponsorship communication. You may request deletion of your
              personal data by contacting us, subject to legal retention requirements.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">6. Security</h2>
            <p className="text-[var(--color-text-secondary)]">
              We implement appropriate technical and organisational measures to protect your data,
              including encryption in transit (TLS), rate limiting on all public endpoints,
              server-side payment processing (no card data touches our servers), and strict access
              controls on administrative functions.
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold mb-3">7. Contact</h2>
            <p className="text-[var(--color-text-secondary)]">
              If you have questions about this policy or wish to exercise your data protection rights,
              please contact us at{" "}
              <a
                href="mailto:privacy@openheartsfoundation.org"
                className="text-[var(--color-brand-purple)] hover:underline"
              >
                privacy@openheartsfoundation.org
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
