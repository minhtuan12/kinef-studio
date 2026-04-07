export type SepayOrderResponse = {
  id: string;
  orderCode: string;
  amount: number;
  qrCode?: string;
  checkoutUrl?: string;
  status?: string;
};

type CreateSepayOrderParams = {
  amount: number;
  orderCode: string;
  description: string;
};

function getSepayConfig() {
  const apiToken = process.env.SEPAY_API_TOKEN;
  const bankAccountUuid = process.env.SEPAY_BANK_ACCOUNT_UUID;
  const apiBaseUrl = process.env.SEPAY_API_BASE_URL ?? "https://userapi.sepay.vn/v2";
  const successRedirectUrl = process.env.SEPAY_SUCCESS_REDIRECT_URL;
  const cancelRedirectUrl = process.env.SEPAY_CANCEL_REDIRECT_URL;
  const paymentMethods = process.env.SEPAY_PAYMENT_METHODS
    ? process.env.SEPAY_PAYMENT_METHODS.split(",").map((item) => item.trim())
    : ["bank_transfer"];

  return {
    apiToken,
    bankAccountUuid,
    apiBaseUrl,
    successRedirectUrl,
    cancelRedirectUrl,
    paymentMethods,
  };
}

export function isSepayConfigured() {
  const { apiToken, bankAccountUuid } = getSepayConfig();
  return Boolean(apiToken && bankAccountUuid);
}

export async function createSepayOrder({
  amount,
  orderCode,
  description,
}: CreateSepayOrderParams): Promise<SepayOrderResponse> {
  const config = getSepayConfig();
  if (!config.apiToken || !config.bankAccountUuid) {
    throw new Error(
      "SePay is not configured. Set SEPAY_API_TOKEN and SEPAY_BANK_ACCOUNT_UUID.",
    );
  }

  const payload = {
    bank_account_uuid: config.bankAccountUuid,
    order_code: orderCode,
    amount,
    description,
    payment_methods: config.paymentMethods,
    success_redirect_url: config.successRedirectUrl,
    cancel_redirect_url: config.cancelRedirectUrl,
  };

  const response = await fetch(`${config.apiBaseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    id?: string;
    order_code?: string;
    amount?: number;
    qr_code?: string;
    checkout_url?: string;
    status?: string;
    message?: string;
  };

  if (!response.ok || !data.id || !data.order_code || typeof data.amount !== "number") {
    throw new Error(data.message ?? "Failed to create SePay order.");
  }

  return {
    id: data.id,
    orderCode: data.order_code,
    amount: data.amount,
    qrCode: data.qr_code,
    checkoutUrl: data.checkout_url,
    status: data.status,
  };
}
