/* eslint-disable @next/next/no-img-element */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  calculateDiscountedPrice,
  DEFAULT_CASES,
  DEFAULT_CHARMS,
  type CaseProduct,
  type CharmProduct,
} from "@/lib/constants";


type PageView = "home" | "custom" | "confirm";

type PaymentOption = {
  type: "deposit" | "full";
  amount: number;
  sepayOrderId?: string;
  sepayOrderCode?: string;
  qrCode?: string | null;
  checkoutUrl?: string | null;
  status?: string | null;
};

type OrderForm = {
  name: string;
  instagram: string;
  phoneNumber: string;
  phoneModel: string;
  notes: string;
};

const initialOrderForm: OrderForm = {
  name: "",
  instagram: "",
  phoneNumber: "",
  phoneModel: "",
  notes: "",
};

const currencyFormatter = new Intl.NumberFormat("vi-VN");

function formatVnd(amount: number) {
  return `${currencyFormatter.format(amount)}d`;
}

export default function Home() {
  const [pageView, setPageView] = useState<PageView>("home");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [cases, setCases] = useState<CaseProduct[]>(DEFAULT_CASES);
  const [charms, setCharms] = useState<CharmProduct[]>(DEFAULT_CHARMS);
  const [selectedCase, setSelectedCase] = useState<CaseProduct | null>(null);
  const [selectedCharms, setSelectedCharms] = useState<CharmProduct[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>(initialOrderForm);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [orderCode, setOrderCode] = useState<string>("-");
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState<boolean>(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [caseResponse, charmResponse] = await Promise.all([
          fetch("/api/cases", { cache: "no-store" }),
          fetch("/api/charms", { cache: "no-store" }),
        ]);

        if (!caseResponse.ok || !charmResponse.ok) {
          throw new Error("Unable to load catalog.");
        }

        const caseData = (await caseResponse.json()) as { cases?: CaseProduct[] };
        const charmData = (await charmResponse.json()) as { charms?: CharmProduct[] };

        if (Array.isArray(caseData.cases) && caseData.cases.length > 0) {
          setCases(caseData.cases);
        } else {
          setCases(DEFAULT_CASES);
        }

        if (Array.isArray(charmData.charms) && charmData.charms.length > 0) {
          setCharms(charmData.charms);
        } else {
          setCharms(DEFAULT_CHARMS);
        }

        setDataLoadError(null);
      } catch {
        setCases(DEFAULT_CASES);
        setCharms(DEFAULT_CHARMS);
        setDataLoadError(
          "Using local catalog data right now. Backend catalog APIs are unavailable.",
        );
      }
    };

    void loadCatalog();
  }, []);

  useEffect(() => {
    const loadPaymentOptions = async () => {
      if (pageView !== "confirm" || orderCode === "-") {
        return;
      }

      try {
        setIsLoadingPayment(true);
        setPaymentMessage(null);

        const response = await fetch(`/api/orders/${orderCode}/payment-options`, {
          cache: "no-store",
        });

        const data = (await response.json()) as {
          message?: string;
          options?: PaymentOption[];
          total?: number;
        };

        if (!response.ok && response.status !== 501) {
          throw new Error(data.message ?? "Unable to load payment options.");
        }

        if (Array.isArray(data.options)) {
          setPaymentOptions(data.options);
        } else {
          setPaymentOptions([]);
        }

        if (typeof data.total === "number") {
          setOrderTotal(data.total);
        }

        setPaymentMessage(data.message ?? null);
      } catch (error) {
        setPaymentOptions([]);
        const message =
          error instanceof Error ? error.message : "Unable to load payment options.";
        setPaymentMessage(message);
      } finally {
        setIsLoadingPayment(false);
      }
    };

    void loadPaymentOptions();
  }, [pageView, orderCode]);

  const casePrice = useMemo(() => {
    if (!selectedCase) {
      return 0;
    }

    return calculateDiscountedPrice(selectedCase.price, selectedCase.discountPercent);
  }, [selectedCase]);

  const charmTotal = useMemo(
    () =>
      selectedCharms.reduce(
        (sum, charm) =>
          sum + calculateDiscountedPrice(charm.price, charm.discountPercent),
        0,
      ),
    [selectedCharms],
  );

  const totalPrice = casePrice + charmTotal;

  const navigatePage = (nextPage: PageView) => {
    setPageView(nextPage);
    if (nextPage === "custom") {
      setCurrentStep(1);
    }
  };

  const goStep = (step: 1 | 2 | 3) => {
    if (step >= 2 && !selectedCase) {
      return;
    }
    if (step >= 3 && selectedCharms.length === 0) {
      return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCharm = (charm: CharmProduct) => {
    if (charm.stock === 0) {
      return;
    }

    setSelectedCharms((prev) => {
      const exists = prev.find((selected) => selected.id === charm.id);
      if (exists) {
        return prev.filter((selected) => selected.id !== charm.id);
      }
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, charm];
    });
  };

  const removeCharm = (charmId: string) => {
    setSelectedCharms((prev) => prev.filter((charm) => charm.id !== charmId));
  };

  const handleInputChange = (key: keyof OrderForm, value: string) => {
    setOrderForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetBuilder = () => {
    setSelectedCase(null);
    setSelectedCharms([]);
    setOrderForm(initialOrderForm);
    setReferenceFile(null);
    setCurrentStep(1);
  };

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCase) {
      alert("Please select your case first.");
      return;
    }
    if (selectedCharms.length === 0) {
      alert("Please select at least one charm.");
      return;
    }

    const requiredFields: Array<keyof OrderForm> = [
      "name",
      "instagram",
      "phoneNumber",
      "phoneModel",
    ];
    const hasMissingRequired = requiredFields.some(
      (field) => orderForm[field].trim().length === 0,
    );

    if (hasMissingRequired) {
      alert("Please complete all required order details.");
      return;
    }

    setIsSubmitting(true);
    try {
      let referenceImageUrl: string | undefined;

      if (referenceFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", referenceFile);
        uploadFormData.append("folder", "kinef/custom-orders");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadData = (await uploadResponse.json()) as {
          message?: string;
          url?: string;
        };

        if (!uploadResponse.ok || !uploadData.url) {
          throw new Error(uploadData.message ?? "Failed to upload image.");
        }
        referenceImageUrl = uploadData.url;
      }

      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          charmIds: selectedCharms.map((charm) => charm.id),
          customer: {
            name: orderForm.name.trim(),
            instagram: orderForm.instagram.trim(),
            phoneNumber: orderForm.phoneNumber.trim(),
            phoneModel: orderForm.phoneModel.trim(),
          },
          notes: orderForm.notes.trim(),
          referenceImageUrl,
        }),
      });

      const orderData = (await orderResponse.json()) as {
        message?: string;
        orderCode?: string;
        total?: number;
      };

      if (!orderResponse.ok || !orderData.orderCode) {
        throw new Error(orderData.message ?? "Unable to place order.");
      }

      setOrderCode(orderData.orderCode);
      setOrderTotal(typeof orderData.total === "number" ? orderData.total : totalPrice);
      setPaymentOptions([]);
      setPaymentMessage(null);
      setCartCount((prev) => prev + 1);
      setPageView("confirm");
      resetBuilder();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to place order.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cartLabel = `cart(${cartCount})`;

  if (pageView === "confirm") {
    return (
      <main>
        <nav className="site-nav">
          <div className="nav-left" />
          <button className="brand" onClick={() => navigatePage("home")}>
            Kinef
          </button>
          <div className="nav-right">
            <span className="cart-btn">{cartLabel}</span>
          </div>
        </nav>

        <section className="confirm-page">
          <h1 className="conf-brand">Kinef</h1>
          <div className="conf-eyebrow">Order received</div>
          <div className="conf-divider" />
          <p className="conf-intro">Your case is in the queue.</p>
          <div className="code-block">
            <div className="code-label">Your order code</div>
            <div className="code-val">{orderCode}</div>
          </div>

          <div className="pay-head">Pay via SePay</div>
          <p className="pay-note">
            Transfer content must include <strong>{orderCode}</strong>. Choose 50%
            deposit or 100% full payment.
          </p>

          {isLoadingPayment ? <p className="pay-note">Loading payment options...</p> : null}
          {paymentMessage ? <p className="pay-note">{paymentMessage}</p> : null}

          <div className="pay-grid">
            {paymentOptions.map((option) => (
              <article className="pay-card" key={option.type}>
                <div className="pay-type">
                  {option.type === "deposit" ? "Deposit 50%" : "Pay 100%"}
                </div>
                <div className="pay-amount">{formatVnd(option.amount)}</div>
                <div className="pay-content">Content: {orderCode}</div>

                {option.qrCode ? (
                  <img className="pay-qr" src={option.qrCode} alt={`${option.type} QR`} />
                ) : null}

                {option.checkoutUrl ? (
                  <button
                    className="btn-next primary"
                    onClick={() => window.open(option.checkoutUrl ?? "", "_blank")}
                  >
                    Pay with SePay
                  </button>
                ) : null}
              </article>
            ))}
          </div>

          <p className="conf-note">
            Total order value: {formatVnd(orderTotal)}. Send your order code to{" "}
            <a
              className="conf-ig"
              href="https://instagram.com/kinef.studio"
              target="_blank"
              rel="noreferrer"
            >
              @kinef.studio
            </a>{" "}
            for confirmation and mockup approval.
          </p>
          <button
            className="btn-oval"
            onClick={() => window.open("https://instagram.com/kinef.studio")}
          >
            DM on Instagram
          </button>
        </section>
      </main>
    );
  }

  if (pageView === "custom") {
    return (
      <main>
        <nav className="site-nav">
          <div className="nav-left">
            <button className="nav-link active-link">Shop</button>
            <button className="nav-link">About</button>
            <button className="nav-link">Contact</button>
          </div>
          <button className="brand" onClick={() => navigatePage("home")}>
            Kinef
          </button>
          <div className="nav-right">
            <span className="cart-btn">{cartLabel}</span>
          </div>
        </nav>

        <section className="custom-page">
          <div className="custom-hero">
            <div className="custom-title">Custom your lovely phonecase</div>
            <h1 className="custom-heading">Build something one-of-a-kind</h1>
          </div>

          {dataLoadError ? <div className="api-note">{dataLoadError}</div> : null}

          <div className="step-bar">
            <button
              className={`sb-item ${currentStep === 1 ? "active" : ""}`}
              onClick={() => goStep(1)}
            >
              <div className="sb-circle">1</div>
              <div className="sb-label">Case</div>
            </button>
            <div className="sb-line" />
            <button
              className={`sb-item ${currentStep > 2 ? "done" : ""} ${currentStep === 2 ? "active" : ""
                }`}
              onClick={() => goStep(2)}
            >
              <div className="sb-circle">2</div>
              <div className="sb-label">Charms</div>
            </button>
            <div className="sb-line" />
            <button
              className={`sb-item ${currentStep === 3 ? "active" : ""}`}
              onClick={() => goStep(3)}
            >
              <div className="sb-circle">3</div>
              <div className="sb-label">Order</div>
            </button>
          </div>

          {currentStep === 1 ? (
            <section className="step-panel">
              <p className="step-intro">
                Choose your case base first. Price can vary by case and discount.
              </p>
              <div className="color-grid">
                {cases.map((item) => {
                  const isSelected = selectedCase?.id === item.id;
                  const finalPrice = calculateDiscountedPrice(
                    item.price,
                    item.discountPercent,
                  );

                  return (
                    <button
                      key={item.id}
                      className={`color-card ${isSelected ? "sel" : ""}`}
                      onClick={() => setSelectedCase(item)}
                    >
                      {item.imageUrl ? (
                        <img className="cc-image" src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div
                          className={`cc-swatch ${item.swatchClassName ?? ""}`}
                          style={
                            item.swatchClassName
                              ? undefined
                              : { background: item.colorHex }
                          }
                        />
                      )}
                      <div className="cc-check" />
                      <div className="cc-label">
                        <div className="cc-name">{item.name}</div>
                        <div className="cc-desc">{item.description}</div>
                        <div className="cc-desc">{formatVnd(finalPrice)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => navigatePage("home")}>
                  Back to home
                </button>
                <span className="step-hint">Step 1 of 3</span>
                <button
                  className="btn-next"
                  disabled={!selectedCase}
                  onClick={() => goStep(2)}
                >
                  Continue
                </button>
              </div>
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section className="step-panel">
              <div className="charm-meta">
                <div className="charm-heading">Select your charms</div>
                <div className="charm-count">{selectedCharms.length} / 6 selected</div>
              </div>

              <p className="charm-hint">
                Each charm is one-of-a-kind. Once claimed, it is gone.
              </p>

              <div className="charm-grid">
                {charms.map((charm) => {
                  const soldOut = charm.stock === 0 || !charm.isActive;
                  const isSelected = selectedCharms.some(
                    (selected) => selected.id === charm.id,
                  );

                  return (
                    <button
                      key={charm.id}
                      className={`charm-cell ${soldOut ? "is-sold" : ""} ${isSelected ? "is-sel" : ""
                        }`}
                      onClick={() => toggleCharm(charm)}
                      disabled={soldOut}
                    >
                      {soldOut ? <span className="ch-sold">Sold out</span> : null}
                      <span className="ch-dot" />
                      {charm.imageUrl ? (
                        <img className="ch-image" src={charm.imageUrl} alt={charm.name} />
                      ) : (
                        <span className="ch-icon">{charm.icon}</span>
                      )}
                      <div className="ch-name">{charm.name}</div>
                      <div className="ch-price">
                        {formatVnd(
                          calculateDiscountedPrice(charm.price, charm.discountPercent),
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="tray">
                <span className="tray-lbl">Selected -</span>
                {selectedCharms.length === 0 ? (
                  <span className="tray-empty">nothing yet</span>
                ) : (
                  selectedCharms.map((charm) => (
                    <div key={charm.id} className="chip">
                      {charm.icon} {charm.name}
                      <button className="chip-x" onClick={() => removeCharm(charm.id)}>
                        x
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="btn-row">
                <button className="btn-back" onClick={() => goStep(1)}>
                  Back
                </button>
                <span className="step-hint">Step 2 of 3</span>
                <button
                  className="btn-next"
                  disabled={selectedCharms.length === 0}
                  onClick={() => goStep(3)}
                >
                  Continue
                </button>
              </div>
            </section>
          ) : null}

          {currentStep === 3 ? (
            <section className="step-panel">
              <div className="summary">
                <div className="sum-row">
                  <span className="sum-label">Case - {selectedCase?.name}</span>
                  <span>{formatVnd(casePrice)}</span>
                </div>
                {selectedCharms.map((charm) => (
                  <div className="sum-row" key={charm.id}>
                    <span className="sum-label">
                      {charm.icon} {charm.name}
                    </span>
                    <span>
                      {formatVnd(
                        calculateDiscountedPrice(charm.price, charm.discountPercent),
                      )}
                    </span>
                  </div>
                ))}
                <div className="sum-row">
                  <span>Total</span>
                  <span>{formatVnd(totalPrice)}</span>
                </div>
              </div>

              <div className="delivery-note">
                <div className="dn-icon">*</div>
                <div>
                  <div className="dn-title">Handmade to order</div>
                  <div className="dn-body">
                    7-14 working days. We send your mockup via Instagram before we begin.
                  </div>
                </div>
              </div>

              <form onSubmit={placeOrder}>
                <div className="form-wrap">
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="name">Name</label>
                      <input
                        id="name"
                        value={orderForm.name}
                        onChange={(event) =>
                          handleInputChange("name", event.target.value)
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="instagram">Instagram</label>
                      <input
                        id="instagram"
                        value={orderForm.instagram}
                        onChange={(event) =>
                          handleInputChange("instagram", event.target.value)
                        }
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="phoneNumber">Phone number</label>
                      <input
                        id="phoneNumber"
                        value={orderForm.phoneNumber}
                        onChange={(event) =>
                          handleInputChange("phoneNumber", event.target.value)
                        }
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="phoneModel">Phone model</label>
                      <input
                        id="phoneModel"
                        value={orderForm.phoneModel}
                        onChange={(event) =>
                          handleInputChange("phoneModel", event.target.value)
                        }
                        placeholder="e.g. iPhone 15 Pro Max"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field full">
                      <label htmlFor="referenceFile">Reference photo (optional)</label>
                      <input
                        id="referenceFile"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setReferenceFile(file);
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field full">
                      <label htmlFor="notes">Notes</label>
                      <textarea
                        id="notes"
                        value={orderForm.notes}
                        onChange={(event) =>
                          handleInputChange("notes", event.target.value)
                        }
                        placeholder="Any special requests or charm placement ideas..."
                      />
                    </div>
                  </div>
                </div>

                <div className="btn-row">
                  <button className="btn-back" onClick={() => goStep(2)}>
                    Back
                  </button>
                  <span className="step-hint">Step 3 of 3</span>
                  <button className="btn-next primary" disabled={isSubmitting}>
                    {isSubmitting ? "Placing..." : "Place order"}
                  </button>
                </div>
              </form>
            </section>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main>
      <div className="announce">New charm collection just dropped - while stock lasts</div>

      <nav className="site-nav">
        <div className="nav-left">
          <button className="nav-link" onClick={() => navigatePage("custom")}>
            Shop
          </button>
          <button className="nav-link">About</button>
          <button className="nav-link">Contact</button>
        </div>
        <button className="brand" onClick={() => navigatePage("home")}>
          Kinef
        </button>
        <div className="nav-right">
          <span className="cart-btn">{cartLabel}</span>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-left">
          <div>
            <div className="hero-eyebrow">Handmade - Ho Chi Minh City - Est. 2025</div>
            <h1 className="hero-title">
              <em>Custom</em>
              Phone Cases
            </h1>
            <p className="hero-body">
              Each case is made entirely by hand. You choose the base, we help you
              select charms, then we send a mockup before production.
            </p>
            <button className="hero-cta" onClick={() => navigatePage("custom")}>
              Begin your case
            </button>
          </div>
          <div className="hero-note">7-14 working days - Free mockup before production</div>
        </div>
        <div className="hero-right">
          <div className="hero-img-box" />
          <div className="hero-tag">kinef.studio</div>
        </div>
      </section>

      <section className="how-section">
        <div className="section-eyebrow">The process</div>
        <h2 className="section-title">Three steps to yours</h2>
        <div className="steps-row">
          <article className="step-card">
            <div className="step-num">001</div>
            <h3 className="step-heading">Choose your case</h3>
            <p className="step-desc">Pick the base style that matches your mood.</p>
          </article>
          <article className="step-card">
            <div className="step-num">002</div>
            <h3 className="step-heading">Select your charms</h3>
            <p className="step-desc">
              Browse our curio collection. Once a charm is gone, it is gone forever.
            </p>
          </article>
          <article className="step-card">
            <div className="step-num">003</div>
            <h3 className="step-heading">Pay and we craft it</h3>
            <p className="step-desc">
              Pay 50% or 100% via SePay, then we share mockups before production.
            </p>
          </article>
        </div>
      </section>

      <section className="nav-links-section">
        <button className="nl-item" onClick={() => navigatePage("custom")}>
          <div className="nl-title">Shop</div>
          <div className="nl-sub">Custom cases</div>
        </button>
        <button className="nl-item">
          <div className="nl-title">About</div>
          <div className="nl-sub">Our story</div>
        </button>
        <button className="nl-item">
          <div className="nl-title">World</div>
          <div className="nl-sub">Inspiration</div>
        </button>
        <button className="nl-item">
          <div className="nl-title">Contact</div>
          <div className="nl-sub">Get in touch</div>
        </button>
      </section>

      <footer className="site-footer">
        <div>
          <div className="ft-head">Links</div>
          <button className="ft-link">Search</button>
          <button className="ft-link" onClick={() => navigatePage("custom")}>
            Shop
          </button>
          <button className="ft-link">Instagram</button>
        </div>
        <div>
          <div className="ft-head">Info</div>
          <button className="ft-link">Shipping</button>
          <button className="ft-link">Returns</button>
          <button className="ft-link">Terms</button>
        </div>
        <div>
          <div className="ft-head">Subscribe</div>
          <div className="ft-note">Add Kinef to your inbox</div>
          <div className="ft-sub">
            <input className="ft-input" placeholder="Enter your email" />
            <button className="ft-btn">Go</button>
          </div>
        </div>
      </footer>
    </main>
  );
}


