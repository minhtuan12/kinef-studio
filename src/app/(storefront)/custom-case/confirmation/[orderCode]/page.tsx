"use client";

import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStorefront } from "../../../_context/storefront-context";

type PaymentOption = {
  type: "deposit" | "full";
  amount: number;
  sepayOrderId?: string;
  sepayOrderCode?: string;
  qrCode?: string | null;
  checkoutUrl?: string | null;
  status?: string | null;
};

type PaymentResponse = {
  message?: string;
  options?: PaymentOption[];
  total?: number;
};

const currencyFormatter = new Intl.NumberFormat("vi-VN");
function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}

export default function ConfirmationPage() {
  const params = useParams<{ orderCode: string }>();
  const { resetBuilder } = useStorefront();
  const [orderCode, setOrderCode] = useState<string>("-");
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resetBuilder();
  }, [resetBuilder]);

  useEffect(() => {
    const run = async () => {
      const resolvedOrderCode = params.orderCode;
      if (!resolvedOrderCode) {
        return;
      }
      setOrderCode(resolvedOrderCode);
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${resolvedOrderCode}/payment-options`, {
          cache: "no-store",
        });
        const data = (await response.json()) as PaymentResponse;
        if (!response.ok && response.status !== 501) {
          throw new Error(data.message ?? "Unable to load payment options.");
        }
        setOptions(Array.isArray(data.options) ? data.options : []);
        setTotal(typeof data.total === "number" ? data.total : 0);
        setMessage(data.message ?? null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load payment options.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [params]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[1280px] flex-col border-x border-black/10 px-6 py-14 text-center md:px-10">
      <Typography component="h1" sx={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: { xs: "56px", md: "92px" }, mb: 1 }}>
        Kinef
      </Typography>
      <Typography sx={{ textTransform: "uppercase", letterSpacing: "0.24em", color: "#838383", mb: 5 }}>
        Order received
      </Typography>

      <div className="mx-auto w-full max-w-[720px] border-y border-black/20 py-6">
        <Typography sx={{ textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "11px", color: "#838383" }}>
          your order code
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-serif)", fontSize: { xs: "42px", md: "64px" }, mt: 1 }}>
          {orderCode}
        </Typography>
      </div>

      <Typography sx={{ mt: 4, color: "#5f5a57" }}>
        Transfer content must include <strong>{orderCode}</strong>. Choose 50% deposit or 100%
        full payment.
      </Typography>

      {loading ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <CircularProgress size={18} />
          <Typography>Loading payment options...</Typography>
        </div>
      ) : null}

      {message ? (
        <Alert severity="info" sx={{ mt: 3, mx: "auto", width: "100%", maxWidth: "880px" }}>
          {message}
        </Alert>
      ) : null}

      <section className="mx-auto mt-6 grid w-full max-w-[880px] grid-cols-1 gap-4 md:grid-cols-2">
        {options.map((option) => (
          <article key={option.type} className="border border-black/20 p-4 text-left">
            <Typography sx={{ textTransform: "uppercase", letterSpacing: "0.16em", color: "#6b6662", fontSize: "11px" }}>
              {option.type === "deposit" ? "Deposit 50%" : "Pay 100%"}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-serif)", fontSize: "40px", mt: 1 }}>
              {formatVnd(option.amount)}
            </Typography>
            <Typography sx={{ color: "#6b6662", mb: 2 }}>Content: {orderCode}</Typography>
            {option.qrCode ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={option.qrCode}
                alt={`${option.type} payment QR`}
                className="mb-3 aspect-square w-full max-w-[260px] border border-black/10 bg-white object-contain"
              />
            ) : null}
            {option.checkoutUrl ? (
              <Button
                variant="contained"
                sx={{ bgcolor: "#1a1816", borderRadius: 0 }}
                onClick={() => window.open(option.checkoutUrl ?? "", "_blank")}
              >
                Pay with SePay
              </Button>
            ) : null}
          </article>
        ))}
      </section>

      <Typography sx={{ mt: 5, color: "#5f5a57" }}>
        Total order value: {formatVnd(total)}. Message{" "}
        <a className="underline" href="https://instagram.com/kinef.studio" target="_blank" rel="noreferrer">
          @kinef.studio
        </a>{" "}
        with your order code for mockup confirmation.
      </Typography>

      <div className="mt-6 flex justify-center gap-3">
        <a href="https://instagram.com/kinef.studio" target="_blank" rel="noreferrer">
          <Button variant="outlined" sx={{ borderRadius: 20, px: 3 }}>
            DM on Instagram
          </Button>
        </a>
        <Link href="/">
          <Button variant="text">Back to home</Button>
        </Link>
      </div>
    </main>
  );
}
