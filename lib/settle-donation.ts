import "server-only";
import { insforgeServer } from "@/lib/insforge-server";
import { sendDonorConfirmation } from "@/lib/resend";
import { generateReceiptRef } from "@/lib/utils";
import { captureServerEvent } from "@/lib/posthog-server";

export interface SettleDonationParams {
  providerReference: string;
  amountUgx?: number;
}

export type SettleResult =
  | { success: true; alreadySettled: boolean }
  | { success: false; error: string };

/**
 * Marks a donations_ledger row as settled by its provider_reference
 * (the tx_ref Flutterwave echoes back in the webhook payload). Only
 * called after the webhook signature has already been verified by the
 * caller. Idempotent — if the row is already settled (duplicate webhook
 * delivery), this is a no-op success rather than re-sending the email.
 */
export async function settleDonation(
  params: SettleDonationParams
): Promise<SettleResult> {
  const { providerReference } = params;

  const { data: row, error: lookupError } = await insforgeServer.database
    .from("donations_ledger")
    .select(
      "id, child_id, amount_ugx, donor_email, donor_name, provider, status, children_profiles(name)"
    )
    .eq("provider_reference", providerReference)
    .single();

  if (lookupError || !row) {
    return { success: false, error: "No matching ledger record for this transaction" };
  }

  if (row.status === "settled") {
    return { success: true, alreadySettled: true };
  }

  const receiptReference = generateReceiptRef();

  captureServerEvent("donation_settled", row.child_id ?? "unknown", {
    childId: row.child_id,
    amountUgx: row.amount_ugx,
    provider: row.provider,
    receiptReference,
  });

  const { error: updateError } = await insforgeServer.database
    .from("donations_ledger")
    .update({
      status: "settled",
      webhook_verified_at: new Date().toISOString(),
      receipt_reference: receiptReference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Email failures must never undo the ledger update or crash the
  // webhook handler — log and continue.
  try {
    const childName =
      (row as unknown as { children_profiles?: { name?: string } })
        .children_profiles?.name ?? "your sponsored child";

    await sendDonorConfirmation({
      donorEmail: row.donor_email,
      childName,
      amountUgx: Number(row.amount_ugx ?? params.amountUgx ?? 0),
      receiptReference,
    });
  } catch (err) {
    console.error("[lib/settle-donation/settleDonation] email failed", err);
  }

  return { success: true, alreadySettled: false };
}

/**
 * Marks a donations_ledger row as failed by its provider_reference.
 * Never deletes the row — financial records are permanent.
 */
export async function markDonationFailed(
  providerReference: string
): Promise<SettleResult> {
  const { data: row, error: lookupError } = await insforgeServer.database
    .from("donations_ledger")
    .select("id, child_id, provider, status")
    .eq("provider_reference", providerReference)
    .single();

  if (lookupError || !row) {
    return { success: false, error: "No matching ledger record for this transaction" };
  }

  if (row.status === "failed" || row.status === "settled") {
    return { success: true, alreadySettled: row.status === "settled" };
  }

  captureServerEvent("donation_failed", row.id, {
    childId: row.child_id ?? "unknown",
    provider: row.provider ?? "UNKNOWN",
    errorCode: "webhook_status_failed",
  });

  const { error: updateError } = await insforgeServer.database
    .from("donations_ledger")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", row.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, alreadySettled: false };
}