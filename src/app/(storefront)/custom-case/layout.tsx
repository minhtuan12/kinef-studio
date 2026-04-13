import type { Metadata } from "next";
import { BuilderStepper } from "../_components/stepper";
import { BottomAction } from "../_components/bottom-action";

export const metadata: Metadata = {
  title: "Build Your Case",
  description: "Step 1: choose your base colour for a handmade Kinef custom phone case.",
  alternates: { canonical: "/custom-case" },
  openGraph: {
    type: "website",
    title: "Build Your Case | Kinef Studio",
    description:
      "Start step 1 of the Kinef builder: choose your base for a handmade custom phone case.",
    url: "/custom-case",
  },
  twitter: {
    card: "summary",
    title: "Build Your Case | Kinef Studio",
    description:
      "Start step 1 of the Kinef builder: choose your base for a handmade custom phone case.",
  },
};

export default function CustomCaseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 min-h-[calc(100vh-386px)]">
    <BuilderStepper />
    {children}
    <BottomAction />
  </main>;
}
