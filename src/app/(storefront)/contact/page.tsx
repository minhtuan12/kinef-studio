import type { Metadata } from "next";
import { Button, Typography } from "@mui/material";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Kinef Studio for custom case support, order updates, and collaborations.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] border-x border-black/10 px-8 py-16 md:px-12">
      <Typography component="h1" sx={{ fontFamily: "var(--font-serif)", fontSize: { xs: "56px", md: "88px" }, mb: 3 }}>
        Contact
      </Typography>
      <Typography component="p" sx={{ maxWidth: "620px", color: "#5f5a57", mb: 4, lineHeight: 1.9 }}>
        For order support and custom requests, message us directly on Instagram. Include your order
        code for faster updates.
      </Typography>
      <a href="https://instagram.com/kinef.studio" target="_blank" rel="noreferrer">
        <Button variant="contained" sx={{ bgcolor: "#1a1816", borderRadius: 0, px: 3, py: 1.2 }}>
          DM @kinef.studio
        </Button>
      </a>
    </main>
  );
}

