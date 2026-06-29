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
import { captureServerEvent } from "@/lib/posthog-server";
import { sendAdminInvite } from "@/lib/resend";
import crypto from "crypto";

const SESSION_SECRET = process.env.INSFORGE_SERVICE_KEY || "dev-secret";

function signSession(payload: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payload);
  return hmac.digest("base64url");
}

function verifySession(payload: string, signature: string): boolean {
  const expected = signSession(payload);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

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
    .select("id, email, password_hash, role, is_active, name, password_set")
    .eq("email", email.toLowerCase())
    .single();

  if (dbError || !adminRecord) {
    await insforgeServer.database.from("admin_audit_logs").insert([{
      event_type: "login_failed",
      ip_hash: hashIp(ip),
      metadata: { email, attempt_count: 5 - (rl.remaining ?? 0) },
    }]);
    captureServerEvent("admin_login_failed", "unknown", {
      ipHash: await hashIp(ip),
      attemptCount: 5 - (rl.remaining ?? 0),
    });
    return { success: false, error: "Invalid email or password." };
  }

  // 5. Active check
  if (!adminRecord.is_active) {
    captureServerEvent("admin_login_failed", adminRecord.id, {
      ipHash: await hashIp(ip),
      attemptCount: 5 - (rl.remaining ?? 0),
    });
    return { success: false, error: "This account has been deactivated." };
  }

  // 6. Check password is set (invited admin hasn't accepted yet)
  if (!adminRecord.password_set || !adminRecord.password_hash) {
    return { success: false, error: "You must accept your invitation before logging in. Check your email for the invite link." };
  }

  // 7. bcrypt compare
  const passwordMatch = await bcrypt.compare(password, adminRecord.password_hash);
  if (!passwordMatch) {
    await insforgeServer.database.from("admin_audit_logs").insert([{
      event_type: "login_failed",
      ip_hash: hashIp(ip),
      metadata: { email },
    }]);
    captureServerEvent("admin_login_failed", adminRecord.id, {
      ipHash: await hashIp(ip),
      attemptCount: 5 - (rl.remaining ?? 0),
    });
    return { success: false, error: "Invalid email or password." };
  }

  // 7. Update last_login_at
  await insforgeServer.database
    .from("admins")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", adminRecord.id);

  // 8. Create signed session cookie
  const sessionPayload = JSON.stringify({
    adminId: adminRecord.id,
    role: adminRecord.role,
    email: adminRecord.email,
    name: adminRecord.name || "",
    iat: Date.now(),
  });

  const encoded = Buffer.from(sessionPayload).toString("base64");
  const sig = signSession(encoded);
  const sessionValue = `${encoded}.${sig}`;

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

  captureServerEvent("admin_login_success", adminRecord.id, {
    adminId: adminRecord.id,
    role: adminRecord.role,
  });

  redirect("/admin/dashboard");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export type AdminSession = {
  adminId: string;
  role: "super_admin" | "content_admin";
  email: string;
  name: string;
  iat: number;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("admin_session")?.value;
  if (!raw) return null;

  const dot = raw.indexOf(".");
  if (dot === -1) return null;

  const encoded = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);

  if (!verifySession(encoded, sig)) return null;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const session = JSON.parse(decoded) as AdminSession;

    const age = Date.now() - session.iat;
    if (age > 8 * 60 * 60 * 1000) return null;

    return session;
  } catch {
    return null;
  }
}

