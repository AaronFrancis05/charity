import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getChildById } from "@/actions/children";
import { getLedgerRecords } from "@/actions/donations";
import { getAdminSession } from "@/actions/auth";
import { Card } from "@/components/cards/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, ProviderBadge } from "@/components/ui/badge";

export default async function AdminChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getAdminSession();
  const child = await getChildById(id);
  if (!child) notFound();

  const ledger = await getLedgerRecords({ childId: id });

  const settledTotal = ledger
    .filter((r: any) => r.status === "settled")
    .reduce((s: number, r: any) => s + (Number(r.amount_ugx) ?? 0), 0);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link href="/admin/dashboard/children" className="hover:text-[var(--color-foreground)]">
          Children
        </Link>
        <span>/</span>
        <span className="text-[var(--color-foreground)]">{child.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">{child.name}</h2>
          <Badge variant={child.is_active ? "success" : "default"}>
            {child.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Link
          href={`/admin/dashboard/children/${child.id}/edit`}
          className="w-full sm:w-auto rounded-[var(--radius-md)] bg-[var(--color-brand-purple)] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[var(--color-brand-purple-dark)] min-h-[44px] flex items-center justify-center"
        >
          Edit profile
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Monthly goal</p>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            UGX {child.goal_monthly_ugx.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total raised</p>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            UGX {settledTotal.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Sponsors</p>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            {child.donor_count}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-3">
            Biography
          </h3>
          <p className="text-[14px] text-[var(--color-foreground)] whitespace-pre-wrap leading-relaxed">
            {child.narrative}
          </p>
        </Card>

        <Card>
          <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-3">
            Details
          </h3>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-[12px] text-[var(--color-text-muted)] uppercase">Region</dt>
              <dd className="text-[14px] text-[var(--color-foreground)]">{child.region}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[12px] text-[var(--color-text-muted)] uppercase">Date of birth</dt>
              <dd className="text-[14px] text-[var(--color-foreground)]">{child.date_of_birth}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[12px] text-[var(--color-text-muted)] uppercase">Monthly goal</dt>
              <dd className="text-[14px] text-[var(--color-foreground)]">
                UGX {child.goal_monthly_ugx.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[12px] text-[var(--color-text-muted)] uppercase">Raised</dt>
              <dd className="text-[14px] text-[var(--color-foreground)]">
                UGX {settledTotal.toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {child.profile_image_url && (
        <Card className="mb-6">
          <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-3">
            Profile photo
          </h3>
          <div className="relative w-48 h-48 rounded-[var(--radius-lg)] overflow-hidden">
            <Image
              src={child.profile_image_url}
              alt={child.name}
              fill
              className="object-cover"
            />
          </div>
        </Card>
      )}

      {child.video_url && (
        <Card className="mb-6">
          <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-3">
            Profile video
          </h3>
          <video
            src={child.video_url}
            controls
            muted
            className="w-full max-w-lg rounded-[var(--radius-lg)]"
          />
        </Card>
      )}

      <Card padding="none">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            Donation history
          </h3>
        </div>
        <div className="overflow-x-auto -mx-0">
          <div className="min-w-[600px]">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["DATE", "PROVIDER", "AMOUNT", "STATUS", "RECEIPT"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-[var(--color-text-muted)] px-5 py-3 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--color-text-muted)]">
                    No donations yet
                  </td>
                </tr>
              ) : (
                (ledger as any[]).map((row) => {
                  const date = new Date(row.created_at).toLocaleDateString("en-UG", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const amount = row.amount_ugx
                    ? `UGX ${Number(row.amount_ugx).toLocaleString()}`
                    : row.amount_usd
                    ? `$${Number(row.amount_usd).toFixed(2)}`
                    : "—";

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      <td className="px-5 py-3 text-[var(--color-text-secondary)]">{date}</td>
                      <td className="px-5 py-3">
                        <ProviderBadge provider={row.provider} />
                      </td>
                      <td className="px-5 py-3 font-medium">{amount}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-5 py-3 text-xs font-mono text-[var(--color-text-muted)]">
                        {row.receipt_reference ?? "—"}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>

  );
}
