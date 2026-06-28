import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getChildById } from "@/actions/children";
import { Navbar } from "@/components/layout/Navbar";
import { DonationMeter } from "@/components/ui/progress-bar";
import { ChildVideoCard } from "@/components/cards/ChildVideoCard";
import { computeAge } from "@/lib/utils";

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
                  className="object-cover"
                  priority
                />
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
          </div>
        </div>
      </div>
    </div>
  );
}
