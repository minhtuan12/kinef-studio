import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your Kinef custom case order status and confirmation details.",
};

export default function ConfirmationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
