import type { Metadata } from "next";
import { Typography } from "@mui/material";
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
    <main className="mx-auto w-full max-w-[1280px] border-x border-black/10 px-8 py-14 md:px-12">
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-serif), serif",
          fontStyle: "italic",
          fontSize: { xs: "58px", md: "100px" },
          lineHeight: 1.05,
          mb: 6,
          textAlign: "center",
        }}
      >
        Our story
      </Typography>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.45fr]">
        <Typography
          component="p"
          sx={{
            color: "#3f3b37",
            fontSize: "16px",
            lineHeight: "1.95",
            letterSpacing: "0.02em",
            maxWidth: "460px",
          }}
        >
          Kinef.studio started in 2023 - a few handmade phone cases, then scarves, bags, and
          other small things tied to the sea. The vibe is Mediterranean: ocean blues, natural
          textures, simple but clearly not off a shelf. Every piece is made by hand, no two
          exactly alike - and that&apos;s something Kinef intends to keep.
        </Typography>

        <div className="grid grid-cols-2 gap-4">
          {[story1, story2, story3, story4, story5].map((image, index) => (
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
          ))}
        </div>
      </section>
    </main>
  );
}

