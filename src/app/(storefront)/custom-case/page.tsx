"use client";

import { Alert, Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { useStorefront } from "../_context/storefront-context";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}

export default function CustomCasePage() {
  const {
    cases,
    selectedCase,
    setSelectedCase,
    dataLoadError,
    isCatalogLoading,
    setOpenSwiperCart,
  } = useStorefront();

  useEffect(() => {
    setOpenSwiperCart(false);
  }, [setOpenSwiperCart]);

  return (
    <>
      <Typography
        component="p"
        sx={{
          color: "#838383",
          mt: 3.5,
          mb: 10,
          fontSize: { xs: '20px', md: "24px" },
          fontWeight: 100,
          fontStyle: "italic",
        }}
        className="!font-serif"
      >
        Choose the resin colour applied over your case - this sets the
        mood for everything.
      </Typography>

      {
        dataLoadError ? (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {dataLoadError}
          </Alert>
        ) : null
      }

      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {(isCatalogLoading ? Array.from(new Array(3)) : cases).map((item, index) => {
          const isSelected = selectedCase?.id === item?.id;
          const finalPrice = !isCatalogLoading ? Math.round(
            (item.price * (100 - item.discountPercent)) / 100,
          ) : 0;

          return (
            <Card
              key={index}
              sx={{
                ...(!isCatalogLoading && {
                  border: "1px solid",
                  borderColor: isSelected
                    ? "#1a1816"
                    : "rgba(0,0,0,0.22)",
                  bgcolor: isSelected ? "rgba(225, 220, 220, 0.22)" : "#fffdfa",
                }),
                boxShadow: "none",
              }}
            >
              {isCatalogLoading ? <Skeleton key={index} animation="wave" variant="rounded" className="w-full !h-[550]" /> : <button
                type="button"
                className="w-full cursor-pointer bg-transparent text-left h-full"
                onClick={() => setSelectedCase(item)}
              >
                <CardContent sx={{ padding: '12px 20px' }} className="h-full">
                  <Typography
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "32px",
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Image
                      width={item.width}
                      height={item.height}
                      src={item.imageUrl}
                      alt={`${item.name} resin custom case base`}
                      className={index === 2 ? 'mt-3' : ''}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </Box>
                  <Typography
                    sx={{ color: "#000000", mt: 1.5, textAlign: 'center', fontSize: 20, fontWeight: 300 }}
                  >
                    {formatVnd(finalPrice)}
                  </Typography>
                </CardContent>
              </button>
              }
            </Card>
          );
        })}
      </section>
    </>
  );
}
