import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getChildById } from "@/actions/children";
import { Navbar } from "@/components/layout/Navbar";
import { DonationMeter } from "@/components/ui/progress-bar";
import { ChildVideoCard } from "@/components/cards/ChildVideoCard";
import { computeAge } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const child = await getChildById(id);
  if (!child) {
    return { title: "Child not found — Open Hearts Foundation" };
  }
  return {
    title: `${child.name}, ${computeAge(child.date_of_birth)} — Sponsor a Child in Uganda`,
    description:
      child.narrative
        ? child.narrative.slice(0, 160).replace(/"/g, "")
        : `Support ${child.name}'s education and future through sponsorship in ${child.region}, Uganda.`,
    openGraph: {
      title: `${child.name} — Open Hearts Foundation`,
      description: `Sponsor ${child.name} from ${child.region}, Uganda. Your support provides education, food, and shelter.`,
      images: child.profile_image_url
        ? [{ url: child.profile_image_url, width: 800, height: 600, alt: child.name }]
        : undefined,
    },
  };
}

export default async function ChildProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = await getChildById(id);
  if (!child || !child.is_active) notFound();

  const age = computeAge(child.date_of_birth);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
          <Link href="/sponsor" className="hover:text-[var(--color-foreground)]">
            All children
          </Link>
          <span>/</span>
          <span className="text-[var(--color-foreground)]">{child.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {child.video_url ? (
              <ChildVideoCard videoUrl={child.video_url} childName={child.name} />
            ) : child.profile_image_url ? (
              <div className="relative w-full aspect-[4/3] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-muted)]">
                <Image
                  src={child.profile_image_url}
                  alt={child.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                  <Image
                    src="/images/logo/openhearts_logo.png"
                    alt=""
                    width={16}
                    height={16}
                    className="rounded-full object-cover"
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-semibold text-[var(--color-brand-purple)]">Open Hearts</span>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] flex items-center justify-center">
                <span className="text-8xl font-bold text-[var(--color-text-muted)]">
                  {child.name[0]}
                </span>
              </div>
            )}

            <div>
              <h1 className="text-[16px] font-semibold text-[var(--color-foreground)]">
                {child.name}, {age}
              </h1>
              <span className="inline-block rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2 py-0.5 text-[12px] font-medium text-[var(--color-text-secondary)] mt-1">
                {child.region}
              </span>
            </div>

            <div className="max-w-prose">
              <p className="text-[14px] leading-relaxed text-[var(--color-foreground)] whitespace-pre-wrap">
                {child.narrative}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <DonationMeter raised={child.raised_ugx} goal={child.goal_monthly_ugx} />

            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <p className="text-[14px] text-[var(--color-foreground)]">
                <span className="font-semibold">{child.donor_count}</span>{" "}
                {child.donor_count === 1 ? "sponsor" : "sponsors"}
              </p>
              <p className="text-[12px] text-[var(--color-text-muted)] mt-1">
                supporting {child.name}
              </p>
            </div>

            <Link
              href={`/sponsor/${child.id}/donate`}
              className="block w-full text-center rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-6 py-2 text-[14px] font-medium text-white hover:bg-[var(--color-brand-purple-dark)] transition-colors"
            >
              Sponsor {child.name}
            </Link>
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
              <Image
                  src="/images/logo/openhearts_logo.png"
                alt="Open Hearts Foundation"
                width={20}
                height={20}
                className="rounded-full object-cover opacity-75"
              />
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Open Hearts Foundation · Registered Charity
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
