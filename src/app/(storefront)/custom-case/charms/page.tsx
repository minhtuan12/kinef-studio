"use client";

import { Box, Pagination, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStorefront } from "../../_context/storefront-context";
import Image from "next/image";
import { Loader2 } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("vi-VN");
function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}

export default function SelectCharmPage() {
  const ITEMS_PER_PAGE = 15;
  const router = useRouter();
  const {
    charms,
    selectedCase,
    selectedCharms,
    toggleCharm,
  } = useStorefront();
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(charms.length / ITEMS_PER_PAGE));

  const currentPageCharms = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return charms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [page, charms]);

  useEffect(() => {
    if (!selectedCase) {
      router.replace("/custom-case");
    }
  }, [selectedCase, router]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  if (!selectedCase) {
    return (
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{ minHeight: "calc(100vh - 400px)" }}
      >
        <Loader2 className="animate-spin" size={50} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ paddingInline: { xs: 0, md: 2 } }}>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: { xs: "42px", md: "40px" },
            mt: 3,
          }}
        >
          Select your charm
        </Typography>
        <Typography
          component="p"
          sx={{
            color: "#838383",
            mb: 6,
            mt: -1,
            fontStyle: "italic",
            fontSize: "24px",
            fontWeight: 100,
            fontFamily: "var(--font-serif)",
          }}
        >
          Each charm is one-of-a-kind. Once claimed, it's gone - the
          sold out ones were someone else's
        </Typography>
      </Box>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 lg:space-y-4 md:max-w-[1080px] mx-auto">
        {currentPageCharms.map((charm, index) => {
          const soldOut = charm.stock === 0 || !charm.isActive;
          const isSelected = selectedCharms.some(
            (selected) => selected.id === charm.id,
          );
          return (
            <button
              type="button"
              key={index}
              disabled={soldOut}
              className={`rounded-md lg:rounded-none relative flex lg:flex-col justify-between min-h-[150px] border px-2 sm:px-3 py-2 lg:p-2 transition lg:h-[182px] lg:w-[182px] ${isSelected
                ? "border-black bg-black/10"
                : "border-black bg-[#fffdfa]"
                } ${soldOut ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-black/5"}`}
              onClick={() => toggleCharm(charm)}
            >
              {soldOut ? (
                <span className="absolute right-2 top-2 bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-black/70">
                  sold out
                </span>
              ) : null}
              <div className="relative lg:aspect-[6/5] w-1/2 lg:w-full mx-auto h-[120px] mt-1">
                <Image
                  src={charm.imageUrl ?? ""}
                  alt={charm.name}
                  fill
                  className="object-scale-down !max-h-30"
                  priority
                />
              </div>
              <div className="flex flex-1 !justify-center lg:!justify-end flex-col">
                <Tooltip title={charm.name}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-serif)",
                      fontWeight: 200,
                      textAlign: "center",
                      color: "#000000",
                      lineHeight: 1,
                    }}
                    className="line-clamp-3 lg:line-clamp-2 !text-[18px] lg:!text-[14px]"
                  >
                    {charm.name}
                  </Typography>
                </Tooltip>
                <Typography
                  sx={{
                    color: "#000000",
                    mt: { xs: 1, md: 0.5 },
                    textAlign: "center",
                  }}
                  className="xs:!text-[14px] lg:!text-[8px]"
                >
                  {formatVnd(
                    Math.round(
                      (charm.price *
                        (100 - charm.discountPercent)) /
                      100,
                    ),
                  )}
                </Typography>
              </div>
            </button>
          );
        })}
      </div>

      {charms.length > ITEMS_PER_PAGE &&
        <Box display="flex" justifyContent="center" mt={5}>
          <Pagination
            page={page}
            count={pageCount}
            onChange={(_, value) => {
              setPage(value);
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </Box>
      }

      <Box mt={9} paddingInline={{ xs: 0, md: 7.5 }}>
        <Typography
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "24px",
            fontWeight: 200,
            color: "#000000",
          }}
        >
          <b>*Note</b>: We recommend at least 10 charms for a full, beautifully covered case.
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-serif)",
            fontSize: "16px",
            fontWeight: 200,
            color: "#797979",
          }}
          mt={-0.5}
        >
          Nên chọn ít nhất 10 charms để có thể phủ kín mặt ốp.
        </Typography>
      </Box>
    </>
  );
}
