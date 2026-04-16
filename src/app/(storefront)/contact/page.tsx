import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Kinef Studio for custom case support, order updates, collaborations, and the official Instagram @kinef.studio.",
  keywords: [
    "kinef studio instagram",
    "@kinef.studio",
    "kinef contact",
    "custom case support",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact | Kinef Studio",
    description:
      "Reach out for order updates, support, collaborations, and connect on Instagram @kinef.studio.",
    url: "/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact | Kinef Studio",
    description:
      "Reach out for order updates, support, collaborations, and connect on Instagram @kinef.studio.",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-8 py-18.5 md:px-12 min-h-[calc(100vh-386px)]">
      <Box display={'flex'} gap={{ xs: 0, sm: 8 }} justifyContent={{ xs: 'center', lg: 'space-between' }} alignItems={'center'} flexWrap={'wrap'}>
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: {
                xs: 80,
                sm: 100,
                md: 150,
                fontWeight: 200,
                fontStyle: "italic",
              },
              mb: 3,
            }}
          >
            Get in
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: {
                xs: 80,
                sm: 100,
                md: 150,
                fontWeight: 200,
                fontStyle: "italic",
              },
              mb: 3,
              mt: { xs: -8, md: -15 },
              ml: { xs: 12, md: 22 },
            }}
          >
            touch
          </Typography>
        </Box>
        <Box mt={{ lg: 8 }}>
          <Typography
            component="p"
            sx={{
              color: "#000000",
              mb: 4,
              fontSize: { xs: 20, md: 24 },
            }}
          >
            Find me if you have any questions or concerns.
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "#818080",
              mb: 4,
              fontSize: { xs: 20, md: 24 },
            }}
          >
            Instagram:{" "}
            <Link
              className="!underline"
              href="https://instagram.com/kinef.studio"
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Official Kinef Studio Instagram profile @kinef.studio"
            >
              @kinef.studio
            </Link>
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "#818080",
              mb: 4,
              fontSize: { xs: 20, md: 24 },
            }}
          >
            Phone number: <Link className="!underline" href={'tel:(+84)988218053'}>(+84)988218053</Link>
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "#818080",
              mb: 4,
              fontSize: { xs: 20, md: 24 },
            }}
          >
            Address: Ho Chi Minh City (online)
          </Typography>
        </Box>
      </Box>
    </main>
  );
}
