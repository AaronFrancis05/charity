import { redirect } from "next/navigation";
import { getAdminSession } from "@/actions/auth";
import { insforgeServer } from "@/lib/insforge-server";
import { ProfileSettingsForm } from "./profile-form";

export const metadata = { title: "Profile Settings — Open Hearts Foundation" };

export default async function ProfileSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { data: admin } = await insforgeServer.database
    .from("admins")
    .select("avatar_url")
    .eq("id", session.adminId)
    .single();

  return (
    <div className="max-w-xl">
      <h1 className="text-[clamp(20px,2.5vw,28px)] font-bold text-[var(--color-foreground)] mb-1">
        Profile settings
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Update your display name and profile photo
      </p>

      <ProfileSettingsForm
        adminId={session.adminId}
        email={session.email}
        name={session.name}
        role={session.role}
        avatarUrl={admin?.avatar_url}
      />
    </div>
  );
}
