"use client";

/* eslint-disable @next/next/no-img-element */

import { Card, ConfigProvider, Empty, Modal } from "antd";
import {
    Image as ImageIcon,
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
import { Switch } from "@mui/material";
import { useAdminContext } from "./admin-context";
import { AdminPageSection } from "./admin-shell";
import styles from "./admin.module.css";
import { INITIAL_CHARM_FORM, money } from "./admin-utils";
import type { AdminCharm, CharmForm } from "./admin-types";

type FilterMode = "all" | "active" | "inactive" | "low_stock";

function toCharmForm(item: AdminCharm): CharmForm {
    return {
        name: item.name,
        icon: item.icon,
        price: String(item.price),
        discountPercent: String(item.discountPercent),
        stock: String(item.stock),
        imageUrl: item.imageUrl ?? "",
        isActive: Boolean(item.isActive),
    };
}

function CharmItem({
    item,
    toggleCharmStatus,
    openUpdateEditor,
    removeCharm,
}: {
    item: AdminCharm;
    toggleCharmStatus: (item: AdminCharm, checked: boolean) => void;
    openUpdateEditor: (item: AdminCharm) => void;
    removeCharm: (id: string) => void;
}) {
    return (
        <Card
            key={item.id}
            className={`${styles.managementCard} ${styles.charmSpotlightCard}`}
        >
            <div className={styles.charmSpotlightMedia}>
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name || "Charm preview"}
                        className={styles.charmSpotlightImage}
                    />
                ) : (
                    <div className={styles.charmSpotlightFallback}>
                        <ImageIcon size={28} />
                    </div>
                )}
                <div className={styles.charmSpotlightOverlay} />
            </div>

            <div className={styles.charmSpotlightAside}>
                <div className={styles.charmSpotlightMeta}>
                    <div className={styles.charmSpotlightName}>{item.name}</div>
                    <div className={styles.charmSpotlightPrice}>
                        {money(item.price)}
                    </div>
                </div>

                <div className={styles.charmSpotlightControls}>
                    <div className={styles.cardSwitchInline}>
                        <span>Storefront</span>
                        <Switch
                            checked={Boolean(item.isActive)}
                            onChange={(_event, checked) => {
                                void toggleCharmStatus(item, checked);
                            }}
                        />
                    </div>
                </div>

                <div className={styles.rowActions}>
                    <button
                        type="button"
                        className={styles.tableAction}
                        style={{
                            background: "rgba(21, 31, 56, 0.92)",
                            color: "white",
                        }}
                        onClick={() => openUpdateEditor(item)}
                    >
                        <Pencil size={14} />
                        <span>Update</span>
                    </button>
                    <button
                        type="button"
                        className={styles.tableActionDanger}
                        onClick={() => void removeCharm(item.id)}
                    >
                        <Trash2 size={14} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </Card>
    );
}

