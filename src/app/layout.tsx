import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "./(storefront)/site-url";

const outfit = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const cormorantSc = Cormorant_SC({
  variable: "--font-sc",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kinef Studio",
    template: "%s | Kinef Studio",
  },
  description: "A handcrafted custom phone case builder with one-of-a-kind charms.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "Kinef Studio",
    description: "Handmade custom phone cases with one-of-a-kind charms.",
    siteName: "Kinef Studio",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kinef Studio",
    description: "Handmade custom phone cases with one-of-a-kind charms.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${cormorant.variable} ${cormorantSc.variable}`}>
        {children}
      </body>
    </html>
  );
}

