"use client";

import { Box, Button, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStorefront } from "../_context/storefront-context";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import { BookText, ContactRound, Home, Menu, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useState } from "react";

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
          color: active ? "#000000" : "#838383",
          fontSize: "24px",
          minWidth: 0,
          fontWeight: 200,
          p: 0,
          ...(active ? { fontWeight: 300 } : {}),
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
          fontSize: { md: "24px" },
        }}
      >
        New charm collection just dropped - while stock lasts
      </Typography>
    </div>
  );
}

const links = [
  {
    href: '/',
    label: 'home',
    icon: <Home />,
    enabledMobile: true,
  },
  {
    href: '/custom-case',
    label: 'shop',
    icon: <ShoppingBag />,
    enabledMobile: false,
  },
  {
    href: "/our-story",
    label: 'about',
    icon: <BookText />,
    enabledMobile: false,
  },
  {
    href: "/contact",
    label: 'contact',
    icon: <ContactRound />,
    enabledMobile: false,
  },
  {
    href: "/cart",
    label: 'cart',
    icon: <ShoppingCart />,
    enabledMobile: true,
  },
]

export function SiteHeader() {
  const { cartCount, setOpenSwiperCart } = useStorefront();
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: { xs: '80vw', sm: 300 } }} pl={1.5} role="presentation" onClick={toggleDrawer(false)}>
      <Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={70}>
        <Image
          src={logo}
          alt="Kinef Studio logo"
          className="w-20 h-auto lg:w-auto max-w-[188px] max-h-[122px] -mt-1"
          priority
        />
      </Box>
      <Divider />
      <List>
        {links.map(({ href, label, icon }) => (
          <ListItem key={href} disablePadding className="mb-2">
            {href === '/cart' ? <ListItemButton onClick={() => setOpenSwiperCart(true)}>
              <ListItemIcon className="!min-w-11">
                {icon}
              </ListItemIcon>
              <ListItemText primary={`${label}(${cartCount})`} sx={{ textTransform: 'capitalize' }} className="[&>.MuiTypography-root]:!font-serif [&>.MuiTypography-root]:!text-[24px]" />
            </ListItemButton> :
              <Link href={href} className="!w-full">
                <ListItemButton>
                  <ListItemIcon className="!min-w-11">
                    {icon}
                  </ListItemIcon>
                  <ListItemText primary={label} sx={{ textTransform: 'capitalize' }} className="[&>.MuiTypography-root]:!font-serif [&>.MuiTypography-root]:!text-[24px]" />
                </ListItemButton>
              </Link>
            }
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#fffdfa]">
      <div className="relative mx-auto flex h-[80px] lg:h-[136px] w-full max-w-[1280px] items-center justify-end lg:justify-between px-6 md:px-10">
        <nav
          className="lg:flex items-center gap-6 md:gap-10 md:mt-6 hidden"
          aria-label="Primary"
        >
          {links.map(l => !l.enabledMobile ? <NavLink key={l.href} href={l.href} label={l.label} /> : null)}
        </nav>
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 leading-none"
          aria-label="Kinef Home"
        >
          <Image
            src={logo}
            alt="Kinef Studio logo"
            className="w-26 h-auto lg:w-auto max-w-[188px] max-h-[122px] -mt-1"
            priority
          />
        </Link>
        <div className="text-right md:mt-6 hidden lg:block">
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
        <div className="block lg:hidden">
          <Menu onClick={toggleDrawer(true)} />
          <Drawer open={open} onClose={toggleDrawer(false)} anchor="right" slotProps={{ paper: { className: '!h-full' } }}>
            {DrawerList}
          </Drawer>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    { href: "/contact", label: "Contact" },
    { href: "/#", label: "Shipping" },
    { href: "/#", label: "Returns" },
    {
      href: "https://instagram.com/kinef.studio",
      label: "Instagram",
      external: true,
    },
  ];

  return (
    <footer>
      <Divider
        sx={{
          borderColor: "#6E6E6E",
          width: "100%",
        }}
      />
      <div className="mx-auto md:justify-between flex items-center w-full max-w-[1280px] gap-4 px-6 py-12 md:px-36 flex-wrap justify-center">
        {links.map((item) =>
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label="Kinef Studio Instagram profile"
              className="text-[18px] lg:text-[24px] font-[200] text-black w-fit transition hover:text-black"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="text-[18px] lg:text-[24px] font-[200] text-black w-fit transition hover:text-black"
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
            fontSize: { sm: '16px', md: "24px" },
            fontWeight: 200,
          }}
        >
          Kinef Studio 2026
        </Typography>
      </div>
    </footer>
  );
}
