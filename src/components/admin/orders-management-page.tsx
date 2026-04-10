"use client";

/* eslint-disable @next/next/no-img-element */

import { Download, RefreshCcw, Save } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext } from "./admin-context";
import { AdminPageSection, AdminStat, OrderStatusBadge, PaymentStatusBadge } from "./admin-shell";
import styles from "./admin.module.css";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  cx,
  formatDate,
  money,
  orderStatusLabel,
  paymentStatusLabel,
} from "./admin-utils";
import type { AdminOrder, OrderDraft, OrderStatus, PaymentStatus } from "./admin-types";


function createDraft(order: AdminOrder): OrderDraft {
  return {
    status: order.status,
    paymentStatus: order.payment?.status ?? "unpaid",
    paidAmount: order.payment?.paidAmount ?? 0,
  };
}

export default function OrdersManagementPage() {
  const { adminKey, hasAdminKey, notify, req } = useAdminContext();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [drafts, setDrafts] = useState<Record<string, OrderDraft>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!hasAdminKey) {
      return;
    }

    setLoading(true);
    try {
      const response = await req<{ orders: AdminOrder[] }>("/api/admin/orders");
      setOrders(response.orders);
      setDrafts(
        response.orders.reduce<Record<string, OrderDraft>>((accumulator, order) => {
          accumulator[order.id] = createDraft(order);
          return accumulator;
        }, {}),
      );
      setSelectedId((current) => current ?? response.orders[0]?.id ?? null);
      notify("success", `Loaded ${response.orders.length} orders.`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, [hasAdminKey, notify, req]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const haystack = [
        order.orderCode,
        order.customer.name,
        order.customer.instagram,
        order.customer.phoneNumber,
        order.customer.phoneModel,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = haystack.includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || (order.payment?.status ?? "unpaid") === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, paymentFilter, search, statusFilter]);

  useEffect(() => {
    if (!filteredOrders.length) {
      setSelectedId(null);
      return;
    }

    if (!filteredOrders.some((order) => order.id === selectedId)) {
      setSelectedId(filteredOrders[0]?.id ?? null);
    }
  }, [filteredOrders, selectedId]);

  const selectedOrder = filteredOrders.find((order) => order.id === selectedId) ?? null;
  const selectedDraft = selectedOrder ? drafts[selectedOrder.id] ?? createDraft(selectedOrder) : null;

  const metrics = useMemo(() => {
    const openOrders = orders.filter((order) => order.status === "pending" || order.status === "in_progress").length;
    const bookedRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const paidRevenue = orders.reduce((sum, order) => sum + (order.payment?.paidAmount ?? 0), 0);
    const outstanding = Math.max(0, bookedRevenue - paidRevenue);

    return {
      openOrders,
      bookedRevenue,
      paidRevenue,
      outstanding,
    };
  }, [orders]);

  const patchDraft = (orderId: string, patch: Partial<OrderDraft>) => {
    setDrafts((current) => {
      const baseOrder = orders.find((item) => item.id === orderId);
      if (!baseOrder) {
        return current;
      }

      return {
        ...current,
        [orderId]: {
          ...(current[orderId] ?? createDraft(baseOrder)),
          ...patch,
        },
      };
    });
  };

  const saveOrder = async (orderId: string) => {
    const draft = drafts[orderId];
    if (!draft) {
      return;
    }

    setSavingId(orderId);
    try {
      await req(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      notify("success", "Order updated.");
      await loadOrders();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to update order.");
    } finally {
      setSavingId(null);
    }
  };

  const exportOrders = async () => {
    if (!hasAdminKey) {
      notify("error", "Enter ADMIN_API_KEY first.");
      return;
    }

    try {
      const response = await fetch("/api/admin/orders/export", {
        headers: {
          "x-admin-key": adminKey,
        },
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to export orders.");
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `kinef-orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      notify("success", "Order export downloaded.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to export orders.");
    }
  };

  return (
    <>
      <AdminPageSection
        eyebrow="Commerce"
        title="Order management"
        actions={
          <div className={styles.inlineActions}>
            <button className={styles.secondaryAction} onClick={() => void loadOrders()} disabled={!hasAdminKey || loading}>
              <RefreshCcw size={15} />
              <span>{loading ? "Refreshing" : "Refresh"}</span>
            </button>
            <button className={styles.primaryAction} onClick={() => void exportOrders()} disabled={!hasAdminKey}>
              <Download size={15} />
              <span>Export orders</span>
            </button>
          </div>
        }
      />

      <section className={styles.statGrid}>
        <AdminStat label="Orders" value={String(orders.length)} hint="All orders currently stored in MongoDB" />
        <AdminStat label="Open workflow" value={String(metrics.openOrders)} hint="Pending and in-progress orders combined" />
        <AdminStat label="Booked revenue" value={money(metrics.bookedRevenue)} hint={`${money(metrics.paidRevenue)} already recorded as paid`} />
        <AdminStat label="Outstanding" value={money(metrics.outstanding)} hint="Total remaining balance across all orders" />
      </section>

      <section className={styles.managementGridWide}>
        <article className={styles.surfacePanel}>
          <div className={styles.panelToolbarStack}>
            <input
              className={styles.searchInput}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order code, customer, or phone model"
            />
            <div className={styles.filterCluster}>
              <div className={styles.filterRow}>
                {(["all", ...ORDER_STATUSES] as Array<OrderStatus | "all">).map((value) => (
                  <button
                    key={value}

                    className={cx(styles.filterChip, statusFilter === value && styles.filterChipActive)}
                    onClick={() => setStatusFilter(value)}
                  >
                    {value === "all" ? "all status" : orderStatusLabel(value)}
                  </button>
                ))}
              </div>
              <div className={styles.filterRow}>
                {(["all", ...PAYMENT_STATUSES] as Array<PaymentStatus | "all">).map((value) => (
                  <button
                    key={value}

                    className={cx(styles.filterChip, paymentFilter === value && styles.filterChipActive)}
                    onClick={() => setPaymentFilter(value)}
                  >
                    {value === "all" ? "all payment" : paymentStatusLabel(value)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Model</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={cx(styles.clickableRow, selectedId === order.id && styles.clickableRowActive)}
                      onClick={() => setSelectedId(order.id)}
                    >
                      <td>
                        <div className={styles.tablePrimary}>{order.orderCode}</div>
                        <div className={styles.tableSecondary}>{order.caseItem ?? "Case snapshot missing"}</div>
                      </td>
                      <td>
                        <div className={styles.tablePrimary}>{order.customer.name}</div>
                        <div className={styles.tableSecondary}>{order.customer.instagram}</div>
                      </td>
                      <td>{order.customer.phoneModel}</td>
                      <td>{money(order.total)}</td>
                      <td>
                        <OrderStatusBadge value={order.status} />
                      </td>
                      <td>
                        <PaymentStatusBadge value={order.payment?.status ?? "unpaid"} />
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      Empty
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <aside className={styles.surfacePanelSticky}>
          {selectedOrder && selectedDraft ? (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelEyebrow}>Inspector</div>
                  <h3 className={styles.panelTitle}>{selectedOrder.orderCode}</h3>
                </div>
                <div className={styles.badgeRow}>
                  <OrderStatusBadge value={selectedOrder.status} />
                  <PaymentStatusBadge value={selectedOrder.payment?.status ?? "unpaid"} />
                </div>
              </div>

              <div className={styles.inspectorBlock}>
                <div className={styles.inspectorTitle}>Customer</div>
                <div className={styles.detailGrid}>
                  <div>
                    <span>Name</span>
                    <strong>{selectedOrder.customer.name}</strong>
                  </div>
                  <div>
                    <span>Instagram</span>
                    <strong>{selectedOrder.customer.instagram}</strong>
                  </div>
                  <div>
                    <span>Phone</span>
                    <strong>{selectedOrder.customer.phoneNumber}</strong>
                  </div>
                  <div>
                    <span>Model</span>
                    <strong>{selectedOrder.customer.phoneModel}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.inspectorBlock}>
                <div className={styles.inspectorTitle}>Order composition</div>
                <div className={styles.summaryList}>
                  <div className={styles.summaryRow}>
                    <span>Case</span>
                    <strong>{selectedOrder.caseItem ?? "Unknown"}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Case total</span>
                    <strong>{money(selectedOrder.caseTotal)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Charm total</span>
                    <strong>{money(selectedOrder.charmTotal)}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Grand total</span>
                    <strong>{money(selectedOrder.total)}</strong>
                  </div>
                </div>

                <div className={styles.charmList}>
                  {selectedOrder.charms.length ? (
                    selectedOrder.charms.map((item) => (
                      <div key={`${selectedOrder.id}-${item.id}`} className={styles.simpleRow}>
                        <div>
                          <div className={styles.simpleTitle}>
                            {item.icon} {item.name}
                          </div>
                          <div className={styles.simpleMeta}>{money(item.finalPrice)} final price</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyState}>No charms attached to this order.</div>
                  )}
                </div>
              </div>

              <div className={styles.inspectorBlock}>
                <div className={styles.inspectorTitle}>Update status</div>
                <label className={styles.field}>
                  <span>Fulfillment</span>
                  <select
                    value={selectedDraft.status}
                    onChange={(event) => patchDraft(selectedOrder.id, { status: event.target.value as OrderStatus })}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Payment</span>
                  <select
                    value={selectedDraft.paymentStatus}
                    onChange={(event) => patchDraft(selectedOrder.id, { paymentStatus: event.target.value as PaymentStatus })}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {paymentStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Paid amount</span>
                  <input
                    type="number"
                    min={0}
                    value={selectedDraft.paidAmount}
                    onChange={(event) => patchDraft(selectedOrder.id, { paidAmount: Number(event.target.value) })}
                  />
                </label>

                <button

                  className={styles.primaryAction}
                  onClick={() => void saveOrder(selectedOrder.id)}
                  disabled={savingId === selectedOrder.id || !hasAdminKey}
                >
                  <Save size={15} />
                  <span>{savingId === selectedOrder.id ? "Saving" : "Save order"}</span>
                </button>
              </div>

              <div className={styles.inspectorBlock}>
                <div className={styles.inspectorTitle}>Notes</div>
                <p className={styles.noteBody}>{selectedOrder.notes?.trim() || "No customer note attached to this order."}</p>
                {selectedOrder.referenceImageUrl ? (
                  <img src={selectedOrder.referenceImageUrl} alt={`${selectedOrder.orderCode} reference`} className={styles.referenceImage} />
                ) : null}
              </div>
            </>
          ) : (
            <div className={styles.emptyStateLarge}>Select an order from the table to inspect and update it.</div>
          )}
        </aside>
      </section>
    </>
  );
}




