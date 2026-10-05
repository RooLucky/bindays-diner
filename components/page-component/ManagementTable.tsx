"use client";

import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

import { AdminPanel } from "@/components/admin/AdminPanel";

import { AdminDialogPopup as DialogPopup } from "@/components/admin/AdminDialog";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImagePlus,
  MoreVertical,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  ManagementCategoryResponse,
  ManagementItemResponse,
  ManagementPayload,
  ManagementCategorySlug,
  ManagementItemCategoryResponse,
} from "@/lib/management";

const emptyItemForm = {
  name: "",
  description: "",
  price: "",
  tag: "",
  imageAlt: "",
  sortOrder: "0",
  isActive: true,
};

type ItemForm = typeof emptyItemForm;
const pageSizeOptions = [10, 20, 50];

export function ManagementTable({
  category,
  title,
}: {
  category: ManagementCategorySlug;
  title: string;
}) {
  const [payload, setPayload] = useState<ManagementPayload | null>(null);
  const [categoryForm, setCategoryForm] =
    useState<ManagementCategoryResponse | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);
  const [editingItem, setEditingItem] = useState<ManagementItemResponse | null>(
    null,
  );
  const [itemCategories, setItemCategories] = useState<
    ManagementItemCategoryResponse[]
  >([]);
  const [pageContentOpen, setPageContentOpen] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<ManagementItemResponse | null>(null);

  const endpoint = useMemo(
    () => `/api/admin/management/${category}`,
    [category],
  );

  async function loadData() {
    try {
      setPending(true);
      setMessage("");

      const response = await fetch(endpoint);
      const data = (await response.json()) as ManagementPayload & {
        error?: string;
      };

      if (!response.ok) {
        setMessage(data.error ?? "Unable to load management data.");
        return;
      }

      setPayload(data);
      setCategoryForm(data.category);
      setCurrentPage(1);
    } catch {
      setMessage("Unable to load management data. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function loadItemCategories() {
    try {
      const response = await fetch("/api/admin/management/item-categories");
      const data = (await response.json()) as {
        categories?: ManagementItemCategoryResponse[];
        error?: string;
      };

      if (!response.ok || !data.categories) {
        toast.error(data.error ?? "Unable to load item categories.");
        return;
      }

      setItemCategories(data.categories);
    } catch {
      toast.error("Unable to load item categories. Please try again.");
    }
  }

  useEffect(() => {
    void loadData();
    void loadItemCategories();
  }, [endpoint]);

  const allItems = payload?.items ?? [];
  const filteredItems = allItems.filter((item) => {
    const matchesSearch = `${item.name} ${item.description} ${item.tag ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return (
      matchesSearch &&
      (statusFilter === "all" ||
        (statusFilter === "active" ? item.isActive : !item.isActive))
    );
  });
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStartIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, totalItems);
  const paginatedItems = useMemo(
    () => filteredItems.slice(pageStartIndex, pageEndIndex),
    [filteredItems, pageEndIndex, pageStartIndex],
  );
  const selectedTagIsCustom =
    itemForm.tag.length > 0 &&
    !itemCategories.some(
      (categoryOption) => categoryOption.name === itemForm.tag,
    );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function updateCategoryField(
    key: keyof ManagementCategoryResponse,
    value: string,
  ) {
    setCategoryForm((current) =>
      current ? { ...current, [key]: value } : current,
    );
  }

  function updateItemField(key: keyof ItemForm, value: string | boolean) {
    setItemForm((current) => ({ ...current, [key]: value }));
  }

  function resetItemForm() {
    setEditingItem(null);
    setItemForm(emptyItemForm);
  }

  function openCreateItem() {
    resetItemForm();
    setItemModalOpen(true);
  }

  function startEdit(item: ManagementItemResponse) {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      tag: item.tag ?? "",
      imageAlt: item.imageAlt,
      sortOrder: String(item.sortOrder),
      isActive: item.isActive,
    });
    setItemModalOpen(true);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();

      if (!categoryForm) {
        return;
      }

      const form = event.currentTarget;
      const formData = new FormData(form);

      for (const key of [
        "eyebrow",
        "title",
        "description",
        "ctaLabel",
        "ctaHref",
        "heroAlt",
        "badge",
      ]) {
        formData.set(
          key,
          String(categoryForm[key as keyof ManagementCategoryResponse] ?? ""),
        );
      }

      setPending(true);
      const response = await fetch(endpoint, {
        method: "PATCH",
        body: formData,
      });
      const data = (await response.json()) as {
        category?: ManagementCategoryResponse;
        error?: string;
      };

      if (!response.ok || !data.category) {
        toast.error(data.error ?? "Unable to save page content.");
        return;
      }

      setPayload((current) =>
        current ? { ...current, category: data.category! } : current,
      );
      setCategoryForm(data.category);
      form.reset();
      setPageContentOpen(false);
      toast.success("Page content saved.");
    } catch {
      toast.error("Unable to save page content. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    try {
      event.preventDefault();

      const form = event.currentTarget;
      const formData = new FormData(form);

      Object.entries(itemForm).forEach(([key, value]) => {
        formData.set(key, String(value));
      });

      const url = editingItem
        ? `${endpoint}/items/${editingItem.id}`
        : `${endpoint}/items`;

      setPending(true);
      const response = await fetch(url, {
        method: editingItem ? "PATCH" : "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        item?: ManagementItemResponse;
        error?: string;
      };

      if (!response.ok || !data.item) {
        toast.error(data.error ?? "Unable to save item.");
        return;
      }

      setPayload((current) => {
        if (!current) {
          return current;
        }

        const items = editingItem
          ? current.items.map((item) =>
              item.id === data.item!.id ? data.item! : item,
            )
          : [...current.items, data.item!];

        return {
          ...current,
          items: items.sort((a, b) => a.sortOrder - b.sortOrder),
        };
      });

      form.reset();
      setItemModalOpen(false);
      toast.success(editingItem ? "Item updated." : "Item created.");
    } catch {
      toast.error("Unable to save this item. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function deleteItem(item: ManagementItemResponse) {
    const response = await fetch(`${endpoint}/items/${item.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete item.");
      return false;
    }

    setPayload((current) =>
      current
        ? {
            ...current,
            items: current.items.filter(
              (currentItem) => currentItem.id !== item.id,
            ),
          }
        : current,
    );
    toast.success("Item deleted.");
    return true;
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title={title}
        description="Manage menu items, pricing, and the content guests see on this page."
      >
        <div>
          <Popover open={actionsMenuOpen} onOpenChange={setActionsMenuOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-lg bg-transparent sm:hidden"
                  aria-label="Open page actions"
                />
              }
            >
              <MoreVertical className="size-5" />
            </PopoverTrigger>
            <PopoverPortal>
              <PopoverPositioner side="bottom" align="end">
                <PopoverPopup className="w-52 p-1.5 sm:hidden">
                  <div className="grid gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start rounded-lg"
                      disabled={pending}
                      onClick={() => {
                        setActionsMenuOpen(false);
                        void loadData();
                      }}
                    >
                      <RefreshCcw className="size-4" />
                      Refresh
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start rounded-lg"
                      disabled={pending || !categoryForm}
                      onClick={() => {
                        setActionsMenuOpen(false);
                        setPageContentOpen(true);
                      }}
                    >
                      <Edit3 className="size-4" />
                      Page Content
                    </Button>
                    <Button
                      type="button"
                      className="w-full justify-start rounded-lg"
                      disabled={pending}
                      onClick={() => {
                        setActionsMenuOpen(false);
                        openCreateItem();
                      }}
                    >
                      <Plus className="size-4" />
                      Add Item
                    </Button>
                  </div>
                </PopoverPopup>
              </PopoverPositioner>
            </PopoverPortal>
          </Popover>
          <div className="hidden gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg bg-transparent"
              disabled={pending}
              onClick={() => void loadData()}
            >
              <RefreshCcw className="size-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg bg-transparent"
              disabled={pending || !categoryForm}
              onClick={() => setPageContentOpen(true)}
            >
              <Edit3 className="size-4" />
              Page Content
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              disabled={pending}
              onClick={openCreateItem}
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>
        </div>
      </AdminPageHeader>

      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Dialog
        open={pageContentOpen}
        onOpenChange={(open) => {
          if (!pending) setPageContentOpen(open);
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup className="max-w-4xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                    Page Content
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Update the public hero copy, CTA, badge, and hero image.
                  </DialogDescription>
                </div>
                <DialogClose
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground"
                  aria-label="Close page content modal"
                >
                  <X className="size-4" />
                </DialogClose>
              </div>

              {categoryForm ? (
                <form onSubmit={saveCategory} className="mt-6 grid gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Eyebrow
                      <Input
                        value={categoryForm.eyebrow}
                        onChange={(event) =>
                          updateCategoryField("eyebrow", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Title
                      <Input
                        value={categoryForm.title}
                        onChange={(event) =>
                          updateCategoryField("title", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                      Description
                      <Textarea
                        value={categoryForm.description}
                        onChange={(event) =>
                          updateCategoryField("description", event.target.value)
                        }
                        rows={3}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      CTA Label
                      <Input
                        value={categoryForm.ctaLabel}
                        onChange={(event) =>
                          updateCategoryField("ctaLabel", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      CTA Link
                      <Input
                        value={categoryForm.ctaHref}
                        onChange={(event) =>
                          updateCategoryField("ctaHref", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Hero Alt Text
                      <Input
                        value={categoryForm.heroAlt}
                        onChange={(event) =>
                          updateCategoryField("heroAlt", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Badge
                      <Input
                        value={categoryForm.badge ?? ""}
                        onChange={(event) =>
                          updateCategoryField("badge", event.target.value)
                        }
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                      Replace Hero Image
                      <Input
                        name="heroImage"
                        type="file"
                        accept="image/*"
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center">
                    <img
                      src={categoryForm.heroImageUrl}
                      alt={categoryForm.heroAlt}
                      className="aspect-[1.7/1] w-full rounded-lg object-cover sm:w-36"
                    />
                    <p className="break-all text-xs text-muted-foreground">
                      {categoryForm.heroImageUrl}
                    </p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <DialogClose
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Cancel
                    </DialogClose>
                    <Button
                      type="submit"
                      disabled={pending}
                      className="rounded-lg"
                    >
                      <Save className="size-4" />
                      Save Page
                    </Button>
                  </div>
                </form>
              ) : null}
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <Dialog
        open={itemModalOpen}
        onOpenChange={(open) => {
          if (!pending) setItemModalOpen(open);
        }}
        onOpenChangeComplete={(open) => {
          if (!open) resetItemForm();
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                    {editingItem ? "Edit Item" : "Create Item"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Add menu details, pricing, image text, and display order.
                  </DialogDescription>
                </div>
                <DialogClose
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground"
                  aria-label="Close item modal"
                >
                  <X className="size-4" />
                </DialogClose>
              </div>

              <form
                onSubmit={saveItem}
                className="mt-6 grid gap-4 md:grid-cols-6"
              >
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Name
                  <Input
                    value={itemForm.name}
                    required
                    onChange={(event) =>
                      updateItemField("name", event.target.value)
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Price
                  <Input
                    value={itemForm.price}
                    required
                    onChange={(event) =>
                      updateItemField("price", event.target.value)
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <div className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                  <span>
                    Category{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <Popover
                    open={categoryPickerOpen}
                    onOpenChange={setCategoryPickerOpen}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg bg-background px-3 text-left text-sm font-normal hover:bg-muted"
                        />
                      }
                    >
                      <span className="truncate">
                        {itemForm.tag || "No category"}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </PopoverTrigger>
                    <PopoverPortal>
                      <PopoverPositioner side="bottom" align="start">
                        <PopoverPopup className="w-[min(22rem,calc(100vw-3rem))] max-h-64 overflow-y-auto p-1">
                          {[
                            "",
                            ...(selectedTagIsCustom ? [itemForm.tag] : []),
                            ...itemCategories.map(
                              (categoryOption) => categoryOption.name,
                            ),
                          ].map((categoryName) => {
                            const isSelected = itemForm.tag === categoryName;
                            const label = categoryName || "No category";

                            return (
                              <button
                                key={categoryName || "no-category"}
                                type="button"
                                onClick={() => {
                                  updateItemField("tag", categoryName);
                                  setCategoryPickerOpen(false);
                                }}
                                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                              >
                                <span className="truncate">{label}</span>
                                {isSelected ? (
                                  <Check className="size-4 shrink-0 text-primary" />
                                ) : null}
                              </button>
                            );
                          })}
                        </PopoverPopup>
                      </PopoverPositioner>
                    </PopoverPortal>
                  </Popover>
                </div>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                  Sort
                  <Input
                    value={itemForm.sortOrder}
                    type="number"
                    onChange={(event) =>
                      updateItemField("sortOrder", event.target.value)
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="flex items-center gap-2 self-end rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground md:col-span-2">
                  <Switch
                    checked={itemForm.isActive}
                    onCheckedChange={(checked) =>
                      updateItemField("isActive", checked)
                    }
                    size="sm"
                  />
                  Active
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-6">
                  Description
                  <Textarea
                    value={itemForm.description}
                    required
                    rows={4}
                    onChange={(event) =>
                      updateItemField("description", event.target.value)
                    }
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Image Alt Text
                  <Input
                    value={itemForm.imageAlt}
                    onChange={(event) =>
                      updateItemField("imageAlt", event.target.value)
                    }
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Image
                  <Input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex flex-col-reverse gap-3 md:col-span-6 sm:flex-row sm:justify-end">
                  <DialogClose
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-10 rounded-lg"
                  >
                    {editingItem ? (
                      <Save className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {editingItem ? "Save Item" : "Create Item"}
                  </Button>
                </div>
              </form>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${deleteTarget?.name ?? "item"}?`}
        description="This item will be removed from the menu. This action cannot be undone."
        onConfirm={() =>
          deleteTarget ? deleteItem(deleteTarget) : Promise.resolve(false)
        }
      />

      <AdminPanel className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 border-b border-border px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              Menu items{" "}
              <Badge variant="secondary" className="rounded-md">
                {allItems.length}
              </Badge>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {totalItems === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex}{" "}
              of {totalItems} items
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Rows
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-col gap-3 border-b px-5 py-3 sm:flex-row sm:items-center">
          <label className="relative flex-1 sm:max-w-sm">
            <span className="sr-only">Search menu items</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name or category…"
              className="rounded-lg border-border bg-background pl-9"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All items</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[860px] border-collapse text-sm">
            <TableHeader className="bg-muted/60 text-left text-xs font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-4 py-3">Image</TableHead>
                <TableHead className="px-4 py-3">Name</TableHead>
                <TableHead className="px-4 py-3">Price</TableHead>
                <TableHead className="px-4 py-3">Category</TableHead>
                <TableHead className="px-4 py-3">Sort</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalItems ? (
                paginatedItems.map((item) => (
                  <TableRow key={item.id} className="border-t border-border">
                    <TableCell className="px-4 py-3">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="aspect-[1.6/1] w-24 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal px-4 py-3">
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-foreground">
                      {item.price}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {item.tag ?? "-"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {item.sortOrder}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={
                          item.isActive
                            ? "rounded-md bg-brand-gold-soft text-brand-olive"
                            : "rounded-md bg-muted text-muted-foreground"
                        }
                      >
                        {item.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-lg bg-transparent"
                          onClick={() => startEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          title="Edit item"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="rounded-lg"
                          onClick={() => {
                            setDeleteTarget(item);
                            setDeleteOpen(true);
                          }}
                          aria-label={`Delete ${item.name}`}
                          title="Delete item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    <ImagePlus className="mx-auto mb-3 size-8" />
                    {pending && !payload
                      ? "Loading menu items…"
                      : allItems.length
                        ? "No items match your search."
                        : "No items yet. Add your first menu item to get started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {totalItems === 0 ? 0 : currentPage} of{" "}
            {totalItems === 0 ? 0 : totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg bg-transparent"
              disabled={currentPage <= 1 || totalItems === 0}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg bg-transparent"
              disabled={currentPage >= totalPages || totalItems === 0}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
