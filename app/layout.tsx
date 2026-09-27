import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource/inter-tight/500.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "lenis/dist/lenis.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "UTN · Build your app with AI",
  description: "Go from idea to a launched product in 21 days. No code. No developers. Training, weekly live coaching, and a community of builders launching real apps with AI.",
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
