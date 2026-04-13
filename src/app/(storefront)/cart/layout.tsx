import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review saved custom case builds and continue from step 3.",
  alternates: { canonical: "/cart" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
