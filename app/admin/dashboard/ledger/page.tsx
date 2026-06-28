import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/auth";
import { getLedgerRecords } from "@/actions/donations";
import { Card } from "@/components/cards/card";
import { StatusBadge, ProviderBadge } from "@/components/ui/badge";

export const metadata = { title: "Ledger — Open Hearts Foundation Admin" };

export default async function LedgerPage() {
  const session = await getAdminSession();
  if (!session || session.role !== "super_admin") {
    redirect("/admin/dashboard");
  }

  const records = await getLedgerRecords({ limit: 100 });

  const totalSettledUgx = records
    .filter((r: any) => r.status === "settled")
    .reduce((s: number, r: any) => s + (Number(r.amount_ugx) || 0), 0);

  const byProvider: Record<string, number> = {};
  for (const r of records.filter((r: any) => r.status === "settled")) {
    byProvider[r.provider] = (byProvider[r.provider] ?? 0) + (Number(r.amount_ugx) || 0);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6">
        Financial audit ledger
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total settled (UGX)</p>
          <p className="text-xl font-bold text-[var(--color-foreground)]">
            {totalSettledUgx.toLocaleString()}
          </p>
        </Card>
        {Object.entries(byProvider).map(([provider, amount]) => (
          <Card key={provider}>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">{provider}</p>
            <p className="text-xl font-bold text-[var(--color-foreground)]">
              {amount.toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding="none">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            All transactions
          </h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {records.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["DATE", "CHILD", "PROVIDER", "AMOUNT", "STATUS", "RECEIPT"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-[var(--color-text-muted)] px-4 py-3 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                records.map((row: any) => {
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
                      <td className="px-4 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                        {date}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">
                        {row.children_profiles?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <ProviderBadge provider={row.provider} />
                      </td>
                      <td className="px-4 py-3 font-medium">{amount}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[var(--color-text-muted)]">
                        {row.receipt_reference ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
