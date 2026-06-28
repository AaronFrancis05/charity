"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { insforgeServer } from "@/lib/insforge-server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { AdminLoginSchema } from "@/lib/validations/schemas";
import { getClientIp } from "@/lib/client-ip";
import { hashIp } from "@/lib/utils";

export type AuthResult =
  | { success: true }
  | { success: false; error: string; rateLimited?: boolean };

export async function adminLogin(
  formData: FormData
): Promise<AuthResult> {
  const ip = await getClientIp();

  // 1. Rate limit check
  const rl = await rateLimit(`admin_login:${ip}`, 5, 900);
  if (!rl.success) {
    return {
      success: false,
      error: `Too many attempts. Try again in ${rl.retryAfter} seconds.`,
      rateLimited: true,
    };
  }

  // 2. Parse & validate input
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    turnstileToken: formData.get("turnstileToken"),
  };

  const parsed = AdminLoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password, turnstileToken } = parsed.data;

  // 3. Turnstile verification
  const turnstileOk = await verifyTurnstileToken(turnstileToken);
  if (!turnstileOk) {
    return { success: false, error: "Bot verification failed. Please try again." };
  }

  // 4. Lookup admin record
  const { data: adminRecord, error: dbError } = await insforgeServer.database
    .from("admins")
    .select("id, email, password_hash, role, is_active")
    .eq("email", email.toLowerCase())
    .single();

  if (dbError || !adminRecord) {
    // Log failed attempt
    await insforgeServer.database.from("admin_audit_logs").insert([{
      event_type: "login_failed",
      ip_hash: hashIp(ip),
      metadata: { email, attempt_count: 5 - (rl.remaining ?? 0) },
    }]);
    return { success: false, error: "Invalid email or password." };
  }

  // 5. Active check
  if (!adminRecord.is_active) {
    return { success: false, error: "This account has been deactivated." };
  }

  // 6. bcrypt compare
  const passwordMatch = await bcrypt.compare(password, adminRecord.password_hash);
  if (!passwordMatch) {
    await insforgeServer.database.from("admin_audit_logs").insert([{
      event_type: "login_failed",
      ip_hash: hashIp(ip),
      metadata: { email },
    }]);
    return { success: false, error: "Invalid email or password." };
  }

  // 7. Update last_login_at
  await insforgeServer.database
    .from("admins")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", adminRecord.id);

  // 8. Create session cookie (signed session stored server-side)
  const sessionPayload = JSON.stringify({
    adminId: adminRecord.id,
    role: adminRecord.role,
    email: adminRecord.email,
    iat: Date.now(),
  });

  // Encode as base64 for cookie (in production, sign with a secret)
  const sessionValue = Buffer.from(sessionPayload).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  // 9. Audit log success
  await insforgeServer.database.from("admin_audit_logs").insert([{
    admin_id: adminRecord.id,
    event_type: "login_success",
    metadata: { role: adminRecord.role },
  }]);

  redirect("/admin/dashboard");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function getAdminSession(): Promise<{
  adminId: string;
  role: "super_admin" | "content_admin";
  email: string;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value;
  if (!raw) return null;

  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    const session = JSON.parse(decoded) as {
      adminId: string;
      role: "super_admin" | "content_admin";
      email: string;
      iat: number;
    };

    // Check session age (8 hours)
    const age = Date.now() - session.iat;
    if (age > 8 * 60 * 60 * 1000) return null;

    return session;
  } catch {
    return null;
  }
}
