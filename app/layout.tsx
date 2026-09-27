import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "lenis/dist/lenis.css";
import "./globals.css";
import { brand, seo } from "@/lib/content";

export const metadata: Metadata = {
  // absolute URLs for share previews; set NEXT_PUBLIC_SITE_URL (e.g. https://utn.com) when deploying
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: seo.title,
  description: seo.description,
  openGraph: { title: seo.title, description: seo.description, siteName: brand.name, type: "website" },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
};

export const viewport: Viewport = {
  themeColor: "#f3f3f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
