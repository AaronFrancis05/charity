
"use server";

import { z } from "zod";
import { getAdminSession } from "@/actions/auth";
import { insforgeServer } from "@/lib/insforge-server";
import { redirect } from "next/navigation";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendAdminInvitationEmail } from "@/lib/resend";
import crypto from "crypto";

const InviteAdminSchema = z.object({
  email: z.string().email(),
  role: z.enum(["content_admin", "super_admin"]),
  "cf-turnstile-response": z.string(),
});


export type InviteAdminState = {
  success: boolean;
  error?: string | null;
};

export async function inviteAdmin(prevState: InviteAdminState | null, formData: FormData): Promise<InviteAdminState> {
  try {
    const session = await getAdminSession();
    if (session?.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = InviteAdminSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      return { success: false, error: "Invalid fields." };
    }

    const { email, role, "cf-turnstile-response": turnstileToken } =
      validatedFields.data;

    const turnstileVerified = await verifyTurnstileToken(turnstileToken);
    if (!turnstileVerified) {
      return { success: false, error: "Invalid Turnstile token." };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || !appUrl.startsWith("http")) {
      console.error("[actions/admins/inviteAdmin] NEXT_PUBLIC_APP_URL is missing or invalid");
      return { success: false, error: "System configuration error." };
    }

    // 1. Check if admin already exists
    const { data: existingUser, error: existingUserError } =
      await insforgeServer.database.from("admins").select("id").eq("email", email).single();

    if (existingUserError && existingUserError.code !== "PGRST116") {
      console.error("[actions/admins/inviteAdmin] Error checking for existing admin:", existingUserError);
      return { success: false, error: "Database error." };
    }

    if (existingUser) {
      return { success: false, error: "An admin with this email already exists." };
    }

    // 2. Check for existing active invitation
    const { data: existingInvite, error: inviteCheckError } = await insforgeServer.database
      .from("admin_invitations")
      .select("id")
      .eq("email", email)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return { success: false, error: "An active invitation already exists for this email." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: insertError } = await insforgeServer.database
      .from("admin_invitations")
      .insert({
        token,
        email,
        role,
        expires_at: expiresAt.toISOString(),
        invited_by: session.adminId,
      });

    if (insertError) {
      console.error("[actions/admins/inviteAdmin] Error inserting invitation:", insertError);
      return { success: false, error: "Could not create invitation." };
    }

    const invitationLink = `${appUrl}/admin/invite?token=${token}`;

    await sendAdminInvitationEmail(email, invitationLink);

    return { success: true };
  } catch (error) {
    console.error("[actions/admins/inviteAdmin] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
