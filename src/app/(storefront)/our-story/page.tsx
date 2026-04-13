import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import story1 from "@/assets/images/story1.svg";
import story2 from "@/assets/images/story2.svg";
import story3 from "@/assets/images/story3.svg";
import story4 from "@/assets/images/story4.svg";
import story5 from "@/assets/images/story5.svg";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Kinef Studio started in 2023 and creates handmade Mediterranean-inspired custom pieces, including one-of-a-kind phone cases.",
  keywords: ["Kinef Studio", "our story", "handmade brand", "custom phone case studio"],
  alternates: { canonical: "/our-story" },
  openGraph: {
    type: "article",
    title: "Our Story | Kinef Studio",
    description:
      "How Kinef Studio started and why each handmade piece is intentionally one-of-a-kind.",
    url: "/our-story",
  },
  twitter: {
    card: "summary",
    title: "Our Story | Kinef Studio",
    description:
      "How Kinef Studio started and why each handmade piece is intentionally one-of-a-kind.",
  },
};

export default function OurStoryPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-8 pt-14 pb-30 min-h-[calc(100vh-386px)]">
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontSize: { xs: "58px", md: "100px" },
          lineHeight: 1.05,
          mb: 14,
          textAlign: "center",
        }}
      >
        Our story
      </Typography>

      <section className="grid grid-cols-1 gap-14 md:grid-cols-[1fr_auto] relative">
        <Typography
          component="p"
          sx={{
            color: "#000000",
            fontSize: "24px",
            lineHeight: "50px",
            maxWidth: 472,
          }}
        >
          Kinef.studio started in 2023 - a few handmade phone cases,
          then scarves, bags, and other small things tied to the sea.
          The vibe is Mediterranean: ocean blues, natural textures,
          simple but clearly not off a shelf. Every piece is made by
          hand, no two exactly alike - and that's something Kinef
          intends to keep.
        </Typography>

        <Box display={'flex'} gap={2.2}>
          <Box display={'flex'} flexDirection={'column'} gap={2.8} alignItems={'end'}>
            <Image
              src={story1}
              width={311}
              height={353}
              className=""
              alt="Handcrafted Kinef resin phone case in a Mediterranean-inspired setup"
              loading='lazy'
            />
            <Image
              src={story4}
              width={263}
              height={329}
              className=""
              alt="Kinef handcrafted detail with texture and sea-inspired accents"
              loading='lazy'
            />
          </Box>
          <Box display={'flex'} flexDirection={'column'} gap={3.5}>
            <Image
              src={story2}
              width={328}
              height={415}
              className=""
              alt="Kinef Studio handmade piece inspired by coastal Mediterranean colors"
              loading='lazy'
            />
            <Image
              src={story5}
              width={329}
              height={261}
              className=""
              alt="Close-up of handcrafted Kinef material and finishing details"
              loading='lazy'
            />
          </Box>
        </Box>
        <Image
          src={story3}
          width={207}
          height={217}
          loading='lazy'
          className="absolute bottom-0 left-[calc(100%-840px)]"
          alt="Decorative Kinef visual inspired by sea motifs"
        />

        {/* <div className="grid grid-cols-2 gap-4">
          {[story1, story2, story3, story4, story5].map(
            (image, index) => (
              <div
                key={index}
                className={`relative overflow-hidden border border-black/10 ${index === 0 ? "col-span-2 h-[360px] md:h-[420px]" : "h-[180px] md:h-[220px]"}`}
              >
                <Image
                  src={image}
                  alt={`Kinef story image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ),
          )}
        </div> */}
      </section>
    </main>
  );
}
