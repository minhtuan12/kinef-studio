import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";
import { Alert, Button, Typography } from "@mui/material";
import Link from "next/link";
import { notFound } from "next/navigation";

type PaymentState = "success" | "error";

type PageProps = {
    params: Promise<{ orderCode: string }>;
};

const stateCopy: Record<
    PaymentState,
    {
        severity: "success" | "error" | "warning";
        eyebrow: string;
        title: string;
        message: string;
    }
> = {
    success: {
        severity: "success",
        eyebrow: "Payment successful",
        title: "Order confirmed",
        message:
            "Your payment has been received successfully. We will review your request and contact you soon.",
    },
    error: {
        severity: "error",
        eyebrow: "Payment pending",
        title: "Order created, payment not completed",
        message:
            "Your order was saved, but we have not received payment yet. Please complete payment to confirm your order.",
    },
};

function resolvePaymentState(
    paymentStatus: string | null | undefined,
): PaymentState {
    return paymentStatus === "paid" || paymentStatus === "partial"
        ? "success"
        : "error";
}

export default async function ConfirmationPage({ params }: PageProps) {
    const { orderCode } = await params;

    await connectToDatabase();
    const order = await Order.findOne({ orderCode })
        .select("_id orderCode payment.status")
        .lean<{
            _id: unknown;
            orderCode: string;
            payment?: { status?: string | null };
        }>();
    if (!order) {
        notFound();
    }

    const paymentState = resolvePaymentState(order.payment?.status);
    const currentCopy = stateCopy[paymentState];

    return (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-[1280px] flex-col bg-[radial-gradient(circle_at_top,_#f8f4f0_0%,_#ffffff_48%)] px-6 py-14 text-center md:px-10 min-h-[calc(100vh-386px)]">
            <Typography
                sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    color: "#838383",
                    mb: 5,
                    fontSize: 24,
                }}
            >
                {currentCopy.eyebrow}
            </Typography>

            <section className="mx-auto w-full max-w-[760px] border border-black/20 bg-white/70 px-6 py-8 backdrop-blur-[1px] md:px-10">
                <Typography
                    sx={{
                        fontFamily: "var(--font-serif)",
                        fontSize: { xs: "34px", md: "52px" },
                        mb: 2,
                    }}
                >
                    {currentCopy.title}
                </Typography>

                <Alert
                    severity={currentCopy.severity}
                    sx={{ borderRadius: 0, textAlign: "left", mb: 3 }}
                >
                    {currentCopy.message}
                </Alert>

                <div className="border-y border-black/20 py-5">
                    <Typography
                        sx={{
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            fontSize: "11px",
                            color: "#838383",
                        }}
                    >
                        Order code
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "var(--font-serif)",
                            fontSize: { xs: "32px", md: "46px" },
                            mt: 1,
                        }}
                    >
                        {orderCode}
                    </Typography>
                </div>

                <Typography sx={{ mt: 5, color: "#5f5a57" }}>
                    DM{" "}
                    <Link
                        className="!underline"
                        href="https://instagram.com/kinef.studio"
                        target="_blank"
                        rel="noreferrer"
                    >
                        @kinef.studio
                    </Link>{" "}
                    with your order code for mockup confirmation.
                </Typography>
            </section>

            <div className="mt-8 flex justify-center gap-3">
                <a
                    href="https://instagram.com/kinef.studio"
                    target="_blank"
                    rel="noreferrer"
                >
                    <Button variant="outlined" sx={{ borderRadius: 0, px: 3 }}>
                        Contact @kinef.studio
                    </Button>
                </a>
                <Link href="/">
                    <Button variant="text">Back to home</Button>
                </Link>
            </div>
        </main>
    );
}
