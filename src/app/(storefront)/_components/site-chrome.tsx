"use client";

import { Button, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStorefront } from "../_context/storefront-context";
import Image from "next/image";
import logo from "@/assets/images/logo.svg";
import FullWidthDivider from "./full-divider";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href !== "/" && pathname.startsWith(href) && pathname !== "/");

  return (
    <Link href={href}>
      <Button
        variant="text"
        sx={{
          color: active ? "#1a1816" : "#838383",
          fontSize: "24px",
          minWidth: 0,
          fontWeight: 200,
          p: 0,
          textTransform: 'lowercase',
          "&:hover": {
            backgroundColor: "transparent",
            color: "#1a1816",
          },
        }}
      >
        {label}
      </Button>
    </Link>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-black py-2.5 text-center">
      <Typography
        component="p"
        sx={{
          color: "#fffdfa",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontFamily: "var(--font-sc), serif",
          fontSize: "24px",
        }}
      >
        New charm collection just dropped - while stock lasts
      </Typography>
    </div>
  );
}

export function SiteHeader() {
  const { cartCount } = useStorefront();
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fffdfa]">
      <div className="relative mx-auto flex h-[136px] w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        <nav
          className="flex items-center gap-6 md:gap-10 md:mt-6"
          aria-label="Primary"
        >
          <NavLink href="/custom-case" label="shop" />
          <NavLink href="/our-story" label="about" />
          <NavLink href="/contact" label="contact" />
        </nav>
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 leading-none"
          aria-label="Kinef Home"
        >
          <Image
            src={logo}
            alt="Kinef Logo"
            className="h-7 w-auto md:h-30 -mt-2"
            priority
          />
        </Link>
        <div className="text-right md:mt-6">
          <Link href={'/cart'} className="w-fit">
            <Typography
              component="span"
              sx={{
                fontWeight: 200,
                color: "#838383",
                borderBottom: "1px solid #838383",
                fontSize: "24px",
                ':hover': {
                  color: 'black',
                  borderColor: 'black',
                }
              }}
            >
              cart({cartCount})
            </Typography>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    { href: "/contact", label: "Contact" },
    { href: "/shipping", label: "Shipping" },
    { href: "/returns", label: "Returns" },
    {
      href: "https://instagram.com/kinef.studio",
      label: "Instagram",
      external: true,
    },
  ];

  return (
    <footer>
      <FullWidthDivider />
      <div className="mx-auto justify-between flex items-center w-full max-w-[1280px] gap-4 px-6 py-12 md:px-36">
        {links.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-[24px] font-[200] text-black w-fit transition hover:text-black"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="text-[24px] font-[200] text-black w-fit transition hover:text-black"
            >
              {item.label}
            </Link>
          ),
        )}
      </div>
      <div className="bg-black py-3 text-center">
        <Typography
          component="p"
          sx={{
            color: "#fff",
            textTransform: "uppercase",
            fontSize: "24px",
            fontWeight: 200,
          }}
        >
          Kinef Studio 2026
        </Typography>
      </div>
    </footer>
  );
}
