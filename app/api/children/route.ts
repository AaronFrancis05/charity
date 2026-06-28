import { NextRequest, NextResponse } from "next/server";
import { insforgeServer } from "@/lib/insforge-server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await rateLimit(`children_api:${ip}`, 60, 60);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const { data, error } = await insforgeServer.database
      .from("children_profiles")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/children]", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch children" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error("[api/children]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
