export type FeedbackSeverity = "info" | "success" | "error";

export type Feedback = {
  severity: FeedbackSeverity;
  message: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type AdminCase = {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  imageUrl: string | null;
  colorHex: string;
  isActive: boolean;
};

export type AdminCharm = {
  id: string;
  name: string;
  icon: string;
  price: number;
  discountPercent: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
};

export type OrderSnapshotCase = {
  id: string;
  name: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  imageUrl: string | null;
};

export type OrderSnapshotCharm = {
  id: string;
  name: string;
  icon: string;
  price: number;
  discountPercent: number;
  finalPrice: number;
  imageUrl: string | null;
};

export type AdminOrder = {
  id: string;
  orderCode: string;
  customer: {
    name: string;
    instagram: string;
    phoneNumber: string;
    phoneModel: string;
  };
  caseItem?: string;
  charms: OrderSnapshotCharm[];
  total: number;
  charmTotal: number;
  caseTotal: number;
  status: OrderStatus;
  payment?: {
    status?: PaymentStatus;
    paidAmount?: number;
  };
  notes?: string;
  referenceImageUrl?: string | null;
  createdAt?: string;
};

export type CaseForm = {
  name: string;
  description: string;
  price: string;
  discountPercent: string;
  colorHex: string;
  imageUrl: string;
  isActive: boolean;
};

export type CharmForm = {
  name: string;
  icon: string;
  price: string;
  discountPercent: string;
  stock: string;
  imageUrl: string;
  isActive: boolean;
};

export type OrderDraft = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paidAmount: number;
};

