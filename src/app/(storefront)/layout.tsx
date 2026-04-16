import { StorefrontThemeProvider } from "./_components/storefront-theme-provider";
import { AnnouncementBar, SiteFooter, SiteHeader } from "./_components/site-chrome";
import { StorefrontProvider } from "./_context/storefront-context";
import SwiperCart from "./_components/swiper-cart";

export default function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <StorefrontThemeProvider>
      <StorefrontProvider>
        <AnnouncementBar />
        <SiteHeader />
        {children}
        <SwiperCart />
        <SiteFooter />
      </StorefrontProvider>
    </StorefrontThemeProvider>
  );
}

