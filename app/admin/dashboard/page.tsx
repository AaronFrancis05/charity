import { getDashboardStats } from "@/actions/children";
import { getLedgerRecords } from "@/actions/donations";
import { Card, CardHeader } from "@/components/cards/card";
import { StatusBadge, ProviderBadge } from "@/components/ui/badge";
import { formatUgx } from "@/lib/utils";

export const metadata = { title: "Dashboard — Open Hearts Foundation Admin" };

// Simple bar chart using SVG
function MonthlyChart({ ledger }: { ledger: any[] }) {
  // Group by month and provider
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const now = new Date();
  const last4: { month: string; stripe: number; mtn: number; airtel: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthRows = ledger.filter((r: any) => {
      const rDate = new Date(r.created_at);
      const rKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, "0")}`;
      return rKey === key && r.status === "settled";
    });

    last4.push({
      month: months[d.getMonth()],
      stripe: monthRows.filter((r: any) => r.provider === "FLUTTERWAVE").reduce((s: number, r: any) => s + (r.amount_ugx ?? 0), 0),
      mtn: monthRows.filter((r: any) => r.provider === "MTN_MOMO").reduce((s: number, r: any) => s + (r.amount_ugx ?? 0), 0),
      airtel: monthRows.filter((r: any) => r.provider === "AIRTEL_MONEY").reduce((s: number, r: any) => s + (r.amount_ugx ?? 0), 0),
    });
  }

  const maxVal = Math.max(...last4.flatMap((m) => [m.stripe, m.mtn, m.airtel]), 1);
  const barH = 120;

  return (
    <div className="flex items-end gap-6 pt-4">
      {last4.map((m) => (
        <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-end gap-1 h-[120px]">
            {[
              { val: m.stripe, color: "#7c3aed" },
              { val: m.mtn, color: "#b45309" },
              { val: m.airtel, color: "#dc2626" },
            ].map((bar, i) => (
              <div
                key={i}
                className="w-4 rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(4, (bar.val / maxVal) * barH)}px`,
                  backgroundColor: bar.color,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">{m.month}</span>
        </div>
      ))}
    </div>
  );
}

function FundingTierBreakdown({ children }: { children: any[] }) {
  const green = children.filter((c) => c._tier === "green").length;
  const blue = children.filter((c) => c._tier === "blue").length;
  const orange = children.filter((c) => c._tier === "orange").length;
  const total = children.length || 1;

  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-4 mb-4">
        <div style={{ width: `${(green / total) * 100}%`, background: "var(--color-tier-green)" }} />
        <div style={{ width: `${(blue / total) * 100}%`, background: "var(--color-tier-blue)" }} />
        <div style={{ width: `${(orange / total) * 100}%`, background: "var(--color-tier-orange)" }} />
      </div>
      <ul className="space-y-2">
        {[
          { color: "var(--color-tier-green)", label: "80–100% funded", count: green },
          { color: "var(--color-tier-blue)", label: "60–79% funded", count: blue },
          { color: "var(--color-tier-orange)", label: "Below 60% funded", count: orange },
        ].map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: item.color }} />
            {item.label} — {item.count} {item.count === 1 ? "child" : "children"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const ledger = await getLedgerRecords({ limit: 10 });

  const STAT_CARDS = [
    { label: "Total children", value: stats.total },
    { label: "Active children", value: stats.active },
    { label: "Donations settled", value: stats.settled },
    { label: "Pending", value: stats.pending },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6">
        Dashboard overview
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map((s) => (
          <Card key={s.label} className="p-4 sm:p-6 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)]">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          <CardHeader title="Monthly donation volume" />
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="min-w-[300px]">
              <MonthlyChart ledger={stats.ledger} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { color: "#7c3aed", label: "Flutterwave" },
              { color: "#b45309", label: "MTN MoMo" },
              { color: "#dc2626", label: "Airtel Money" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
                <span className="text-xs font-medium text-[var(--color-text-secondary)]">{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader
            title="Funding tier breakdown"
            subtitle="Share of goal raised, per child"
          />
          <FundingTierBreakdown children={[]} />
        </Card>
      </div>

      {/* Recent donations */}
      <Card padding="none">
        <div className="p-5 border-b border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-foreground)]">
            Recent donation activity
          </h3>
        </div>
        <div className="overflow-x-auto -mx-0">
          <div className="min-w-[640px]">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["DATE", "CHILD", "PROVIDER", "AMOUNT", "STATUS"].map((h) => (
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
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--color-text-muted)] text-sm">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                ledger.map((row: any) => {
                  const date = new Date(row.created_at);
                  const dateStr = date.toLocaleDateString("en-UG", {
                    month: "short",
                    day: "numeric",
                  });
                  const childName = row.children_profiles?.name ?? "—";
                  const region = row.children_profiles?.region ?? "";
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
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                        {dateStr}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[var(--color-foreground)]">
                        {childName}{region ? `, ${region}` : ""}
                      </td>
                      <td className="px-5 py-3.5">
                        <ProviderBadge provider={row.provider} />
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-foreground)]">
                        {amount}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={row.status} />
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
