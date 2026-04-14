"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Boxes,
  Home,
  Loader2,
  LogOut,
  Menu,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AdminProvider, useAdminContext } from "./admin-context";
import { cx, orderStatusLabel, orderStatusTone, paymentStatusLabel, paymentStatusTone } from "./admin-utils";
import styles from "./admin.module.css";
import type { FeedbackSeverity, OrderStatus, PaymentStatus } from "./admin-types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Catalog",
    items: [
      {
        href: "/admin/cases",
        label: "Case Management",
        icon: Boxes,
      },
      {
        href: "/admin/charms",
        label: "Charm Management",
        icon: Sparkles,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        href: "/admin/orders",
        label: "Order Management",
        icon: ShoppingCart,
      },
    ],
  },
];

const PAGE_META: Record<string, { title: string }> = {
  "/admin": { title: "Dashboard" },
  "/admin/cases": { title: "Case Management" },
  "/admin/charms": { title: "Charm Management" },
  "/admin/orders": { title: "Order Management" },
};

function AdminLoginModal() {
  const { isAuthenticating, login } = useAdminContext();
  const [candidateKey, setCandidateKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login(candidateKey);
      setCandidateKey("");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    }
  };

  return (
    <div className={styles.authOverlay}>
      <div className={styles.authModal}>
        <div className={styles.authEyebrow} style={{ textAlign: 'center' }}>Admin</div>
        <h1 className={styles.authTitle} style={{ textAlign: 'center' }}>Login Kinef Admin</h1>

        <form className={styles.authForm} onSubmit={handleSubmit}>
          <label className={styles.authField}>
            <span>PASSWORD</span>
            <input
              type="password"
              value={candidateKey}
              onChange={(event) => setCandidateKey(event.target.value)}
              placeholder="Enter password"
              autoFocus
            />
          </label>

          {error ? <div className={styles.authError}>Incorrect password</div> : null}

          <button type="submit" className={styles.primaryAction} disabled={isAuthenticating}>
            <span>{isAuthenticating ? <Loader2 className="animate-spin" /> : "Login"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasAdminKey, logout } = useAdminContext();

  const page = useMemo(
    () =>
      PAGE_META[pathname] ?? {
        title: "Admin workspace",
      },
    [pathname],
  );

  return (
    <div className={styles.appShell}>
      <aside className={cx(styles.sidebar, sidebarOpen && styles.sidebarOpen)}>
        <div className={styles.sidebarTop}>
          <div className={styles.brandTitle}>Kinef</div>
          <button
            type="button"
            className={styles.iconButtonMobile}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className={styles.navGroup}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cx(styles.navLink, isActive && styles.navLinkActive)}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={styles.navIcon}>
                      <Icon size={16} />
                    </span>
                    <span className={styles.navCopy}>
                      <strong className="!mt-2">{item.label}</strong>
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className={styles.mainColumn}>
        <header className={styles.topbar}>
          <div className={styles.topbarLead}>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setSidebarOpen((value) => !value)}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>
            <div className={styles.sidebarFooter}>
              <Link href="/" className={styles.storefrontLink}>
                <ArrowLeft size={15} />
                <span className="font-semibold">Back to storefront</span>
              </Link>
            </div>
          </div>

          <div className={styles.topbarActions}>
            {hasAdminKey ? (
              <button type="button" className={styles.secondaryAction} onClick={() => logout()}>
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : null}
          </div>
        </header>

        <main className={styles.mainContent} aria-hidden={!hasAdminKey}>
          {children}
        </main>
      </div>

      {!hasAdminKey ? <AdminLoginModal /> : null}
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminProvider>
  );
}

export function AdminPageSection({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <section className={styles.pageSection}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {actions ? <div className={styles.sectionActions}>{actions}</div> : null}
    </section>
  );
}

export function AdminStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </article>
  );
}

export function ToneBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  return (
    <span className={styles.badge} data-tone={tone}>
      {label}
    </span>
  );
}

export function OrderStatusBadge({ value }: { value: OrderStatus }) {
  return <ToneBadge label={orderStatusLabel(value)} tone={orderStatusTone(value)} />;
}

export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  return <ToneBadge label={paymentStatusLabel(value)} tone={paymentStatusTone(value)} />;
}

export function FeedbackBadge({
  severity,
  label,
}: {
  severity: FeedbackSeverity;
  label: string;
}) {
  const tone = severity === "success" ? "success" : severity === "error" ? "danger" : "info";
  return <ToneBadge label={label} tone={tone} />;
}







