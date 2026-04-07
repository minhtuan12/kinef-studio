"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Feedback, FeedbackSeverity } from "./admin-types";
import { message } from "antd";

type AdminContextValue = {
  adminKey: string;
  hasAdminKey: boolean;
  isAuthenticating: boolean;
  feedback: Feedback;
  notify: (severity: FeedbackSeverity, message: string) => void;
  clearFeedback: () => void;
  login: (value: string) => Promise<void>;
  logout: (message?: string) => void;
  req: <T>(url: string, init?: RequestInit) => Promise<T>;
  upload: (file: File, folder: string) => Promise<string>;
  messageApi: ReturnType<typeof message.useMessage>[0];
};

const AdminContext = createContext<AdminContextValue | null>(null);
const STORAGE_KEY = "kinef_admin_key_session";

const INITIAL_FEEDBACK: Feedback = {
  severity: "info",
  message: "Sign in with ADMIN_API_KEY to access the admin workspace.",
};

function getStoredAdminKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
}

function getInitialFeedback(storedKey: string): Feedback {
  if (!storedKey) {
    return INITIAL_FEEDBACK;
  }

  return {
    severity: "success",
    message: "Admin session restored for this browser tab.",
  };
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminKey, setAdminKeyState] = useState(() => getStoredAdminKey());
  const [feedback, setFeedback] = useState<Feedback>(() => getInitialFeedback(getStoredAdminKey()));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const notify = useCallback((severity: FeedbackSeverity, message: string) => {
    setFeedback({ severity, message });
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(INITIAL_FEEDBACK);
  }, []);

  const logout = useCallback((message?: string) => {
    setAdminKeyState("");
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    setFeedback({
      severity: "info",
      message: message ?? "Admin session cleared. Sign in again to continue.",
    });
  }, []);

  const login = useCallback(async (value: string) => {
    const key = value.trim();
    if (!key) {
      throw new Error("Enter ADMIN_API_KEY.");
    }

    setIsAuthenticating(true);
    try {
      const response = await fetch("/api/admin/cases", {
        headers: {
          "x-admin-key": key,
        },
        cache: "no-store",
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? ((await response.json()) as Record<string, unknown>) : {};

      if (!response.ok) {
        throw new Error((payload.message as string) ?? "Invalid ADMIN_API_KEY.");
      }

      setAdminKeyState(key);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEY, key);
      }
      setFeedback({
        severity: "success",
        message: "Admin session started for this browser tab.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const req = useCallback(
    async <T,>(url: string, init?: RequestInit): Promise<T> => {
      if (!adminKey.trim()) {
        throw new Error("Sign in with ADMIN_API_KEY first.");
      }

      const headers = new Headers(init?.headers);
      headers.set("x-admin-key", adminKey.trim());

      if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      const response = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
      });

      const isJson = response.headers.get("content-type")?.includes("application/json");
      const payload = isJson ? ((await response.json()) as Record<string, unknown>) : {};

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout("Admin session expired. Sign in again.");
        }
        throw new Error((payload.message as string) ?? `Request failed (${response.status})`);
      }

      return payload as T;
    },
    [adminKey, logout],
  );

  const upload = useCallback(async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as { message?: string; url?: string };
    if (!response.ok || !payload.url) {
      throw new Error(payload.message ?? "Upload failed.");
    }

    return payload.url;
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({
      adminKey,
      hasAdminKey: Boolean(adminKey.trim()),
      isAuthenticating,
      feedback,
      contextHolder,
      notify,
      clearFeedback,
      login,
      logout,
      req,
      upload,
      messageApi,
    }),
    [adminKey, clearFeedback, feedback, isAuthenticating, login, logout, notify, req, upload, contextHolder, messageApi],
  );

  return <AdminContext.Provider value={value}>
    {contextHolder}
    {children}
  </AdminContext.Provider>;
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used inside AdminProvider.");
  }

  return context;
}
