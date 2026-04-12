"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStorefront } from "../../_context/storefront-context";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const currencyFormatter = new Intl.NumberFormat("vi-VN");
function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)} đ`;
}

const modelOptions = [
  "iPhone 11",
  "iPhone 11 Pro Max",
  "iPhone 12/12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Pro Max",
  "iPhone 15 Plus",
  "iPhone 16",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16 Pro Max",
  "iPhone 17",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
];

export default function OrderPage() {
  const router = useRouter();
  const {
    selectedCase,
    selectedCharms,
    casePrice,
    totalPrice,
    orderForm,
    setOrderFormField,
    incrementCartCount,
  } = useStorefront();
  const [formValues, setFormValues] = useState(orderForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  type OrderFormField = keyof typeof orderForm;

  useEffect(() => {
    if (!selectedCase) {
      router.replace("/custom-case");
      return;
    }
  }, [selectedCase, router]);

  useEffect(() => {
    setFormValues(orderForm);
  }, [orderForm]);

  const updateFormField = useCallback(
    (key: OrderFormField, value: string) => {
      setSubmitError(null);
      setFormValues((prev) =>
        prev[key] === value ? prev : { ...prev, [key]: value },
      );
    },
    [],
  );

  const persistFormField = useCallback(
    (key: OrderFormField) => {
      if (orderForm[key] !== formValues[key]) {
        setOrderFormField(key, formValues[key]);
      }
    },
    [formValues, orderForm, setOrderFormField],
  );

  const syncFormToStorefront = useCallback(() => {
    (Object.keys(formValues) as OrderFormField[]).forEach((field) => {
      if (orderForm[field] !== formValues[field]) {
        setOrderFormField(field, formValues[field]);
      }
    });
  }, [formValues, orderForm, setOrderFormField]);

  const redirectToSepay = useCallback(
    (
      checkoutUrl: string,
      checkoutFormFields: Record<string, string | number>,
    ) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = checkoutUrl;
      form.style.display = "none";

      Object.entries(checkoutFormFields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    },
    [],
  );

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCase || selectedCharms.length === 0) {
      return;
    }

    if (
      !formValues.name?.trim() ||
      !formValues.instagram?.trim() ||
      !formValues.phoneNumber?.trim() ||
      !formValues.phoneModel?.trim()
    ) {
      setSubmitError("Please fill out information");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      syncFormToStorefront();

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          charmIds: selectedCharms.map((charm) => charm.id),
          customer: {
            name: formValues.name.trim(),
            instagram: formValues.instagram.trim(),
            phoneNumber: formValues.phoneNumber.trim(),
            phoneModel: formValues.phoneModel.trim(),
            address: formValues.address,
          },
          notes: formValues.notes?.trim() ?? '',
        }),
      });

      const orderData = (await orderResponse.json()) as {
        message?: string;
        orderCode?: string;
        checkoutUrl?: string;
        checkoutFormFields?: Record<string, string | number>;
      };

      if (!orderResponse.ok || !orderData.orderCode) {
        throw new Error(orderData.message ?? "Unable to place order.");
      }

      incrementCartCount();
      const orderCode = orderData.orderCode;
      if (orderData.checkoutUrl && orderData.checkoutFormFields) {
        redirectToSepay(orderData.checkoutUrl, orderData.checkoutFormFields);
        return;
      }

      router.push(`/confirmation/${orderCode}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Unable to place order.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const orderSummary = useMemo(
    () => (
      <section className="border border-black/20">
        <Box
          sx={{ borderBottom: "1px solid #A3A3A3", py: 1.5, px: 3 }}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography
            sx={{
              fontWeight: 100,
              fontSize: 24,
            }}
          >
            Base case: {selectedCase?.name ?? "-"}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            {formatVnd(casePrice)}
          </Typography>
        </Box>
        <Box sx={{ borderBottom: "1px solid #A3A3A3", py: 1.5, px: 3 }}>
          <Typography fontSize={24} fontWeight={100} mb={2}>
            Charm:
          </Typography>
          {selectedCharms.map((charm) => (
            <div
              key={charm.id}
              className="contents flex items-center justify-between pl-5"
            >
              <Box display={"flex"} alignItems={"center"} gap={1}>
                <Image
                  alt={charm.name}
                  width={28}
                  height={28}
                  src={charm.imageUrl ?? ""}
                />
                <Typography fontSize={20} fontWeight={100}>
                  {charm.name}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                {formatVnd(
                  Math.round(
                    (charm.price *
                      (100 - charm.discountPercent)) /
                    100,
                  ),
                )}
              </Typography>
            </div>
          ))}
        </Box>
        <Box
          py={1.5}
          px={3}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography sx={{ fontWeight: 100, fontSize: 24 }}>
            Total:
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
            {formatVnd(totalPrice)}
          </Typography>
        </Box>
      </section>
    ),
    [casePrice, selectedCase, selectedCharms, totalPrice],
  );

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
      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: { xs: "40px", md: "40px" },
          mb: 1,
          mt: 5,
        }}
      >
        Build something one-of-a-kind
      </Typography>

      {orderSummary}

      <Typography
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: { xs: "36px", md: "40px" },
          mt: 5,
          mb: 3.5,
        }}
      >
        Information
      </Typography>

      {!!submitError && <Alert sx={{ mb: 2 }} severity="error">{submitError}</Alert>}

      <form
        id="order-form"
        onSubmit={submitOrder}
        className="border border-black/20 p-5"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextField
            required
            disabled={isSubmitting}
            label="Name"
            value={formValues.name}
            onChange={(event) =>
              updateFormField("name", event.target.value)
            }
            onBlur={() => persistFormField("name")}
            fullWidth
          />
          <TextField
            required
            disabled={isSubmitting}
            label="Instagram"
            value={formValues.instagram}
            onChange={(event) =>
              updateFormField("instagram", event.target.value)
            }
            onBlur={() => persistFormField("instagram")}
            fullWidth
          />
          <TextField
            required
            disabled={isSubmitting}
            label="Phone number"
            value={formValues.phoneNumber}
            onChange={(event) =>
              updateFormField("phoneNumber", event.target.value)
            }
            onBlur={() => persistFormField("phoneNumber")}
            fullWidth
          />
          <FormControl fullWidth required disabled={isSubmitting}>
            <InputLabel id="phone-model-label">
              Phone model
            </InputLabel>
            <Select
              labelId="phone-model-label"
              label="Phone model"
              value={formValues.phoneModel}
              onChange={(event) =>
                updateFormField(
                  "phoneModel",
                  event.target.value,
                )
              }
              onBlur={() => persistFormField("phoneModel")}
            >
              {modelOptions.map((model) => (
                <MenuItem value={model} key={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            disabled={isSubmitting}
            label="Address"
            value={formValues.address}
            onChange={(event) =>
              updateFormField("address", event.target.value)
            }
            onBlur={() => persistFormField("address")}
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            disabled={isSubmitting}
            label="Note"
            value={formValues.notes}
            onChange={(event) =>
              updateFormField("notes", event.target.value)
            }
            onBlur={() => persistFormField("notes")}
            fullWidth
            multiline
            minRows={2}
          />
        </div>
      </form>

      <div className="relative py-28 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <Link
          href={"/custom-case/charms"}
          className="flex items-center gap-1 text-[15px] "
        >
          <ArrowLeft size={13} />
          Back
        </Link>
        <Typography
          sx={{
            color: "#838383",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 24,
            textAlign: "center",
            alignSelf: "center",
            position: { md: "absolute" },
            left: { md: "50%" },
            transform: { md: "translateX(-50%)" },
          }}
        >
          step 3 of 3
        </Typography>
        <Button
          form="order-form"
          type="submit"
          disabled={isSubmitting}
          variant="outlined"
          sx={{
            color: "#ffffff",
            borderColor: "#000000",
            borderRadius: 0,
            px: 5,
            textTransform: "none",
            height: 40,
          }}
          className="flex items-center justify-center gap-2 !bg-black hover:!bg-white hover:!text-black"
        >
          Place order <ArrowRight size={13} className="-mt-0.5" />
        </Button>
      </div>

      {isSubmitting ? (
        <Box
          aria-live="polite"
          role="status"
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            bgcolor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(1px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2 className="animate-spin" size={50} />
        </Box>
      ) : null}
    </>
  );
}
