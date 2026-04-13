import type {
  AdminCase,
  AdminCharm,
  CaseForm,
  CharmForm,
  FeedbackSeverity,
  OrderStatus,
  PaymentStatus,
} from "./admin-types";

export const INITIAL_CASE_FORM: CaseForm = {
  name: "",
  description: "",
  price: "65000",
  discountPercent: "0",
  colorHex: "",
  imageUrl: "",
  isActive: true,
};

export const INITIAL_CHARM_FORM: CharmForm = {
  name: "",
  icon: "*",
  price: "0",
  discountPercent: "0",
  stock: "0",
  imageUrl: "",
  isActive: true,
};

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

// export const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partial", "paid"];
export const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "paid"];

export function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND`;
}

export function sanitizeMoneyInput(value: string) {
  return value.replace(/\D/g, "");
}

export function formatMoneyInput(value: string) {
  const digits = sanitizeMoneyInput(value);
  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat("vi-VN").format(Number(digits));
}

export function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function orderStatusLabel(value: OrderStatus) {
  return {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  }[value];
}

export function paymentStatusLabel(value: PaymentStatus) {
  return {
    unpaid: "Unpaid",
    partial: "Partial",
    paid: "Paid",
  }[value];
}

export function severityTone(value: FeedbackSeverity) {
  return value;
}

export function orderStatusTone(value: OrderStatus): "warning" | "info" | "success" | "danger" {
  switch (value) {
    case "pending":
      return "warning";
    case "confirmed":
    case "in_progress":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
  }
}

export function paymentStatusTone(value: PaymentStatus): "warning" | "success" | "danger" {
  switch (value) {
    case "unpaid":
      return "danger";
    case "partial":
      return "warning";
    case "paid":
      return "success";
  }
}

export function caseFinalPrice(item: Pick<AdminCase, "price" | "discountPercent">) {
  return Math.max(0, Math.round(item.price - item.price * (item.discountPercent / 100)));
}

export function charmFinalPrice(item: Pick<AdminCharm, "price" | "discountPercent">) {
  return Math.max(0, Math.round(item.price - item.price * (item.discountPercent / 100)));
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

