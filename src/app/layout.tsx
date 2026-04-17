import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSiteUrl } from "./(storefront)/site-url";
import introImage from '@/assets/images/story5.svg';

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
const instagramUrl = "https://instagram.com/kinef.studio";
const gaMeasurementId = "G-M95L2FC1VX";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Kinef Studio",
      url: siteUrl,
      sameAs: [instagramUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Kinef Studio",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kinef Studio",
    template: "%s | Kinef Studio",
  },
  description: "A handcrafted custom phone case builder with one-of-a-kind charms.",
  applicationName: "Kinef Studio",
  category: "ecommerce",
  keywords: [
    "custom phone cases",
    "handmade phone case",
    "resin phone case",
    "Kinef Studio",
    "phone case charms",
    "kinef studio instagram",
    "@kinef.studio",
    "kinef",
    "ocean",
    "kinefstudio",
    "handmade",
  ],
  authors: [{ name: "Kinef Studio", url: instagramUrl }],
  creator: "@kinef.studio",
  publisher: "Kinef Studio",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Kinef Studio",
    description: "Handmade custom phone cases with one-of-a-kind charms.",
    siteName: "Kinef Studio",
    url: "/",
    images: [
      {
        url: introImage,
        width: 1200,
        height: 630,
        alt: 'Kinef Studio',
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Kinef Studio",
    description: "Handmade custom phone cases with one-of-a-kind charms.",
    site: "@kinef.studio",
    creator: "@kinef.studio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="me" href={instagramUrl} />
      </head>
      <body className={`${outfit.variable} ${cormorant.variable} ${cormorantSc.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag-manager-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
