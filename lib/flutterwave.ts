import "server-only";

const FLW_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY!;
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

export interface FlutterwavePaymentParams {
  txRef: string;
  amount: number;
  currency: "UGX" | "USD";
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  meta: Record<string, string>;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

export interface FlutterwavePaymentLink {
  paymentLink: string;
  txRef: string;
}

/**
 * Creates a Flutterwave hosted payment link.
 * Works for both card payments (USD/UGX) and mobile money (UGX).
 */
export async function createFlutterwavePayment(
  params: FlutterwavePaymentParams
): Promise<FlutterwavePaymentLink> {
  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
      },
      customizations: params.customizations ?? {
        title: "Open Hearts Foundation Child Sponsorship",
        description: "Sponsor a child in Uganda",
        logo: "https://openheartsfoundation.org/logo.png",
      },
      meta: params.meta,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Flutterwave payment creation failed: ${err}`);
  }

  const data = (await response.json()) as {
    status: string;
    data: { link: string };
  };

  if (data.status !== "success") {
    throw new Error("Flutterwave returned non-success status");
  }

  return {
    paymentLink: data.data.link,
    txRef: params.txRef,
  };
}

/**
 * Verifies a Flutterwave transaction by ID after redirect.
 */
export async function verifyFlutterwaveTransaction(transactionId: string): Promise<{
  status: "successful" | "failed" | "pending";
  amount: number;
  currency: string;
  txRef: string;
  customerEmail: string;
  meta: Record<string, string>;
}> {
  const response = await fetch(
    `${FLW_BASE_URL}/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Flutterwave verification failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    status: string;
    data: {
      status: string;
      amount: number;
      currency: string;
      tx_ref: string;
      customer: { email: string };
      meta: Record<string, string>;
    };
  };

  return {
    status: data.data.status as "successful" | "failed" | "pending",
    amount: data.data.amount,
    currency: data.data.currency,
    txRef: data.data.tx_ref,
    customerEmail: data.data.customer.email,
    meta: data.data.meta ?? {},
  };
}

/**
 * Verifies a Flutterwave webhook signature.
 * Compare the hash sent in the header to FLUTTERWAVE_WEBHOOK_SECRET.
 */
export function verifyFlutterwaveWebhook(
  payload: string,
  signatureHeader: string
): boolean {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  if (!secret) return false;

  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return hash === signatureHeader;
}
