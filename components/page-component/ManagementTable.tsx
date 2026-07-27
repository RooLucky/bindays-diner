"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImagePlus,
  Plus,
  RefreshCcw,
  Save,
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
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const endpoint = useMemo(
    () => `/api/admin/management/${category}`,
    [category],
  );

  async function loadData() {
    setPending(true);
    setMessage("");

    const response = await fetch(endpoint);
    const data = (await response.json()) as ManagementPayload & {
      error?: string;
    };

    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "Unable to load management data.");
      return;
    }

    setPayload(data);
    setCategoryForm(data.category);
    setCurrentPage(1);
  }

  async function loadItemCategories() {
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
  }

  useEffect(() => {
    void loadData();
    void loadItemCategories();
  }, [endpoint]);

  const allItems = payload?.items ?? [];
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStartIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, totalItems);
  const paginatedItems = useMemo(
    () => allItems.slice(pageStartIndex, pageEndIndex),
    [allItems, pageEndIndex, pageStartIndex],
  );
  const selectedTagIsCustom =
    itemForm.tag.length > 0 &&
    !itemCategories.some((categoryOption) => categoryOption.name === itemForm.tag);

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
    setPending(false);

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
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
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
    setPending(false);

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
    resetItemForm();
    setItemModalOpen(false);
    toast.success(editingItem ? "Item updated." : "Item created.");
  }

  async function deleteItem(item: ManagementItemResponse) {
    const confirmed = window.confirm(`Delete ${item.name}?`);

    if (!confirmed) {
      return;
    }

    setPending(true);
    const response = await fetch(`${endpoint}/items/${item.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete item.");
      return;
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
  }

  return (
    <div className="grid gap-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">
            Management
          </p>
          <h1 className="mt-2 font-serif text-5xl text-foreground">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Edit the public page copy and manage the rows shown on this section.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="rounded-sm bg-transparent"
            disabled={pending}
            onClick={() => void loadData()}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm bg-transparent"
            disabled={pending || !categoryForm}
            onClick={() => setPageContentOpen(true)}
          >
            <Edit3 className="size-4" />
            Page Content
          </Button>
          <Button
            type="button"
            className="rounded-sm"
            disabled={pending}
            onClick={openCreateItem}
          >
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>
      </section>

      {message ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Dialog open={pageContentOpen} onOpenChange={setPageContentOpen}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup className="max-w-4xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="font-serif text-3xl text-foreground">
                    Page Content
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Update the public hero copy, CTA, badge, and hero image.
                  </DialogDescription>
                </div>
                <DialogClose
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
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
                      <input
                        value={categoryForm.eyebrow}
                        onChange={(event) =>
                          updateCategoryField("eyebrow", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Title
                      <input
                        value={categoryForm.title}
                        onChange={(event) =>
                          updateCategoryField("title", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                      Description
                      <textarea
                        value={categoryForm.description}
                        onChange={(event) =>
                          updateCategoryField(
                            "description",
                            event.target.value,
                          )
                        }
                        rows={3}
                        className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      CTA Label
                      <input
                        value={categoryForm.ctaLabel}
                        onChange={(event) =>
                          updateCategoryField("ctaLabel", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      CTA Link
                      <input
                        value={categoryForm.ctaHref}
                        onChange={(event) =>
                          updateCategoryField("ctaHref", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Hero Alt Text
                      <input
                        value={categoryForm.heroAlt}
                        onChange={(event) =>
                          updateCategoryField("heroAlt", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground">
                      Badge
                      <input
                        value={categoryForm.badge ?? ""}
                        onChange={(event) =>
                          updateCategoryField("badge", event.target.value)
                        }
                        className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                      Replace Hero Image
                      <input
                        name="heroImage"
                        type="file"
                        accept="image/*"
                        className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-4 rounded-sm border border-border bg-background p-3 sm:flex-row sm:items-center">
                    <img
                      src={categoryForm.heroImageUrl}
                      alt={categoryForm.heroAlt}
                      className="aspect-[1.7/1] w-full rounded-sm object-cover sm:w-36"
                    />
                    <p className="break-all text-xs text-muted-foreground">
                      {categoryForm.heroImageUrl}
                    </p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <DialogClose
                      type="button"
                      className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Cancel
                    </DialogClose>
                    <Button type="submit" disabled={pending} className="rounded-sm">
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
          setItemModalOpen(open);
          if (!open) {
            resetItemForm();
          }
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="font-serif text-3xl text-foreground">
                    {editingItem ? "Edit Item" : "Create Item"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Add menu details, pricing, image text, and display order.
                  </DialogDescription>
                </div>
                <DialogClose
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                  aria-label="Close item modal"
                >
                  <X className="size-4" />
                </DialogClose>
              </div>

              <form onSubmit={saveItem} className="mt-6 grid gap-4 md:grid-cols-6">
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Name
                  <input
                    value={itemForm.name}
                    required
                    onChange={(event) =>
                      updateItemField("name", event.target.value)
                    }
                    className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Price
                  <input
                    value={itemForm.price}
                    required
                    onChange={(event) =>
                      updateItemField("price", event.target.value)
                    }
                    className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                  Category{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                  <select
                    value={itemForm.tag}
                    onChange={(event) =>
                      updateItemField("tag", event.target.value)
                    }
                    className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">No category</option>
                    {selectedTagIsCustom ? (
                      <option value={itemForm.tag}>{itemForm.tag}</option>
                    ) : null}
                    {itemCategories.map((categoryOption) => (
                      <option key={categoryOption.id} value={categoryOption.name}>
                        {categoryOption.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-2">
                  Sort
                  <input
                    value={itemForm.sortOrder}
                    type="number"
                    onChange={(event) =>
                      updateItemField("sortOrder", event.target.value)
                    }
                    className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="flex items-center gap-2 self-end rounded-sm border border-border bg-background px-3 py-2 text-sm font-medium text-foreground md:col-span-2">
                  <input
                    type="checkbox"
                    checked={itemForm.isActive}
                    onChange={(event) =>
                      updateItemField("isActive", event.target.checked)
                    }
                    className="size-4"
                  />
                  Active
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-6">
                  Description
                  <textarea
                    value={itemForm.description}
                    required
                    rows={4}
                    onChange={(event) =>
                      updateItemField("description", event.target.value)
                    }
                    className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Image Alt Text
                  <input
                    value={itemForm.imageAlt}
                    onChange={(event) =>
                      updateItemField("imageAlt", event.target.value)
                    }
                    className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground md:col-span-3">
                  Image
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="flex flex-col-reverse gap-3 md:col-span-6 sm:flex-row sm:justify-end">
                  <DialogClose
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </DialogClose>
                  <Button type="submit" disabled={pending} className="h-10 rounded-sm">
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

      <section className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col justify-between gap-4 border-b border-border px-5 py-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl text-foreground">Items</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {totalItems === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} of{" "}
              {totalItems} fetched rows
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
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {totalItems ? (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="aspect-[1.6/1] w-24 rounded-sm object-cover"
                      />
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.price}
                    </td>
                    <td className="px-4 py-3">{item.tag ?? "-"}</td>
                    <td className="px-4 py-3">{item.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {item.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-sm bg-transparent"
                          onClick={() => startEdit(item)}
                          title="Edit item"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="rounded-sm"
                          onClick={() => void deleteItem(item)}
                          title="Delete item"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    <ImagePlus className="mx-auto mb-3 size-8" />
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              className="rounded-sm bg-transparent"
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
              className="rounded-sm bg-transparent"
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
      </section>
    </div>
  );
}
