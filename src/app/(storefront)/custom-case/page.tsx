"use client";

import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useStorefront } from "../_context/storefront-context";
import Image from "next/image";

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}

export default function CustomCasePage() {
  const router = useRouter();
  const {
    cases,
    selectedCase,
    setSelectedCase,
    dataLoadError,
    isCatalogLoading,
  } = useStorefront();

  return (
    <>
      <Typography
        component="p"
        sx={{
          color: "#838383",
          mt: 3.5,
          mb: 10,
          fontSize: "24px",
          fontWeight: 100,
          fontStyle: "italic",
        }}
        className="!font-serif"
      >
        Choose the resin colour applied over your case - this sets the
        mood for everything.
      </Typography>

      {
        isCatalogLoading ? (
          <Alert severity="info" sx={{ mt: 3 }}>
            Loading latest catalog...
          </Alert>
        ) : null
      }
      {
        dataLoadError ? (
          <Alert severity="warning" sx={{ mt: 3 }}>
            {dataLoadError}
          </Alert>
        ) : null
      }

      <section className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {cases.map((item) => {
          const isSelected = selectedCase?.id === item.id;
          const finalPrice = Math.round(
            (item.price * (100 - item.discountPercent)) / 100,
          );

          return (
            <Card
              key={item.id}
              sx={{
                border: "1px solid",
                borderColor: isSelected
                  ? "#1a1816"
                  : "rgba(0,0,0,0.22)",
                boxShadow: "none",
                bgcolor: isSelected ? "rgba(225, 220, 220, 0.22)" : "#fffdfa",
              }}
            >
              <button
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
                      width={0}
                      height={0}
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-7 w-auto md:h-auto md:max-h-[437px] -mt-2"
                      priority
                    />
                  </Box>
                  <Typography
                    sx={{ color: "#000000", mt: 1.5, textAlign: 'center', fontSize: 20, fontWeight: 300 }}
                  >
                    {formatVnd(finalPrice)}
                  </Typography>
                </CardContent>
              </button>
            </Card>
          );
        })}
      </section>
    </>
  );
}
