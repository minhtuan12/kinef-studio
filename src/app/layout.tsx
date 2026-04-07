import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kinef — Custom Phone Cases",
  description:
    "A handcrafted custom phone case builder with one-of-a-kind charms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
