import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getChildren } from "@/actions/children";
import { insforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { ChildCard } from "@/components/cards/ChildCard";
import { Badge } from "@/components/ui/badge";
import type { ChildWithFunding } from "@/actions/children";

export const metadata = {
  title: "Sponsor a Child in Uganda — Open Hearts Foundation",
  description:
    "Browse children waiting for sponsorship in Uganda. Your monthly support provides education, food, shelter, and hope for a child in need.",
  openGraph: {
    title: "Sponsor a Child in Uganda — Open Hearts Foundation",
    description:
      "Browse children waiting for sponsorship. Walk alongside a child through education and opportunity.",
  },
};

const STATUS_CHIPS = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "Partially Sponsored", value: "partial" },
  { label: "Fully Sponsored", value: "full" },
] as const;

function computeStatus(raised: number, goal: number): string {
  if (goal <= 0) return "available";
  const pct = raised / goal;
  if (pct >= 0.95) return "full";
  if (pct >= 0.1) return "partial";
  return "available";
}

// Build href for filter chips while preserving other params
function filterUrl(
  base: string,
  current: URLSearchParams,
  key: string,
  value: string
): string {
  const p = new URLSearchParams(current);
  if (value === "all" || value === "") {
    p.delete(key);
  } else {
    p.set(key, value);
  }
  p.delete("page");
  return `${base}?${p.toString()}`;
}

export default async function SponsorPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; status?: string; q?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const region = sp.region === "All" ? undefined : sp.region;
  const statusFilter = sp.status ?? "all";
  const searchQuery = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1));
  const PAGE_SIZE = 12;
  const params = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][]
  );

  const allChildren = await getChildren({
    activeOnly: true,
    region,
    searchQuery: searchQuery || undefined,
  });

  // Aggregate funding data for all children
  const { data: ledgerData } = await insforgeServer.database
    .from("donations_ledger")
    .select("child_id, amount_ugx, donor_email")
    .eq("status", "settled");

  const fundingMap = new Map<string, { raised: number; donors: Set<string> }>();
  for (const row of ledgerData ?? []) {
    let entry = fundingMap.get(row.child_id);
    if (!entry) {
      entry = { raised: 0, donors: new Set() };
      fundingMap.set(row.child_id, entry);
    }
    entry.raised += row.amount_ugx ?? 0;
    if (row.donor_email) entry.donors.add(row.donor_email);
  }

  const sort = sp.sort ?? "urgent";
  const sorted = [...allChildren].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  const enriched: ChildWithFunding[] = sorted.map((c) => {
    const fund = fundingMap.get(c.id);
    return {
      ...c,
      raised_ugx: fund?.raised ?? 0,
      donor_count: fund?.donors.size ?? 0,
    };
  });

  const filtered =
    statusFilter === "all"
      ? enriched
      : enriched.filter((c) => computeStatus(c.raised_ugx, c.goal_monthly_ugx) === statusFilter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[--color-background]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start mb-4">
            <Image
              src="/images/logo/openhearts_logo.png"
              alt="Open Hearts Foundation"
              width={48}
              height={48}
              className="rounded-full object-cover shadow-sm"
            />
          </div>
          <Badge variant="purple" className="mb-4">
            Sponsorship
          </Badge>
          <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold text-[--color-foreground] leading-tight">
            Sponsor a{" "}
            <span className="text-[--color-brand-purple]">Child</span>
          </h1>
          <p className="text-[--color-text-secondary] mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">
            Every child deserves a loving home, quality education, and a future
            full of hope. Your sponsorship provides food, shelter, and school
            fees for a child in need.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search input */}
          <form
            action="/sponsor"
            method="GET"
            className="relative flex-1 max-w-sm"
          >
            {Array.from(params.entries())
              .filter(([k]) => k !== "q")
              .map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-muted] pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search by name..."
                className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-purple)] focus:ring-1 focus:ring-[var(--color-brand-purple)] outline-none transition-colors"
            />
          </form>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            <span className="text-xs text-[--color-text-muted]">Sort:</span>
              <Link
                href={`/sponsor?${new URLSearchParams({ ...Object.fromEntries(params), sort: "urgent" }).toString()}`}
                className={`text-sm ${sort === "urgent" ? "text-[var(--color-brand-purple)] font-medium" : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)]"}`}
              >
                Most urgent
              </Link>
              <span className="text-[var(--color-text-muted)]">·</span>
              <Link
                href={`/sponsor?${new URLSearchParams({ ...Object.fromEntries(params), sort: "newest" }).toString()}`}
                className={`text-sm ${sort === "newest" ? "text-[var(--color-brand-purple)] font-medium" : "text-[var(--color-text-secondary)] hover:text-[var(--color-brand-purple)]"}`}
              >
                Newest
              </Link>
          </div>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STATUS_CHIPS.map((chip) => {
            const active = statusFilter === chip.value;
            return (
              <Link
                key={chip.value}
                href={filterUrl("/sponsor", params, "status", chip.value)}
                className={[
                  "px-4 py-1.5 rounded-[var(--radius-full)] text-sm font-medium transition-colors border",
                  active
                    ? "bg-[var(--color-brand-purple)] text-[var(--color-text-on-brand)] border-[var(--color-brand-purple)]"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-purple)] hover:text-[var(--color-brand-purple)]",
                ].join(" ")}
              >
                {chip.label}
              </Link>
            );
          })}
        </div>

        {/* Count */}
        <p className="text-sm text-[--color-text-secondary] mb-6">
          {filtered.length}{" "}
          {filtered.length === 1 ? "child" : "children"} found
        </p>

        {/* Grid */}
        {pageItems.length === 0 ? (
          <div className="text-center py-20 text-[--color-text-muted]">
            <p className="text-lg font-medium mb-2">No children found</p>
            <p className="text-sm">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageItems.map((child, i) => (
              <ChildCard key={child.id} child={child} priority={i < 3} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/sponsor?${new URLSearchParams({ ...Object.fromEntries(params), page: String(p) }).toString()}`}
                className={[
                  "w-9 h-9 flex items-center justify-center rounded-[--radius-md] text-sm transition-colors",
                  p === page
                    ? "bg-[--color-brand-purple] text-white"
                    : "bg-[--color-surface] border border-[--color-border] text-[--color-text-secondary] hover:border-[--color-brand-purple]",
                ].join(" ")}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
