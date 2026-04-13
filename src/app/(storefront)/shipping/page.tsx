import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping",
  description: "Shipping timeline and delivery notes for Kinef Studio handmade custom case orders.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  // return (
  //   <main className="mx-auto w-full max-w-[1280px] border-x border-black/10 px-8 py-16 md:px-12 min-h-[calc(100vh-386px)]">
  //     <Typography component="h1" sx={{ fontFamily: "var(--font-serif)", fontSize: { xs: "56px", md: "88px" }, mb: 3 }}>
  //       Shipping
  //     </Typography>
  //     <Typography component="p" sx={{ maxWidth: "700px", color: "#5f5a57", lineHeight: 1.9 }}>
  //       Kinef pieces are handmade to order. Typical production plus shipping time is 7-14 working
  //       days after mockup confirmation. Peak-season timelines can be longer.
  //     </Typography>
  //   </main>
  // );
  return null;
}

