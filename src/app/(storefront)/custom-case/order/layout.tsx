import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Information",
  description: "Step 3: review your custom case and submit delivery details for checkout.",
  alternates: { canonical: "/custom-case/order" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrderLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
