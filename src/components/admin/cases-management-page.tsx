"use client";

/* eslint-disable @next/next/no-img-element */

import { Card, Checkbox, ConfigProvider, Empty, Modal, Popconfirm } from "antd";
import {
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAdminContext } from "./admin-context";
import { AdminPageSection, ToneBadge } from "./admin-shell";
import styles from "./admin.module.css";
import { INITIAL_CASE_FORM, caseFinalPrice, cx, money } from "./admin-utils";
import type { AdminCase, CaseForm } from "./admin-types";
import { Switch } from "@mui/material";

type FilterMode = "all" | "active" | "inactive" | "discounted";

function toCaseForm(item: AdminCase): CaseForm {
  return {
    name: item.name,
    description: item.description,
    price: String(item.price),
    discountPercent: String(item.discountPercent),
    colorHex: item.colorHex,
    imageUrl: item.imageUrl ?? "",
    isActive: item.isActive,
  };
}

export default function CasesManagementPage() {
  const { hasAdminKey, notify, req, upload } = useAdminContext();
  const [items, setItems] = useState<AdminCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [form, setForm] = useState<CaseForm>(INITIAL_CASE_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasColor, setHasColor] = useState(false);

  const loadCases = useCallback(async () => {
    if (!hasAdminKey) {
      return;
    }

    setLoading(true);
    try {
      const response = await req<{ items: AdminCase[] }>(
        "/api/admin/cases",
      );
      setItems(response.items);
      notify("success", `Loaded ${response.items.length} cases.`);
    } catch (error) {
      notify(
        "error",
        error instanceof Error
          ? error.message
          : "Failed to load cases.",
      );
    } finally {
      setLoading(false);
    }
  }, [hasAdminKey, notify, req]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    if (!file) {
      setPreviewImageUrl(form.imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, form.imageUrl]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_CASE_FORM);
    setFile(null);
    setEditingId(null);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
    resetForm();
    setHasColor(false);
  }, [resetForm]);

  const openCreateEditor = useCallback(() => {
    resetForm();
    setIsEditorOpen(true);
  }, [resetForm]);

  const openUpdateEditor = useCallback((item: AdminCase) => {
    setEditingId(item.id);
    setForm(toCaseForm(item));
    setFile(null);
    setIsEditorOpen(true);
    if (item.colorHex) {
      setHasColor(true);
    }
  }, []);

  const toggleCaseStatus = useCallback(
    async (item: AdminCase, checked: boolean) => {
      await req(`/api/admin/cases/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...item,
          isActive: checked,
        }),
      });
      await loadCases();
    },
    [loadCases, req],
  );

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      const matchesSearch = haystack.includes(
        search.trim().toLowerCase(),
      );
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && item.isActive) ||
        (filter === "inactive" && !item.isActive) ||
        (filter === "discounted" && item.discountPercent > 0);

      return matchesSearch && matchesFilter;
    });
  }, [filter, items, search]);

  console.log(form);

  const saveCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAdminKey) {
      notify("error", "Enter ADMIN_API_KEY first.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl || null;
      if (file) {
        imageUrl = await upload(file, "kinef/catalog/cases");
      }

      const payload = {
        ...form,
        price: Number(form.price),
        discountPercent: Number(form.discountPercent),
        imageUrl,
      };

      if (editingId) {
        await req(`/api/admin/cases/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify("success", "Case updated.");
      } else {
        await req("/api/admin/cases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("success", "Case created.");
      }

      setIsEditorOpen(false);
      resetForm();
      await loadCases();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Failed to save case.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeCase = useCallback(
    async (id: string) => {
      setSaving(true);
      try {
        await req(`/api/admin/cases/${id}`, { method: "DELETE" });
        notify("success", "Case deleted.");
        if (editingId === id) {
          setIsEditorOpen(false);
          resetForm();
        }
        await loadCases();
      } catch (error) {
        notify(
          "error",
          error instanceof Error
            ? error.message
            : "Failed to delete case.",
        );
      } finally {
        setSaving(false);
      }
    },
    [editingId, loadCases, notify, req, resetForm],
  );

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const previewFinalPrice = Math.max(
    0,
    Math.round(
      Number(form.price || 0) *
      (1 - Number(form.discountPercent || 0) / 100),
    ),
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer: "transparent",
          colorText: "#182347",
          colorTextHeading: "#182347",
          colorBorderSecondary: "rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <>
        <AdminPageSection
          eyebrow="Catalog"
          title="Quản lý Cases"
          actions={
            <div className={styles.inlineActions}>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => void loadCases()}
                disabled={!hasAdminKey || loading}
              >
                <RefreshCcw size={15} />
                <span>
                  {loading ? "Refreshing" : "Refresh"}
                </span>
              </button>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={openCreateEditor}
                disabled={!hasAdminKey}
              >
                <Plus size={15} />
                <span>Thêm mới</span>
              </button>
            </div>
          }
        />

        <section>
          <article
            className={`${styles.surfacePanel} ${styles.surfacePanelMain}`}
          >
            <div className={styles.panelToolbar}>
              <input
                className={`${styles.searchInput} lg:!w-[450px] !w-full`}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search cases by name or description"
              />
              <div className={styles.filterRow}>
                {(
                  [
                    "all",
                    "active",
                    "inactive",
                    "discounted",
                  ] as FilterMode[]
                ).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={cx(
                      styles.filterChip,
                      filter === value &&
                      styles.filterChipActive,
                    )}
                    onClick={() => setFilter(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className={styles.cardGridLoading}>
                <Loader2 className="animate-spin" size={40} />
              </div>
            ) : visibleItems.length ? (
              <div className={styles.managementCardGrid}>
                {visibleItems.map((item) => (
                  <Card
                    key={item.id}
                    className={`${styles.managementCard} ${styles.charmSpotlightCard}`}
                  >
                    <div
                      className={
                        styles.charmSpotlightMedia
                      }
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={
                            item.name ||
                            "Charm preview"
                          }
                          className={
                            styles.charmSpotlightImage
                          }
                        />
                      ) : item.colorHex ? (
                        <div
                          style={{ background: item.colorHex, height: '100%' }}
                        />
                      ) : (
                        <div
                          className={
                            styles.charmSpotlightFallback
                          }
                        >
                          <ImageIcon size={28} />
                        </div>
                      )}
                      <div
                        className={
                          styles.charmSpotlightOverlay
                        }
                      />
                    </div>

                    <div
                      className={
                        styles.charmSpotlightAside
                      }
                    >
                      <div
                        className={
                          styles.charmSpotlightMeta
                        }
                      >
                        <div
                          className={
                            styles.charmSpotlightName
                          }
                        >
                          {item.name}
                        </div>
                        <div
                          className={
                            styles.charmSpotlightDesc
                          }
                        >
                          {item.description}
                        </div>
                        <div
                          className={
                            styles.charmSpotlightPrice
                          }
                        >
                          {money(item.price)}
                        </div>
                      </div>

                      <div
                        className={
                          styles.charmSpotlightControls
                        }
                      >
                        <div
                          className={
                            styles.cardSwitchInline
                          }
                        >
                          <span>Storefront</span>
                          <Switch
                            checked={Boolean(
                              item.isActive,
                            )}
                            onChange={(
                              _event,
                              checked,
                            ) => {
                              void toggleCaseStatus(
                                item,
                                checked,
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={
                            styles.tableAction
                          }
                          style={{
                            background:
                              "rgba(21, 31, 56, 0.92)",
                            color: "white",
                          }}
                          onClick={() =>
                            openUpdateEditor(item)
                          }
                        >
                          <Pencil size={14} />
                          <span>Cập nhật</span>
                        </button>
                        <Popconfirm
                          title="Xóa case"
                          onConfirm={() =>
                            removeCase(item.id)
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.tableActionDanger
                            }
                          >
                            <Trash2 size={14} />
                            <span>Xóa</span>
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className={styles.dataGridEmpty}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Trống"
                />
              </div>
            )}
          </article>
        </section>

        <Modal
          centered
          open={isEditorOpen}
          onCancel={closeEditor}
          footer={null}
          destroyOnHidden
          className={styles.charmEditorModal}
          width={560}
          title={
            <div className={styles.modalTitleWrap}>
              <span>
                {editingId ? "Cập nhật case" : "Tạo case"}
              </span>
            </div>
          }
        >
          <div className={styles.previewCard}>
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={form.name || "Case preview"}
                className={styles.previewImage}
              />
            ) : form.colorHex ? (
              <div
                style={{
                  background: form.colorHex,
                  height: "100%",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div className={styles.charmSpotlightFallback}>
                <ImageIcon size={28} />
              </div>
            )}
            <div className={styles.previewMeta}>
              <div className={styles.previewTitle}>
                {form.name || "Untitled case"}
              </div>
              <div className={styles.previewHint}>
                {money(previewFinalPrice)}
              </div>
            </div>
          </div>

          <form className={styles.editorForm} onSubmit={saveCase}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </label>

            <label className={styles.field}>
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
              />
            </label>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <span>Base price</span>
                <input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className={styles.field}>
                <span>Discount %</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      discountPercent: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <div className={styles.fieldRow}>
              <label className={styles.field}>
                <div className="flex justify-between items-center">
                  Color
                  <Checkbox
                    checked={hasColor}
                    onChange={(event) => {
                      setHasColor(event.target.checked);
                      setForm((current) => ({
                        ...current,
                        colorHex: event.target.checked
                          ? "#000000"
                          : "",
                      }));
                    }}
                    className="[&>.ant-checkbox]:!rounded-[999px] [&>.ant-checkbox]:!w-[20px] [&>.ant-checkbox]:!h-[20px] [&>.ant-checkbox:after]:!top-[8px] [&>.ant-checkbox:after]:!inset-s-[5px]"
                  />
                </div>
                {hasColor && (
                  <input
                    className="h-[40px]"
                    type="color"
                    value={form.colorHex}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        colorHex: event.target.value,
                      }))
                    }
                  />
                )}
              </label>
              <label className={styles.switchField}>
                <span>Storefront status</span>
                <Switch
                  checked={Boolean(form.isActive)}
                  onChange={(_event, checked) =>
                    setForm((current) => ({
                      ...current,
                      isActive: checked,
                    }))
                  }
                />
              </label>
            </div>

            {/* <label className={styles.uploadField}>
              <span>
                <Upload size={14} />
                <strong>
                  {file ? file.name : "Upload ảnh"}
                </strong>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
            </label> */}

            <div className={styles.editorActions}>
              <button
                type="submit"
                className={styles.primaryAction}
                disabled={saving || !hasAdminKey}
              >
                <Save size={15} />
                <span>
                  Lưu
                </span>
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </Modal>
      </>
    </ConfigProvider>
  );
}
