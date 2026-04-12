"use client";

import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminContext } from "./admin-context";
import { AdminPageSection, AdminStat, OrderStatusBadge, PaymentStatusBadge, ToneBadge } from "./admin-shell";
import styles from "./admin.module.css";
import { formatDate, money } from "./admin-utils";
import type { AdminCase, AdminCharm, AdminOrder } from "./admin-types";


type RevenueBucket = { label: string; total: number };

function monthBuckets(orders: AdminOrder[]) {
  const formatter = new Intl.DateTimeFormat("en", { month: "short" });
  const buckets = new Map<string, number>();

  for (const order of orders) {
    if (!order.createdAt) {
      continue;
    }

    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, (buckets.get(key) ?? 0) + order.total);
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => (left > right ? 1 : -1))
    .slice(-5)
    .map(([key, total]) => {
      const [year, month] = key.split("-");
      const label = `${formatter.format(new Date(Number(year), Number(month), 1))} ${year.slice(2)}`;
      return { label, total } satisfies RevenueBucket;
    });
}

export default function AdminOverviewPage() {
  const { hasAdminKey, notify, req } = useAdminContext();
  const [cases, setCases] = useState<AdminCase[]>([]);
  const [charms, setCharms] = useState<AdminCharm[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasAdminKey) {
      return;
    }

    setLoading(true);
    try {
      const [caseResponse, charmResponse, orderResponse] = await Promise.all([
        req<{ items: AdminCase[] }>("/api/admin/cases"),
        req<{ items: AdminCharm[] }>("/api/admin/charms"),
        req<{ orders: AdminOrder[] }>("/api/admin/orders"),
      ]);

      setCases(caseResponse.items);
      setCharms(charmResponse.items);
      setOrders(orderResponse.orders);
      notify("success", "Workspace refreshed from the live admin APIs.");
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Failed to refresh workspace.");
    } finally {
      setLoading(false);
    }
  }, [hasAdminKey, notify, req]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const metrics = useMemo(() => {
    const activeCatalog = cases.filter((item) => item.isActive).length + charms.filter((item) => item.isActive).length;
    const pendingOrders = orders.filter((item) => item.status === "pending" || item.status === "in_progress").length;
    const totalRevenue = orders.reduce((sum, item) => sum + item.total, 0);
    const paidRevenue = orders.reduce((sum, item) => sum + (item.payment?.paidAmount ?? 0), 0);
    const lowStock = charms.filter((item) => item.isActive && item.stock < 5).length;

    return {
      activeCatalog,
      pendingOrders,
      totalRevenue,
      paidRevenue,
      lowStock,
    };
  }, [cases, charms, orders]);

  const revenue = useMemo(() => monthBuckets(orders), [orders]);

  const orderBreakdown = useMemo(() => {
    const entries: Array<{ label: string; count: number; tone: "warning" | "info" | "success" | "danger" }> = [
      { label: "Pending", count: 0, tone: "warning" },
      { label: "Confirmed", count: 0, tone: "info" },
      { label: "In progress", count: 0, tone: "info" },
      { label: "Completed", count: 0, tone: "success" },
      { label: "Cancelled", count: 0, tone: "danger" },
    ];

    for (const order of orders) {
      if (order.status === "pending") entries[0].count += 1;
      if (order.status === "confirmed") entries[1].count += 1;
      if (order.status === "in_progress") entries[2].count += 1;
      if (order.status === "completed") entries[3].count += 1;
      if (order.status === "cancelled") entries[4].count += 1;
    }

    return entries;
  }, [orders]);

  const popularCases = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();

    for (const order of orders) {
      const name = order.caseItem;
      if (!name) {
        continue;
      }

      const current = counts.get(name);
      counts.set(name, { name, count: (current?.count ?? 0) + 1 });
    }

    return Array.from(counts.values())
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [orders]);

  const recentOrders = orders.slice(0, 6);
  const lowStockCharms = charms.filter((item) => item.stock < 5).slice(0, 5);

  return (
    <>
      <AdminPageSection
        eyebrow="Command center"
        title="Store health at a glance"
        actions={
          <button className={styles.secondaryAction} onClick={() => void refresh()} disabled={!hasAdminKey || loading}>
            <RefreshCcw size={15} />
            <span>{loading ? "Refreshing" : "Refresh"}</span>
          </button>
        }
      />

      <section className={styles.statGrid}>
        <AdminStat
          label="Active catalog"
          value={String(metrics.activeCatalog)}
        />
        <AdminStat
          label="Orders in motion"
          value={String(metrics.pendingOrders)}
        />
        <AdminStat
          label="Booked revenue"
          value={money(metrics.totalRevenue)}
        />
        <AdminStat
          label="Low stock charms"
          value={String(metrics.lowStock)}
        />
      </section>

      <section className={styles.dashboardGrid}>
        <article className={styles.surfacePanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelEyebrow}>Revenue pulse</div>
              <h3 className={styles.panelTitle}>Monthly order volume</h3>
            </div>
            <ToneBadge label={`${orders.length} orders`} tone="info" />
          </div>

          <div className={styles.barChart}>
            {revenue.length ? (
              revenue.map((bucket) => {
                const highest = Math.max(...revenue.map((item) => item.total), 1);
                const height = `${Math.max(18, (bucket.total / highest) * 100)}%`;

                return (
                  <div key={bucket.label} className={styles.barColumn}>
                    <div className={styles.barValue}>{money(bucket.total)}</div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ height }} />
                    </div>
                    <div className={styles.barLabel}>{bucket.label}</div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>Orders with valid dates will appear here as soon as they are loaded.</div>
            )}
          </div>
        </article>

        <article className={styles.surfacePanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelEyebrow}>Fulfillment mix</div>
              <h3 className={styles.panelTitle}>Order status breakdown</h3>
            </div>
          </div>

          <div className={styles.breakdownList}>
            {orderBreakdown.map((item) => (
              <div key={item.label} className={styles.breakdownRow}>
                <div>
                  <div className={styles.breakdownLabel}>{item.label}</div>
                  <div className={styles.breakdownHint}>Current queue count</div>
                </div>
                <ToneBadge label={`${item.count} orders`} tone={item.tone} />
              </div>
            ))}
          </div>
        </article>

        <article className={styles.surfacePanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelEyebrow}>Recent activity</div>
              <h3 className={styles.panelTitle}>Latest orders</h3>
            </div>
          </div>

          <div className={styles.activityList}>
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div key={order.id} className={styles.activityRow}>
                  <div>
                    <div className={styles.activityTitle}>{order.orderCode}</div>
                    <div className={styles.activityMeta}>
                      {order.customer.name} · {order.customer.phoneModel} · {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className={styles.activityBadges}>
                    <OrderStatusBadge value={order.status} />
                    <PaymentStatusBadge value={order.payment?.status ?? "unpaid"} />
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Recent orders appear here after the first successful refresh.</div>
            )}
          </div>
        </article>

        <article className={styles.surfacePanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelEyebrow}>Catalog pressure</div>
              <h3 className={styles.panelTitle}>Low stock watchlist</h3>
            </div>
          </div>

          <div className={styles.listStack}>
            {lowStockCharms.length ? (
              lowStockCharms.map((item) => (
                <div key={item.id} className={styles.simpleRow}>
                  <div>
                    <div className={styles.simpleTitle}>{item.name}</div>
                    <div className={styles.simpleMeta}>{money(item.price)} base price</div>
                  </div>
                  <ToneBadge label={`${item.stock} left`} tone={item.stock === 0 ? "danger" : "warning"} />
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No low stock items right now.</div>
            )}
          </div>
        </article>

        <article className={styles.surfacePanelWide}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelEyebrow}>Best sellers</div>
              <h3 className={styles.panelTitle}>Cases customers select most often</h3>
            </div>
          </div>

          <div className={styles.featureGrid}>
            {popularCases.length ? (
              popularCases.map((item, index) => (
                <div key={item.name} className={styles.featureCard}>
                  <span className={styles.featureIndex}>0{index + 1}</span>
                  <div className={styles.featureTitle}>{item.name}</div>
                  <div className={styles.featureMeta}>{item.count} orders include this case configuration</div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>Case popularity will appear once orders have been created.</div>
            )}
          </div>
        </article>
      </section>
    </>
  );
}


