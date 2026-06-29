import Link from "next/link";
import { notFound } from "next/navigation";
import { getChildById, toggleChildStatus } from "@/actions/children";
import { getAdminSession } from "@/actions/auth";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Edit Profile — Open Hearts Foundation Admin" };

export default async function EditChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [child, session] = await Promise.all([
    getChildById(id),
    getAdminSession(),
  ]);

  if (!child) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link href="/admin/dashboard/children" className="hover:text-[var(--color-foreground)]">
          Children
        </Link>
        <span>/</span>
        <span className="text-[var(--color-foreground)]">{child.name}</span>
        <span>/</span>
        <span className="text-[var(--color-foreground)]">Edit</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
          Edit — {child.name}
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant={child.is_active ? "success" : "default"}>
            {child.is_active ? "Active" : "Inactive"}
          </Badge>
          <form
            action={async () => {
              "use server";
              await toggleChildStatus(child.id, !child.is_active);
            }}
          >
            <button
              type="submit"
              className={`text-sm font-medium px-3 py-1.5 rounded-[var(--radius-md)] border transition-colors ${
                child.is_active
                  ? "border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
                  : "border-[var(--color-success)] text-[var(--color-success)] hover:bg-[var(--color-success-bg)]"
              }`}
            >
              {child.is_active ? "Deactivate" : "Reactivate"}
            </button>
          </form>
        </div>
      </div>

      <ProfileForm child={child} mode="edit" />
    </div>
  );
}
