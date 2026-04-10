import type { Metadata } from "next";
import { BuilderStepper } from "../_components/stepper";
import { BottomAction } from "../_components/bottom-action";

export const metadata: Metadata = {
  title: "Build Your Case",
  description: "Step 1: choose your base colour for a handmade Kinef custom phone case.",
  alternates: { canonical: "/custom-case" },
};

export default function CustomCaseLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10">
    <BuilderStepper />
    {children}
    <BottomAction />
  </main>;
}