export async function updateAdminProfile(
  data: { name: string; avatar_url?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: "Not authenticated" };

    const { error } = await insforgeServer.database
      .from("admins")
      .update({ name: data.name, ...(data.avatar_url ? { avatar_url: data.avatar_url } : {}) })
      .eq("id", session.adminId);

    if (error) return { success: false, error: error.message };

    // Update signed session cookie with new name
    const newPayload = JSON.stringify({
      ...session,
      name: data.name,
      iat: Date.now(),
    });
    const encoded = Buffer.from(newPayload).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("admin_session", `${encoded}.${signSession(encoded)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: "[auth/updateAdminProfile] " + (err as Error).message };
  }
}

export async function inviteAdmin(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Only super admins can invite new admins" };
    }

    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const role = formData.get("role") as string;

    if (!email || !role) return { success: false, error: "Email and role are required" };
    if (!["super_admin", "content_admin"].includes(role)) {
      return { success: false, error: "Invalid role" };
    }

    // Check if admin already exists
    const { data: existing } = await insforgeServer.database
      .from("admins")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (existing) {
      if (!existing.is_active) return { success: false, error: "That admin account is deactivated" };
      return { success: false, error: "An admin with this email already exists" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await insforgeServer.database
      .from("admins")
      .insert([{
        email,
        role,
        invite_token: token,
        invite_token_expires_at: expiresAt,
        is_active: true,
      }]);

    if (insertError) return { success: false, error: insertError.message };

    const emailResult = await sendAdminInvite(email, token, role);
    if (!emailResult.success) {
      // Roll back the admin insert to avoid orphan accounts
      const inserted = await insforgeServer.database
        .from("admins")
        .select("id")
        .eq("email", email)
        .single();
      if (inserted.data) {
        await insforgeServer.database.from("admins").delete().eq("id", inserted.data.id);
      }
      return { success: false, error: "Invite email failed: " + emailResult.error };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "[auth/inviteAdmin] " + (err as Error).message };
  }
}

export async function validateInviteToken(
  token: string
): Promise<{ success: boolean; error?: string; data?: { email: string; role: string } }> {
  try {
    const { data, error } = await insforgeServer.database
      .from("admins")
      .select("email, role, invite_token_expires_at, password_set")
      .eq("invite_token", token)
      .single();

    if (error || !data) return { success: false, error: "Invalid or expired invitation link" };
    if (data.password_set) return { success: false, error: "This invitation has already been used" };

    const expiresAt = new Date(data.invite_token_expires_at).getTime();
    if (Date.now() > expiresAt) {
      return { success: false, error: "This invitation has expired. Ask your admin to send a new one." };
    }

    return { success: true, data: { email: data.email, role: data.role } };
  } catch (err) {
    return { success: false, error: "[auth/validateInviteToken] " + (err as Error).message };
  }
}

export async function acceptInvite(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = formData.get("token") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!token || !password) return { success: false, error: "Missing required fields" };
    if (password.length < 8) return { success: false, error: "Password must be at least 8 characters" };
    if (password !== confirmPassword) return { success: false, error: "Passwords do not match" };

    const { data: admin, error: lookupError } = await insforgeServer.database
      .from("admins")
      .select("id, email, role, invite_token_expires_at, password_set")
      .eq("invite_token", token)
      .single();

    if (lookupError || !admin) return { success: false, error: "Invalid invitation link" };
    if (admin.password_set) return { success: false, error: "This invitation has already been used" };

    const expiresAt = new Date(admin.invite_token_expires_at).getTime();
    if (Date.now() > expiresAt) return { success: false, error: "Invitation has expired" };

    const passwordHash = await bcrypt.hash(password, 12);

    const { error: updateError } = await insforgeServer.database
      .from("admins")
      .update({
        password_hash: passwordHash,
        invite_token: null,
        invite_token_expires_at: null,
        password_set: true,
      })
      .eq("id", admin.id);

    if (updateError) return { success: false, error: updateError.message };

    // Auto-login after accepting invite
    const sessionPayload = JSON.stringify({
      adminId: admin.id,
      role: admin.role,
      email: admin.email,
      name: "",
      iat: Date.now(),
    });
    const encoded = Buffer.from(sessionPayload).toString("base64");
    const cookieStore = await cookies();
    cookieStore.set("admin_session", `${encoded}.${signSession(encoded)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    await insforgeServer.database.from("admin_audit_logs").insert([{
      admin_id: admin.id,
      event_type: "login_success",
      metadata: { role: admin.role, action: "invite_accepted" },
    }]);

    return { success: true };
  } catch (err) {
    return { success: false, error: "[auth/acceptInvite] " + (err as Error).message };
  }
}

export async function getAdmins(): Promise<{
  success: boolean;
  error?: string;
  data?: Array<{
    id: string;
    email: string;
    role: string;
    name: string;
    is_active: boolean;
    last_login_at: string | null;
    password_set: boolean;
    created_at: string;
  }>;
}> {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super_admin") {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await insforgeServer.database
      .from("admins")
      .select("id, email, role, name, is_active, last_login_at, password_set, created_at")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message };
    return { success: true, data: data ?? [] };
  } catch (err) {
    return { success: false, error: "[auth/getAdmins] " + (err as Error).message };
  }
}

export async function uploadAdminAvatar(
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: { url: string } }> {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: "Not authenticated" };

    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const ext = file.name.split(".").pop();
    const key = `admin-avatars/${session.adminId}-${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await insforgeServer.storage
      .from("child-images")
      .upload(key, file);

    if (uploadError || !uploadData) return { success: false, error: uploadError?.message ?? "Upload failed" };

    const { data: urlData } = insforgeServer.storage
      .from("child-images")
      .getPublicUrl(uploadData.key);

    const url = urlData?.publicUrl ?? uploadData.url;

    // Update DB
    const { error: dbError } = await insforgeServer.database
      .from("admins")
      .update({ avatar_url: url })
      .eq("id", session.adminId);

    if (dbError) return { success: false, error: dbError.message };

    return { success: true, data: { url } };
  } catch (err) {
    return { success: false, error: "[auth/uploadAdminAvatar] " + (err as Error).message };
  }
}
