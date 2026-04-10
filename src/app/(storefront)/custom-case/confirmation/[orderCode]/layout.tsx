import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation",
  description: "Your Kinef custom case order has been received. View payment options and confirm your order.",
};

export default function ConfirmationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

