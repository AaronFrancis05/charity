import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  turnstileToken: z.string().min(1, "Turnstile verification required"),
});

export const CreateChildSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  region: z.enum([
    "Kampala",
    "Gulu",
    "Jinja",
    "Mbale",
    "Mbarara",
    "Other",
  ]),
  narrative: z.string().min(50, "Narrative must be at least 50 characters"),
  goal_monthly_ugx: z.number().int().positive("Monthly goal must be a positive number"),
  profile_image_url: z.string().url("Invalid image URL"),
  video_url: z.string().url("Invalid video URL").optional().nullable(),
});

export const UpdateChildSchema = CreateChildSchema.partial().extend({
  id: z.string().uuid("Invalid child ID"),
  is_active: z.boolean().optional(),
});

export const DonationInitiateSchema = z.object({
  childId: z.string().uuid("Invalid child ID"),
  donorEmail: z.string().email("Invalid email address"),
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  provider: z.enum(["CARD", "MTN_MOMO", "AIRTEL_MONEY"]),
  amountUgx: z.number().int().min(5000, "Minimum donation is UGX 5,000"),
  turnstileToken: z.string().min(1, "Turnstile verification required"),
});

export const TurnstileVerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const FlutterwaveWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.number(),
    tx_ref: z.string(),
    flw_ref: z.string(),
    status: z.string(),
    amount: z.number(),
    currency: z.string(),
    customer: z.object({
      email: z.string(),
      name: z.string().optional(),
    }),
    meta: z.record(z.string(), z.string()).optional(),
  }),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type CreateChildInput = z.infer<typeof CreateChildSchema>;
export type UpdateChildInput = z.infer<typeof UpdateChildSchema>;
export type DonationInitiateInput = z.infer<typeof DonationInitiateSchema>;
