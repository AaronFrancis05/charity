"use server";

import { redirect } from "next/navigation";
import { insforgeServer } from "@/lib/insforge-server";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createFlutterwavePayment } from "@/lib/flutterwave";
import { DonationInitiateSchema } from "@/lib/validations/schemas";
import { getClientIp } from "@/lib/client-ip";
import { generateReceiptRef } from "@/lib/utils";
import type { DonationInitiateInput } from "@/lib/validations/schemas";

export type DonationResult =
  | { success: true; paymentUrl: string }
  | { success: false; error: string };

export async function initiateDonation(
  input: DonationInitiateInput
): Promise<DonationResult> {
  const ip = await getClientIp();

  // 1. Rate limit
  const rl = await rateLimit(`donation:${ip}`, 10, 60);
  if (!rl.success) {
    return {
      success: false,
      error: `Too many requests. Try again in ${rl.retryAfter} seconds.`,
    };
  }

  // 2. Validate input
  const parsed = DonationInitiateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    childId,
    donorEmail,
    donorName,
    provider,
    amountUgx,
    turnstileToken,
  } = parsed.data;

  // 3. Turnstile
  const turnstileOk = await verifyTurnstileToken(turnstileToken);
  if (!turnstileOk) {
    return { success: false, error: "Bot verification failed. Please try again." };
  }

  // 4. Verify child exists and is active
  const { data: child, error: childErr } = await insforgeServer.database
    .from("children_profiles")
    .select("id, name, is_active")
    .eq("id", childId)
    .eq("is_active", true)
    .single();

  if (childErr || !child) {
    return { success: false, error: "Child not found or no longer active." };
  }

  // 5. Create initiated ledger record
  const txRef = `OHF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { data: ledgerRow, error: ledgerErr } = await insforgeServer.database
    .from("donations_ledger")
    .insert([{
      child_id: childId,
      provider,
      amount_ugx: amountUgx,
      donor_email: donorEmail,
      donor_name: donorName,
      status: "initiated",
      provider_reference: txRef,
    }])
    .select("id")
    .single();

  if (ledgerErr || !ledgerRow) {
    return { success: false, error: "Failed to record donation. Please try again." };
  }

  // 6. Create Flutterwave payment
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const { paymentLink } = await createFlutterwavePayment({
      txRef,
      amount: amountUgx,
      currency: "UGX",
      customerEmail: donorEmail,
      customerName: donorName,
      redirectUrl: `${baseUrl}/sponsor/${childId}/donate/complete?tx_ref=${txRef}`,
      meta: {
        childId,
        ledgerId: ledgerRow.id,
        donorEmail,
      },
      customizations: {
        title: `Sponsor ${child.name}`,
        description: `Sponsorship for ${child.name}`,
      },
    });

    // Update to pending
    await insforgeServer.database
      .from("donations_ledger")
      .update({ status: "pending" })
      .eq("id", ledgerRow.id);

    return { success: true, paymentUrl: paymentLink };
  } catch (err) {
    // Mark as failed
    await insforgeServer.database
      .from("donations_ledger")
      .update({ status: "failed" })
      .eq("id", ledgerRow.id);

    return { success: false, error: "Payment initiation failed. Please try again." };
  }
}

export async function getLedgerRecords(opts?: {
  childId?: string;
  provider?: string;
  status?: string;
  limit?: number;
}) {
  let query = insforgeServer.database
    .from("donations_ledger")
    .select(`
      id, child_id, provider,
      amount_ugx, amount_usd, donor_email,
      status, provider_reference, receipt_reference,
      webhook_verified_at, created_at, updated_at,
      children_profiles(name, region)
    `)
    .order("created_at", { ascending: false });

  if (opts?.childId) query = query.eq("child_id", opts.childId);
  if (opts?.provider) query = query.eq("provider", opts.provider);
  if (opts?.status) query = query.eq("status", opts.status);
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
