"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insforgeServer } from "@/lib/insforge-server";
import { CreateChildSchema, UpdateChildSchema } from "@/lib/validations/schemas";
import { getAdminSession } from "./auth";
import type { CreateChildInput, UpdateChildInput } from "@/lib/validations/schemas";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChildProfile {
  id: string;
  name: string;
  date_of_birth: string;
  region: string;
  narrative: string;
  profile_image_url: string;
  video_url: string | null;
  goal_monthly_ugx: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChildWithFunding extends ChildProfile {
  raised_ugx: number;
  donor_count: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

async function requireSuperAdmin() {
  const session = await requireAdmin();
  if (session.role !== "super_admin") {
    throw new Error("Insufficient permissions");
  }
  return session;
}

// ── Read operations ────────────────────────────────────────────────────────

export async function getChildren(opts?: {
  activeOnly?: boolean;
  region?: string;
  searchQuery?: string;
}): Promise<ChildProfile[]> {
  let query = insforgeServer.database
    .from("children_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (opts?.activeOnly) {
    query = query.eq("is_active", true);
  }
  if (opts?.region) {
    query = query.eq("region", opts.region);
  }
  if (opts?.searchQuery) {
    query = query.ilike("name", `%${opts.searchQuery}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ChildProfile[];
}

export async function getChildById(id: string): Promise<ChildWithFunding | null> {
  const { data: child, error } = await insforgeServer.database
    .from("children_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !child) return null;

  // Aggregate all settled donations — single total, no category breakdown
  const { data: ledger } = await insforgeServer.database
    .from("donations_ledger")
    .select("amount_ugx, donor_email")
    .eq("child_id", id)
    .eq("status", "settled");

  let raisedUgx = 0;
  const donorEmails = new Set<string>();

  for (const row of ledger ?? []) {
    raisedUgx += row.amount_ugx ?? 0;
    if (row.donor_email) donorEmails.add(row.donor_email);
  }

  return {
    ...(child as ChildProfile),
    raised_ugx: raisedUgx,
    donor_count: donorEmails.size,
  };
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createChild(
  input: CreateChildInput
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdmin();

  const parsed = CreateChildSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data, error } = await insforgeServer.database
    .from("children_profiles")
    .insert([{
      ...parsed.data,
      is_active: true,
      created_by: session.adminId,
    }])
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  // Audit log
  await insforgeServer.database.from("admin_audit_logs").insert([{
    admin_id: session.adminId,
    event_type: "profile_created",
    target_id: data.id,
    metadata: {
      initialGoal: parsed.data.goal_monthly_ugx,
    },
  }]);

  revalidatePath("/admin/dashboard/children");
  revalidatePath("/sponsor");

  return { success: true, data: { id: data.id } };
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateChild(
  input: UpdateChildInput
): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = UpdateChildSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { id, ...fields } = parsed.data;
  const fieldsChanged = Object.keys(fields);

  const { error } = await insforgeServer.database
    .from("children_profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  // Audit log
  await insforgeServer.database.from("admin_audit_logs").insert([{
    admin_id: session.adminId,
    event_type: "profile_updated",
    target_id: id,
    metadata: { fieldsChanged },
  }]);

  revalidatePath(`/admin/dashboard/children/${id}`);
  revalidatePath("/admin/dashboard/children");
  revalidatePath("/sponsor");

  return { success: true };
}

// ── Toggle active status ───────────────────────────────────────────────────

export async function toggleChildStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  return updateChild({ id, is_active: isActive });
}

// ── Upload media ───────────────────────────────────────────────────────────

export async function uploadChildMedia(
  formData: FormData,
  type: "image" | "video"
): Promise<ActionResult<{ url: string; key: string }>> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const bucket = type === "image" ? "child-images" : "child-videos";
  const ext = file.name.split(".").pop();
  const key = `${type}s/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data: uploadData, error } = await insforgeServer.storage
    .from(bucket)
    .upload(key, file);

  if (error || !uploadData) return { success: false, error: error?.message ?? "Upload failed" };

  const { data: urlData } = insforgeServer.storage
    .from(bucket)
    .getPublicUrl(uploadData.key);

  return {
    success: true,
    data: { url: urlData?.publicUrl ?? uploadData.url, key: uploadData.key },
  };
}

// ── Dashboard stats ────────────────────────────────────────────────────────

export async function getDashboardStats() {
  await requireAdmin();

  const [childrenResult, ledgerResult] = await Promise.all([
    insforgeServer.database.from("children_profiles").select("id, is_active"),
    insforgeServer.database
      .from("donations_ledger")
      .select("id, status, amount_ugx, amount_usd, provider, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const children = childrenResult.data ?? [];
  const ledger = ledgerResult.data ?? [];

  const total = children.length;
  const active = children.filter((c) => c.is_active).length;
  const settled = ledger.filter((d) => d.status === "settled").length;
  const pending = ledger.filter((d) => d.status === "pending" || d.status === "initiated").length;

  // Recent 10 settled
  const recent = ledger
    .filter((d) => d.status === "settled")
    .slice(0, 10);

  return { total, active, settled, pending, recent, ledger };
}
