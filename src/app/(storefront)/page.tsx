import type { Metadata } from "next";
import { Box, Button, Divider, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import banner from "@/assets/images/banner.svg";
import { ArrowRight } from "lucide-react";
import FullWidthDivider from "./_components/full-divider";

export const metadata: Metadata = {
  title: "Custom Phone Cases",
  description:
    "Handmade custom phone cases by Kinef Studio. Choose a base, select one-of-a-kind charms, and place your order online.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Kinef Studio - Custom Phone Cases",
    description:
      "Each case is handmade to order. Build your own one-of-a-kind custom phone case with curated charms.",
    url: "/",
  },
};

export default function HomePage() {

  return (
    <main className="mx-auto w-full max-w-[1280px] min-h-[calc(100vh-386px)]">
      <section className="grid min-h-[799px] max-h-[799px] grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-between border-b border-black/10 px-8 py-32 md:border-b-0 md:border-r md:px-36">
          <Box display={'flex'} alignItems={'center'} gap={3} justifyContent={'space-between'} mb={3}>
            <Typography
              variant="body1"
              component="p"
              sx={{
                fontSize: "15px",
                color: "#838383",
                mb: 2,
              }}
            >
              handmade
            </Typography>
            <Typography
              variant="body1"
              component="p"
              sx={{
                fontSize: "15px",
                color: "#838383",
                mb: 2,
              }}
            >
              Ho Chi Minh city
            </Typography>
            <Typography
              variant="body1"
              component="p"
              sx={{
                fontSize: "15px",
                color: "#838383",
                mb: 2,
              }}
            >
              est 2023
            </Typography>
          </Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif), serif",
              fontSize: { xs: "58px", md: "100px" },
              lineHeight: 0.95,
              letterSpacing: "0.03em",
              mb: 6,
              textAlign: 'center',
            }}
          >
            Custom
            <br />
            <span style={{ fontStyle: "italic", fontSize: "70px" }}>Phone Cases</span>
          </Typography>
          <Box display={'flex'} justifyContent={'center'}>
            <Typography
              component="p"
              sx={{
                maxWidth: "318px",
                color: "#838383",
                fontSize: "15px",
                lineHeight: "27px",
                letterSpacing: "0.6%",
                mb: 10,
              }}
            >
              Each case is made entirely by hand. You choose the resin base, we help you select
              the charms. Then we begin crafting your order, ready within 7-14 working days.
            </Typography>
          </Box>
          <Box display={'flex'} justifyContent={'center'}>
            <Link href="/custom-case">
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#1a1816",
                  color: "#1a1816",
                  borderRadius: 0,
                  textTransform: "none",
                  px: 2,
                  py: 1.2,
                  fontSize: "14px",
                  "&:hover": { borderColor: "#1a1816", bgcolor: "#1a1816", color: "#fffdfa" },
                }}
              >
                Begin your lovely case <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </Box>
        </div>
        <Image
          height={799}
          width={599}
          src={banner}
          alt="Kinef custom phone case hero"
          className="object-cover"
          preload
        />
      </section>

      <FullWidthDivider />

      <section className="px-8 py-16 md:px-36">
        <Typography
          variant="body2"
          component="p"
          sx={{ fontSize: "15px", mb: 1.8 }}
        >
          the process
        </Typography>
        <Typography
          component="h2"
          sx={{ fontFamily: "var(--font-serif), serif", fontSize: { xs: "44px", md: "64px" }, mb: 7.5 }}
        >
          Three steps to yours
        </Typography>
        <div className="grid grid-cols-1 border border-black/20 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Choose your base",
              body: "White, black, or clear resin - the foundation of your case. Each finish creates a completely different mood.",
            },
            {
              number: "02",
              title: "Select your charms",
              body: "Browse our curio. Every charm is one-of-a-kind once it’s gone. It's gone forever",
            },
            {
              number: "03",
              title: "We made it for you",
              body: "Place your order, receive a code. DM us on instagram, we'll send a mockup of your charm placement before we begin",
            },
          ].map((item, index) => (
            <article
              key={item.number}
              className={`px-6 pb-11 pt-5 ${index < 2 ? "border-b border-black/20 md:border-b-0 md:border-r" : ""}`}
            >
              <p className="mb-1.5 text-[14px] text-[#535252] font-[200]">{item.number}</p>
              <h3 className="mb-8 font-serif text-[24px] italic">{item.title}</h3>
              <p className="text-[13px] font-[200] leading-5 text-[#535252]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <FullWidthDivider />

      <section className="flex items-center justify-between px-8 md:px-36 md:py-12">
        {[
          { href: "/custom-case", title: "Shop", subtitle: "custom cases" },
          { href: "/our-story", title: "About", subtitle: "our story" },
          { href: "/contact", title: "Contact", subtitle: "get in touch" },
        ].map((item, index) => (
          <Link key={item.title} href={item.href} className={`py-8 flex w-fit flex-col ${index === 0 ? 'items-start' : (index === 1 ? 'items-center' : 'items-end')}`}>
            <h3 className="font-serif text-[60px] font-[300]">{item.title}</h3>
            <p className={`text-[24px] font-sans text-[#838383] font-[100] -mt-3 text-left w-full ${index === 2 ? '-mr-1' : ''}`}>{item.subtitle}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
