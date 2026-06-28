import Link from "next/link";
import { ProfileForm } from "@/components/admin/ProfileForm";

export const metadata = { title: "New Profile — Open Hearts Foundation Admin" };

export default function NewChildPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link href="/admin/dashboard/children" className="hover:text-[var(--color-foreground)]">
          Children
        </Link>
        <span>/</span>
        <span className="text-[var(--color-foreground)]">New profile</span>
      </div>

      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6">
        Create child profile
      </h2>

      <ProfileForm mode="create" />
    </div>
  );
}
