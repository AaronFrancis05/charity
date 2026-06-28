import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveWebhook } from "@/lib/flutterwave";
import { settleDonation, markDonationFailed } from "@/lib/settle-donation";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signatureHeader = request.headers.get("verif-hash") ?? "";
    if (!verifyFlutterwaveWebhook(rawBody, signatureHeader)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === "charge.completed") {
      const txRef = payload.data?.tx_ref;
      const status = payload.data?.status;

      if (status === "successful" && txRef) {
        await settleDonation({ providerReference: txRef });
      } else if (status === "failed" && txRef) {
        await markDonationFailed(txRef);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[api/webhooks/flutterwave]", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
