import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your Kinef custom case order status and confirmation details.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function ConfirmationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
