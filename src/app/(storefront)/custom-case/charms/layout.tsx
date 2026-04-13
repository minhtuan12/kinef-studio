import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Select Charms",
  description: "Step 2: choose one-of-a-kind charms to customize your Kinef phone case.",
  alternates: { canonical: "/custom-case/charms" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CharmsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
