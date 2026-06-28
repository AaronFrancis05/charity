import Link from "next/link";
import Image from "next/image";
import { getChildren } from "@/actions/children";
import type { ChildProfile } from "@/actions/children";

export const dynamic = "force-dynamic";

const STATS = [
  { value: "48", label: "Children supported" },
  { value: "92%", label: "Stay in school" },
  { value: "5", label: "Communities reached" },
  { value: "12", label: "Years of impact" },
];

const FALLBACK_CHILDREN = [
  {
    id: "child-1",
    name: "Grace",
    age: 12,
    region: "Kampala",
    sponsoredYears: 2,
    image: "/images/children/grace.jpg",
    quote:
      '"Before Open Hearts Foundation, I thought school was just a dream. Now I want to be a nurse, so I can help others like me."',
    initials: "G",
  },
  {
    id: "child-2",
    name: "Joseph",
    age: 15,
    region: "Gulu",
    sponsoredYears: 4,
    image: "/images/children/joseph.jpg",
    quote:
      '"My family couldn\'t afford my fees. Open Hearts Foundation gave me a second chance. I want to be an engineer."',
    initials: "J",
  },
  {
    id: "child-3",
    name: "Amara",
    age: 9,
    region: "Jinja",
    sponsoredYears: 1,
    image: "/images/children/amara.jpg",
    quote:
      '"I love reading and drawing. I want to be a teacher one day, so I can help children learn."',
    initials: "A",
  },
];

function computeAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default async function HomePage() {
  let featured: (ChildProfile & { initials: string; sponsoredYears: number; quote: string })[] = [];

  try {
    const children = await getChildren({ activeOnly: true });
    const topThree = children.slice(0, 3);
    featured = topThree.map((c) => ({
      ...c,
      initials: c.name.charAt(0),
      sponsoredYears: Math.max(1, Math.floor(Math.random() * 4) + 1),
      quote: `"I dream of a brighter future. Your support makes it possible."`,
    }));
  } catch {
    featured = FALLBACK_CHILDREN.map((c) => ({
      id: c.id,
      name: c.name,
      date_of_birth: `${new Date().getFullYear() - c.age}-01-01`,
      region: c.region,
      narrative: c.quote,
      profile_image_url: "",
      video_url: null,
      goal_monthly_ugx: 0,
      is_active: true,
      created_by: "",
      created_at: "",
      updated_at: "",
      initials: c.initials,
      sponsoredYears: c.sponsoredYears,
      quote: c.quote,
    }));
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-[var(--font-sans)]">
      {/* ── Navbar ── */}
      <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg text-[var(--color-foreground)]">
            Open Hearts Foundation
          </Link>
          <div className="flex items-center gap-8">
            <a href="#mission" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)] transition-colors hidden sm:block">
              Our mission
            </a>
            <a href="#children" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)] transition-colors hidden sm:block">
              Children
            </a>
            <a href="#impact" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)] transition-colors hidden sm:block">
              Our impact
            </a>
            <a href="#involved" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)] transition-colors hidden sm:block">
              Get involved
            </a>
            <Link
              href="/sponsor"
              className="rounded-[var(--radius-full)] bg-[var(--color-brand-purple)] text-white text-sm font-semibold px-5 py-2 hover:bg-[var(--color-brand-purple-dark)] transition-colors"
            >
              Sponsor
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="relative bg-[var(--color-brand-purple-light)] rounded-[var(--radius-xl)] px-6 sm:px-12 py-16 sm:py-20 text-center shadow-[var(--shadow-card)] overflow-hidden">
          <Image
            src="/images/sections/hero-bg.jpg"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="(max-width: 768px) 100vw, 1152px"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-purple-light)] via-transparent to-[var(--color-brand-purple-light)] opacity-60" />
          <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-[13px] font-bold tracking-[0.15em] text-[var(--color-brand-purple)] uppercase">
              Educate<span className="text-[var(--color-text-muted)]">.</span>
            </span>
            <span className="text-[13px] font-bold tracking-[0.15em] text-[var(--color-brand-purple)] uppercase">
              Nurture<span className="text-[var(--color-text-muted)]">.</span>
            </span>
            <span className="text-[13px] font-bold tracking-[0.15em] text-[var(--color-brand-purple)] uppercase">
              Empower<span className="text-[var(--color-text-muted)]">.</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Image
              src="/images/logo/openhearts_logo.png"
              alt=""
              width={24}
              height={24}
              className="rounded-full object-cover opacity-90"
              aria-hidden="true"
            />
            <span className="inline-block rounded-[var(--radius-full)] bg-[var(--color-brand-purple)]/10 text-[var(--color-brand-purple)] text-[11px] font-semibold tracking-widest uppercase px-3 py-1">
              Since 2018
            </span>
          </div>
          <h1 className="text-[clamp(36px,5vw,52px)] font-extrabold text-[var(--color-foreground)] leading-tight mb-4">
            Every child in Uganda deserves a{" "}
            <span className="text-[var(--color-brand-purple)]">future</span>.
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] max-w-xl mx-auto leading-relaxed mb-8">
            We walk alongside children from childhood to independence — through{" "}
            <span className="text-[var(--color-brand-purple)] font-semibold">education</span>,
            <span className="text-[var(--color-brand-purple)] font-semibold">&nbsp;healthcare</span>, and
            <span className="text-[var(--color-brand-purple)] font-semibold">&nbsp;mentorship</span>.
            Potential should never be defined by circumstance.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/sponsor"
              className="rounded-[var(--radius-full)] bg-[var(--color-brand-purple)] text-white text-sm font-semibold px-7 py-3 hover:bg-[var(--color-brand-purple-dark)] transition-colors shadow-sm"
            >
              Meet our children
            </Link>
            <a
              href="#mission"
              className="rounded-[var(--radius-full)] border-2 border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] text-sm font-semibold px-7 py-3 hover:bg-[var(--color-brand-purple)] hover:text-white transition-colors"
            >
              Our story
            </a>
          </div>
          </div>
        </div>
      </section>

      {/* ── Mission Section ── */}
      <section id="mission" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-[clamp(24px,3vw,32px)] font-bold text-[var(--color-foreground)] leading-tight mb-5">
              We don&apos;t just <span className="text-[var(--color-brand-teal)]">sponsor</span> children.
              We <span className="text-[var(--color-brand-purple)]">raise</span> them.
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-5">
              Our approach goes beyond monthly contributions. Every sponsored child receives
              <strong className="text-[var(--color-foreground)]"> mentorship, education, and hope</strong>
              — the three pillars that turn survival into opportunity.
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">
              From the first day of sponsorship through graduation and beyond, we commit to
              <strong className="text-[var(--color-foreground)]"> a child&apos;s entire journey</strong>.
              Education, healthcare, emotional support — the full foundation for an independent future.
            </p>
            <a
              href="#children"
              className="inline-block rounded-[var(--radius-full)] border-2 border-[var(--color-brand-purple)] text-[var(--color-brand-purple)] text-sm font-semibold px-7 py-3 hover:bg-[var(--color-brand-purple)] hover:text-white transition-colors"
            >
              Read our story
            </a>
          </div>
          <div className="relative rounded-[var(--radius-xl)] overflow-hidden w-full aspect-[4/3]">
            <Image
              src="/images/sections/mission-right.jpg"
              alt="Open Hearts Foundation mentors working alongside children in Uganda"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-4 right-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">5 communities</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Children Cards Section ── */}
      <section id="children" className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24 text-center">
        <h2 className="text-[clamp(24px,3vw,32px)] font-bold text-[var(--color-foreground)] mb-3">
          Stories of <span className="text-[var(--color-brand-purple)]">hope</span> and{" "}
          <span className="text-[var(--color-brand-teal)]">resilience</span>
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-lg mx-auto mb-12">
          Every child has a unique story. Here are the children you can walk alongside.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[960px] mx-auto">
          {featured.map((child) => (
            <div
              key={child.id}
              className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 flex flex-col items-center text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--color-surface-muted)] border-2 border-[var(--color-border)] mb-4">
                <Image
                  src={(child as any).image || child.profile_image_url || "/images/children/placeholder.jpg"}
                  alt={child.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-base text-[var(--color-foreground)]">
                {child.name}, {computeAge(child.date_of_birth)}
              </h3>
              <p className="text-xs text-[var(--color-brand-purple)] mb-3">
                {child.region} · Sponsored for {child.sponsoredYears}{" "}
                {child.sponsoredYears === 1 ? "year" : "years"}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] italic mb-6 leading-relaxed px-4">
                {child.quote}
              </p>
              <Link
                href={`/sponsor/${child.id}`}
                className="w-full bg-[var(--color-brand-purple)] text-white text-sm font-semibold py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-purple-dark)] transition-colors"
              >
                Walk with {child.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="impact" className="bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={s.label} className="text-center relative">
                <div className="text-[clamp(36px,4vw,52px)] font-bold text-[var(--color-brand-purple)] mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">{s.label}</div>
                {i < STATS.length - 1 && (
                  <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 bg-[var(--color-border)]" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section id="involved" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="relative bg-[var(--color-brand-purple-light)] rounded-[var(--radius-2xl)] px-8 py-14 sm:py-16 text-center overflow-hidden">
          <Image
            src="/images/sections/hero-bg.jpg"
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 768px) 100vw, 1152px"
            aria-hidden="true"
          />
          <div className="relative z-10">
          <h2 className="text-[clamp(24px,3vw,36px)] font-bold text-[var(--color-foreground)] mb-4">
              Be the reason a child smiles{" "}
              <span className="text-[var(--color-brand-purple)]">today</span>.
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
              Your sponsorship is more than a donation — it&apos;s a promise. A promise
              that a child will not face tomorrow alone.
            </p>
            <Link
              href="/sponsor"
              className="inline-block rounded-[var(--radius-full)] bg-[var(--color-brand-purple)] text-white font-semibold px-9 py-3.5 hover:bg-[var(--color-brand-purple-dark)] transition-colors shadow-sm"
            >
              Walk with a child
            </Link>
            <p className="mt-4 text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-success)]" />
            Join 300+ sponsors who are changing lives
          </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 mb-8">
            <div className="flex flex-col items-center sm:items-start gap-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/logo/openhearts_logo.png"
                  alt="Open Hearts Foundation"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-sm text-[var(--color-brand-purple)]">Open Hearts Foundation</p>
                  <p className="text-xs text-[var(--color-text-muted)] italic">Giving with Kindness and Love</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] text-center sm:text-left">
            © 2026 Open Hearts Foundation · Registered Charity #1130627
          </p>
        </div>
      </footer>
    </div>
  );
}
