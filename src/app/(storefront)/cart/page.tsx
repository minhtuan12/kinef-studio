"use client";

import { Alert, Button, Typography, useMediaQuery } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Trash2, X } from "lucide-react";
import { useStorefront } from "../_context/storefront-context";
import { dateFormatter, formatVnd } from "@/lib/constants";

export function useCart() {
  const router = useRouter();
  const {
    cartItems,
    removeCartItem,
    clearCart,
    hydrateBuilderFromCartItem,
    setOpenSwiperCart,
  } = useStorefront();
  const disabledCartPage = useMediaQuery('(max-width:1024px)');
  const [actionError, setActionError] = useState<string | null>(null);
  const pathname = usePathname();

  const continueToOrderStep = (itemId: string) => {
    setActionError(null);
    const hydrated = hydrateBuilderFromCartItem(itemId);
    if (!hydrated) {
      setActionError(
        "This cart item can no longer be restored because product data changed.",
      );
      return;
    }
    setOpenSwiperCart(false);
    router.push("/custom-case/order");
  };

  const buildAnotherFromItem = (itemId: string) => {
    setActionError(null);
    const hydrated = hydrateBuilderFromCartItem(itemId);
    if (!hydrated) {
      setActionError(
        "This cart item can no longer be restored because product data changed.",
      );
      return;
    }
    setOpenSwiperCart(false);
    router.push("/custom-case/charms");
  };

  useEffect(() => {
    if (disabledCartPage && pathname.includes('cart')) {
      setOpenSwiperCart(true);
      router.replace('/');
    }
  }, [disabledCartPage, pathname]);

  return {
    actionError,
    continueToOrderStep,
    buildAnotherFromItem,
    cartItems,
    removeCartItem,
    clearCart,
  };
}

