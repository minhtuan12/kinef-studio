import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import story1 from "@/assets/images/story1.png";
import story2 from "@/assets/images/story2.png";
import story3 from "@/assets/images/story3.png";
import story4 from "@/assets/images/story4.png";
import story5 from "@/assets/images/story5.png";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Kinef Studio started in 2023 and creates handmade Mediterranean-inspired custom pieces, including one-of-a-kind phone cases.",
  alternates: { canonical: "/our-story" },
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
            <Image src={story1} className="w-auto h-auto md:max-w-[311px] md:max-h-[353px]" alt="Kinef story image 1" />
            <Image src={story4} className="w-auto h-auto md:max-w-[263px] md:max-h-[329px]" alt="Kinef story image 4" />
          </Box>
          <Box display={'flex'} flexDirection={'column'} gap={3.5}>
            <Image src={story2} className="w-auto h-auto md:max-w-[328px] md:max-h-[415px]" alt="Kinef story image 2" />
            <Image src={story5} className="w-auto h-auto md:max-w-[329px] md:max-h-[261px]" alt="Kinef story image 5" />
          </Box>
        </Box>
        <Image src={story3} className="absolute bottom-0 left-[calc(100%-840px)] w-auto h-auto md:max-w-[207px] md:max-h-[217px]" alt="Kinef story image 3" />

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
