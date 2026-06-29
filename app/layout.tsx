import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://openheartsfoundation.org"),
  title: "Open Hearts Foundation — Sponsor a Child in Uganda",
  description:
    "Every child in Uganda deserves a future. Walk alongside a child through Open Hearts Foundation. Your sponsorship provides education, food, shelter, and hope.",
  openGraph: {
    title: "Open Hearts Foundation — Giving with Kindness and Love",
    description:
      "Sponsor a child in Uganda. Every child deserves a loving home, quality education, and a future full of hope.",
    type: "website",
    locale: "en_UG",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Open Hearts Foundation — children reaching out with joy and hope",
        type: "image/png",
      },
      {
        url: "/og-image.png",
        width: 1200,
        height: 1200,
        alt: "Open Hearts Foundation — Giving with Kindness and Love",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Open Hearts Foundation — Giving with Kindness and Love",
    description:
      "Every child in Uganda deserves a future. Walk alongside a child today.",
    images: {
      url: "/og-image.png",
      alt: "Open Hearts Foundation — children reaching out with joy and hope",
    },
  },
  icons: {
    icon: [
      { url: "/images/logo/openhearts_logo.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
