import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { insforgeServer } from "@/lib/insforge-server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("admin_session")?.value;
    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    let session: { adminId: string; role: string; email: string; iat: number };
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf-8");
      session = JSON.parse(decoded);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const age = Date.now() - session.iat;
    if (age > 8 * 60 * 60 * 1000 || session.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = request.nextUrl;
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

    if (searchParams.get("childId")) {
      query = query.eq("child_id", searchParams.get("childId"));
    }
    if (searchParams.get("provider")) {
      query = query.eq("provider", searchParams.get("provider"));
    }
    if (searchParams.get("status")) {
      query = query.eq("status", searchParams.get("status"));
    }

    const { data, error } = await query;
    if (error || !data) {
      console.error("[api/ledger/export]", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch ledger records" },
        { status: 500 }
      );
    }

    const headers = "Date,Child,Provider,Amount UGX,Amount USD,Donor Email,Status,Receipt Ref,Webhook Verified At\n";
    const rows = (data as any[]).map((row) => {
      const date = new Date(row.created_at).toISOString();
      const childName = row.children_profiles?.name ?? "";
      return `${date},"${childName}",${row.provider},${row.amount_ugx ?? ""},${row.amount_usd ?? ""},${row.donor_email ?? ""},${row.status},${row.receipt_reference ?? ""},${row.webhook_verified_at ?? ""}`;
    }).join("\n");

    const csv = headers + rows;
    const encoded = new TextEncoder().encode(csv);

    return new NextResponse(encoded, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ledger-export-${Date.now()}.csv"`,
        "Content-Length": String(encoded.length),
      },
    });
  } catch (error) {
    console.error("[api/ledger/export]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
