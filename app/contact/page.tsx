import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function ContactPage() {
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
          Contact Us
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          We&apos;d love to hear from you. Reach out with questions, partnership inquiries, or to
          learn more about our work.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-brand-purple-light)] flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-[var(--color-brand-purple)]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[var(--color-foreground)] mb-1">Email</h3>
            <a
              href="mailto:hello@openheartsfoundation.org"
              className="text-sm text-[var(--color-brand-purple)] hover:underline"
            >
              hello@openheartsfoundation.org
            </a>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-brand-purple-light)] flex items-center justify-center mb-4">
              <Phone className="w-5 h-5 text-[var(--color-brand-purple)]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[var(--color-foreground)] mb-1">Phone</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">+256 700 000 000</p>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:col-span-2">
            <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-brand-purple-light)] flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-[var(--color-brand-purple)]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[var(--color-foreground)] mb-1">Address</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Open Hearts Foundation<br />
              Kampala, Uganda<br />
              P.O. Box 0000
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
          <h2 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-6">
            Send us a message
          </h2>
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                  Your name
                </span>
                <input
                  type="text"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-purple)]"
                  placeholder="e.g. Jane Smith"
                  required
                />
              </label>
              <label className="block">
                <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                  Your email
                </span>
                <input
                  type="email"
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-purple)]"
                  placeholder="e.g. jane@example.com"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                Subject
              </span>
              <input
                type="text"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-purple)]"
                placeholder="How can we help?"
                required
              />
            </label>
            <label className="block">
              <span className="block text-[14px] font-medium text-[var(--color-foreground)] mb-1">
                Message
              </span>
              <textarea
                rows={5}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[14px] text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-purple)] resize-y"
                placeholder="Tell us more about your inquiry..."
                required
              />
            </label>
            <button
              type="submit"
              className="rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] text-white font-medium text-[14px] px-6 py-2.5 hover:bg-[var(--color-brand-purple-dark)] transition-colors"
            >
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