export default function CharmsManagementPage() {
    const { hasAdminKey, notify, req, upload, messageApi } = useAdminContext();
    const [items, setItems] = useState<AdminCharm[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [filter] = useState<FilterMode>("all");
    const [form, setForm] = useState<CharmForm>(INITIAL_CHARM_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    const loadCharms = useCallback(async () => {
        if (!hasAdminKey) {
            return;
        }

        setLoading(true);
        try {
            const response = await req<{ items: AdminCharm[] }>(
                "/api/admin/charms",
            );
            setItems(
                response.items.map((item) => ({
                    ...item,
                    isActive: Boolean(item.isActive),
                })),
            );
            notify("success", `Loaded ${response.items.length} charms.`);
        } catch (error) {
            notify(
                "error",
                error instanceof Error
                    ? error.message
                    : "Failed to load charms.",
            );
        } finally {
            setLoading(false);
        }
    }, [hasAdminKey, notify, req]);

    useEffect(() => {
        void loadCharms();
    }, [loadCharms]);

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
        setForm(INITIAL_CHARM_FORM);
        setFile(null);
        setEditingId(null);
    }, []);

    const closeEditor = useCallback(() => {
        setIsEditorOpen(false);
        resetForm();
    }, [resetForm]);

    const openCreateEditor = useCallback(() => {
        resetForm();
        setIsEditorOpen(true);
    }, [resetForm]);

    const openUpdateEditor = useCallback((item: AdminCharm) => {
        setEditingId(item.id);
        setForm(toCharmForm(item));
        setFile(null);
        setIsEditorOpen(true);
    }, []);

    const visibleItems = useMemo(() => {
        return items.filter((item) => {
            const haystack = item.name.toLowerCase();
            const matchesSearch = haystack.includes(
                search.trim().toLowerCase(),
            );
            const matchesFilter =
                filter === "all" ||
                (filter === "active" && item.isActive) ||
                (filter === "inactive" && !item.isActive) ||
                (filter === "low_stock" && item.stock < 5);

            return matchesSearch && matchesFilter;
        });
    }, [filter, items, search]);

    const saveCharm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!hasAdminKey) {
            notify("error", "Enter ADMIN_API_KEY first.");
            return;
        }

        setSaving(true);
        try {
            let imageUrl = form.imageUrl || null;
            if (file) {
                imageUrl = await upload(file, "kinef/catalog/charms");
            }

            const payload = {
                ...form,
                price: Number(form.price),
                discountPercent: Number(form.discountPercent),
                stock: Number(form.stock) || 0,
                imageUrl,
            };

            if (editingId) {
                await req(`/api/admin/charms/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                notify("success", "Charm updated.");
            } else {
                await req("/api/admin/charms", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                notify("success", "Charm created.");
            }

            setIsEditorOpen(false);
            resetForm();
            messageApi.success("Successful");
            await loadCharms();
        } catch (error) {
            notify(
                "error",
                error instanceof Error
                    ? error.message
                    : "Failed to save charm.",
            );
        } finally {
            setSaving(false);
        }
    };

    const removeCharm = useCallback(
        async (id: string) => {
            if (!window.confirm("Delete this charm?")) {
                return;
            }

            setSaving(true);
            try {
                await req(`/api/admin/charms/${id}`, { method: "DELETE" });
                notify("success", "Charm deleted.");
                if (editingId === id) {
                    setIsEditorOpen(false);
                    resetForm();
                }
                messageApi.success("Xóa thành công");
                await loadCharms();
            } catch (error) {
                notify(
                    "error",
                    error instanceof Error
                        ? error.message
                        : "Failed to delete charm.",
                );
            } finally {
                setSaving(false);
            }
        },
        [editingId, loadCharms, messageApi, notify, req, resetForm],
    );

    const toggleCharmStatus = useCallback(
        async (item: AdminCharm, checked: boolean) => {
            await req(`/api/admin/charms/${item.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    ...item,
                    isActive: checked,
                }),
            });
            await loadCharms();
        },
        [loadCharms, req],
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
                    title="Charm Management"
                    actions={
                        <div className={styles.inlineActions}>
                            <button
                                type="button"
                                className={styles.secondaryAction}
                                onClick={() => void loadCharms()}
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
                                <span>Add new</span>
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
                                className={`${styles.searchInput} !w-full lg:!w-[450px]`}
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by name"
                            />
                        </div>

                        {loading ? (
                            <div className={styles.cardGridLoading}>
                                <Loader2 className="animate-spin" size={40} />
                            </div>
                        ) : visibleItems.length ? (
                            <div className={styles.managementCardGrid}>
                                {visibleItems.map((item) => (
                                    <CharmItem
                                        key={item.id}
                                        item={item}
                                        openUpdateEditor={openUpdateEditor}
                                        removeCharm={removeCharm}
                                        toggleCharmStatus={toggleCharmStatus}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className={styles.dataGridEmpty}>
                                {" "}
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
                                {editingId ? "Update charm" : "Create charm"}
                            </span>
                        </div>
                    }
                >
                    <div className={styles.previewCard}>
                        {previewImageUrl ? (
                            <img
                                src={previewImageUrl}
                                alt={form.name || "Charm preview"}
                                className={styles.previewImage}
                            />
                        ) : (
                            <div className={styles.previewGlyph}>
                                <ImageIcon />
                            </div>
                        )}
                        <div className={styles.previewMeta}>
                            <div className={styles.previewTitle}>
                                {form.name || "Untitled charm"}
                            </div>
                            <div className={styles.previewHint}>
                                {money(previewFinalPrice)}
                            </div>
                        </div>
                    </div>

                    <form className={styles.editorForm} onSubmit={saveCharm}>
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
                                <span>Stock</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.stock}
                                    onChange={(event) =>
                                        setForm((current) => ({
                                            ...current,
                                            stock: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </label>
                        </div>

                        <div className={styles.fieldRow}>
                            <label className={styles.switchField}>
                                <span>Show/Hide</span>
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
                            <label className={styles.uploadField}>
                                <span>
                                    <Upload size={14} />
                                    <strong>
                                        {file ? file.name : "Upload Image"}
                                    </strong>
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onFileChange}
                                />
                            </label>
                        </div>

                        <div className={styles.editorActions}>
                            <button
                                type="submit"
                                className={styles.primaryAction}
                                disabled={saving || !hasAdminKey}
                            >
                                <Save size={15} />
                                <span>Save</span>
                            </button>
                            <button
                                type="button"
                                className={styles.secondaryAction}
                                onClick={resetForm}
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </Modal>
            </>
        </ConfigProvider>
    );
}
