import { createClient } from "@insforge/sdk";

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

if (!insforgeUrl || !insforgeAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_INSFORGE_URL or NEXT_PUBLIC_INSFORGE_ANON_KEY");
}

export const insforgeClient = createClient({ baseUrl: insforgeUrl, accessToken: insforgeAnonKey });
