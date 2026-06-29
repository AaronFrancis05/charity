
"use server";

import { z } from "zod";
import { getAdminSession } from "./auth";
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

export async function inviteAdmin(prevState: any, formData: FormData) {
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

  try {
    const { data: existingUser, error: existingUserError } =
      await insforgeServer.database.from("admins").select("id").eq("email", email).single();

    if (existingUserError && existingUserError.code !== "PGRST116") {
      console.error("[actions/admins/inviteAdmin] Error checking for existing admin:", existingUserError);
      return { success: false, error: "Database error." };
    }

    if (existingUser) {
      return { success: false, error: "An admin with this email already exists." };
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
      });

    if (insertError) {
      console.error("[actions/admins/inviteAdmin] Error inserting invitation:", insertError);
      return { success: false, error: "Could not create invitation." };
    }

    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/invite?token=${token}`;

    await sendAdminInvitationEmail(email, invitationLink);

    return { success: true, error: null };
  } catch (error) {
    console.error("[actions/admins/inviteAdmin] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
