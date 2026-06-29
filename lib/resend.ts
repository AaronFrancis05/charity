import "server-only";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface DonorConfirmationParams {
  donorEmail: string;
  childName: string;
  amountUgx: number;
  receiptReference: string;
}

/**
 * Sends a donor confirmation email via Resend. Called only from
 * settled-webhook handlers — never from client code. Failures are caught
 * and logged by the caller; an email failure must never crash webhook
 * processing or block the ledger update that already happened.
 */
export async function sendDonorConfirmation(
  params: DonorConfirmationParams
): Promise<{ success: boolean; error?: string }> {
  const { donorEmail, childName, amountUgx, receiptReference } = params;
  const formattedAmount = `UGX ${Math.round(amountUgx).toLocaleString("en-UG")}`;

  const text = `Thank you for sponsoring ${childName}.

Your gift of ${formattedAmount} toward ${childName}'s care has been received and confirmed.

Receipt reference: ${receiptReference}

This contribution goes directly toward ${childName}'s wellbeing, alongside the support of their community of sponsors.

With gratitude,
The Open Hearts Foundation team`;

  const html = `
    <div style="font-family: sans-serif; color: #101828; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Thank you for sponsoring ${childName}</h2>
      <p>Your gift of <strong>${formattedAmount}</strong> toward ${childName}'s care has been received and confirmed.</p>
      <p style="font-size: 13px; color: #6a7282;">Receipt reference: ${receiptReference}</p>
      <p>This contribution goes directly toward ${childName}'s wellbeing, alongside the support of their community of sponsors.</p>
      <p>With gratitude,<br />The Open Hearts Foundation team</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Open Hearts Foundation <donations@openheartsfoundation.org>",
      to: donorEmail,
      subject: `Your sponsorship for ${childName} is confirmed`,
      html,
      text,
    });

    if (error) {
      console.error("[lib/resend/sendDonorConfirmation]", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("[lib/resend/sendDonorConfirmation]", err);
    return { success: false, error: "Failed to send confirmation email" };
  }
}



export async function sendAdminInvitationEmail(email: string, invitationLink: string): Promise<void> {
  const text = `You have been invited to join the Open Hearts Foundation admin panel. Click the link to accept: ${invitationLink}`;
  const html = `
    <div style="font-family: sans-serif; color: #101828; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">You're invited</h2>
      <p>You have been invited to join the <strong>Open Hearts Foundation</strong> admin panel.</p>
      <a href="${invitationLink}" style="display: inline-block; background: #7c3aed; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 20px 0;">
        Accept Invitation
      </a>
      <p style="font-size: 13px; color: #6a7282;">This link will expire in 24 hours.</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: "Open Hearts Foundation <noreply@openheartsfoundation.org>",
      to: email,
      subject: "Invitation to Open Hearts Foundation Admin Panel",
      html,
      text,
    });

    if (error) {
      console.error("[lib/resend/sendAdminInvitationEmail]", error);
      throw new Error("Failed to send invitation email.");
    }
  } catch (err) {
    console.error("[lib/resend/sendAdminInvitationEmail] Unexpected error:", err);
    throw new Error("An unexpected error occurred while sending the email.");
  }
}