export function CartContent() {
  const {
    actionError,
    continueToOrderStep,
    buildAnotherFromItem,
    cartItems,
    removeCartItem,
    clearCart,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: { xs: "42px", md: "48px" },
            mb: 1,
          }}
        >
          Cart
        </Typography>
        <Typography
          component="p"
          sx={{
            color: "#838383",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
            fontSize: "24px",
            fontWeight: 100,
            mb: 6,
          }}
        >
          No saved builds yet. Create a custom case and add it from
          step 3.
        </Typography>
        <Link href="/custom-case" className="inline-flex">
          <Button
            variant="outlined"
            sx={{
              borderRadius: 0,
              borderColor: "#1a1816",
              color: "#1a1816",
              textTransform: "none",
              px: 4,
              height: 40,
            }}
            className="flex items-center gap-2 hover:!bg-black hover:!text-white"
          >
            Start building <ArrowRight size={13} />
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: { xs: "42px", md: "48px" },
              mb: 0.5,
            }}
          >
            Cart
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "#838383",
              fontStyle: "italic",
              fontFamily: "var(--font-serif)",
              fontSize: "24px",
              fontWeight: 100,
            }}
          >
            Saved custom builds ({cartItems.length})
          </Typography>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outlined"
            onClick={clearCart}
            sx={{
              borderRadius: 0,
              borderColor: "#1a1816",
              color: "#1a1816",
              textTransform: "none",
              px: 2.5,
              height: 36,
            }}
            className="hover:!bg-black hover:!text-white flex items-center gap-2"
          >
            Clear cart <X size={16} />
          </Button>
        </div>
      </div>

      {
        !!actionError ? (
          <Alert sx={{ mb: 3 }} severity="warning">
            {actionError}
          </Alert>
        ) : null
      }

      <div className="space-y-5">
        {cartItems.map((item) => (
          <section
            key={item.id}
            className="border border-black/20 bg-white/80 p-5 md:p-6"
          >
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <Typography sx={{ fontSize: 16, color: "#5d5d5d" }}>
                Saved on{" "}
                {dateFormatter.format(new Date(item.addedAt))}
              </Typography>
              <Typography sx={{ fontSize: 18 }}>
                Total:{" "}
                <strong>{formatVnd(item.totalPrice)}</strong>
              </Typography>
            </div>

            <div className="grid gap-5 border-t border-black/10 pt-4 md:grid-cols-[1.2fr_1fr]">
              <div className="space-y-3">
                <Typography
                  sx={{
                    fontSize: 20,
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  Case
                </Typography>
                <div className="flex items-center gap-3">
                  <Image
                    src={item.caseItem.imageUrl}
                    alt={`${item.caseItem.name} custom case preview`}
                    width={60}
                    height={60}
                    loading="lazy"
                  />
                  <div>
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 300,
                      }}
                    >
                      {item.caseItem.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#5d5d5d",
                      }}
                    >
                      {formatVnd(item.caseItem.unitPrice)}
                    </Typography>
                  </div>
                </div>

                <Typography
                  sx={{
                    fontSize: 20,
                    fontFamily: "var(--font-serif)",
                    mt: 2,
                  }}
                >
                  Charms ({item.charms.length})
                </Typography>
                {item.charms.length === 0 ? (
                  <Typography
                    sx={{ fontSize: 14, color: "#5d5d5d" }}
                  >
                    No charms selected.
                  </Typography>
                ) : (
                  <ul className="space-y-2">
                    {item.charms.map((charm) => (
                      <li
                        key={charm.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          {charm.imageUrl ? (
                            <Image
                              src={charm.imageUrl}
                              alt={charm.name}
                              width={22}
                              height={22}
                              className="h-auto w-auto"
                              loading="lazy"
                            />
                          ) : (
                            <span aria-hidden>
                              {charm.icon}
                            </span>
                          )}
                          <Typography
                            sx={{ fontSize: 16 }}
                          >
                            {charm.name}
                          </Typography>
                        </div>
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "#5d5d5d",
                          }}
                        >
                          {formatVnd(charm.unitPrice)}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3 border-t border-black/10 pt-4 md:border-t-0 md:border-l md:border-black/10 md:pl-5 md:pt-0">
                <Typography
                  sx={{
                    fontSize: 20,
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  Customer details
                </Typography>
                <div className="space-y-1 text-[15px]">
                  <p>
                    <strong>Name:</strong>{" "}
                    {item.customer.name || "-"}
                  </p>
                  <p>
                    <strong>Instagram:</strong>{" "}
                    {item.customer.instagram || "-"}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {item.customer.phoneNumber || "-"}
                  </p>
                  <p>
                    <strong>Model:</strong>{" "}
                    {item.customer.phoneModel || "-"}
                  </p>
                  <p>
                    <strong>Address:</strong>{" "}
                    {item.customer.address || "-"}
                  </p>
                  <p>
                    <strong>Note:</strong>{" "}
                    {item.customer.notes || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-4 md:flex-row md:items-center md:justify-between">
              <Button
                type="button"
                variant="text"
                onClick={() => buildAnotherFromItem(item.id)}
                sx={{
                  color: "#1a1816",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                }}
                className="inline-flex items-center gap-1"
              >
                <ArrowLeft size={13} />
                Build another
              </Button>
              <div className="flex flex-col items-stretch gap-3 md:flex-row">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => removeCartItem(item.id)}
                  sx={{
                    borderRadius: 0,
                    borderColor: "#1a1816",
                    color: "#1a1816",
                    textTransform: "none",
                    px: 2.5,
                    height: 40,
                  }}
                  className="flex items-center gap-2 hover:!bg-black hover:!text-white"
                >
                  Remove <Trash2 size={14} />
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => continueToOrderStep(item.id)}
                  sx={{
                    borderRadius: 0,
                    borderColor: "#000000",
                    color: "#ffffff",
                    textTransform: "none",
                    px: 3.5,
                    height: 40,
                  }}
                  className="flex items-center gap-2 !bg-black hover:!bg-white hover:!text-black"
                >
                  Place order <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default function CartPage() {
  return <main className="mx-auto w-full max-w-[1280px] px-6 py-10 md:px-10 min-h-[calc(100vh-386px)]">
    <CartContent />
  </main>;
}
