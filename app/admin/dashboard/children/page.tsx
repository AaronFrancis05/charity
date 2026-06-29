import Link from "next/link";
import { getChildren } from "@/actions/children";
import { Card } from "@/components/cards/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { computeAge, fundingPercent } from "@/lib/utils";

export const metadata = { title: "Children — Open Hearts Foundation Admin" };

export default async function ChildrenListPage() {
  const children = await getChildren();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">Children</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Manage child profiles</p>
        </div>
        <Link href="/admin/dashboard/children/new" className="w-full sm:w-auto">
          <Button variant="default" className="w-full min-h-[44px]">+ New profile</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto -mx-0">
          <div className="min-w-[640px]">
            <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {["NAME", "REGION", "FUNDING", "STATUS", "ACTIONS"].map((h) => (
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
              {children.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--color-text-muted)]">
                    No child profiles yet.{" "}
                    <Link href="/admin/dashboard/children/new" className="text-[var(--color-brand-purple)] hover:underline">
                      Create the first one.
                    </Link>
                  </td>
                </tr>
              ) : (
                children.map((child) => {
                  const age = computeAge(child.date_of_birth);
                  return (
                    <tr
                      key={child.id}
                      className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[var(--color-foreground)]">
                          {child.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">
                          Age {age}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[var(--color-text-secondary)]">
                        {child.region}
                      </td>
                      <td className="px-5 py-3.5 w-28">
                        <ProgressBar raised={0} goal={child.goal_monthly_ugx} size="sm" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={child.is_active ? "success" : "default"}>
                          {child.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/dashboard/children/${child.id}/edit`}
                          className="text-[var(--color-brand-purple)] hover:underline text-xs font-medium"
                        >
                          Edit
                        </Link>
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
