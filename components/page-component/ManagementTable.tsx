"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Edit3, ImagePlus, Plus, RefreshCcw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type {
  ManagementCategoryResponse,
  ManagementItemResponse,
  ManagementPayload,
  ManagementCategorySlug,
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
    const data = (await response.json()) as ManagementPayload & { error?: string };

    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "Unable to load management data.");
      return;
    }

    setPayload(data);
    setCategoryForm(data.category);
  }

  useEffect(() => {
    void loadData();
  }, [endpoint]);

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
      formData.set(key, String(categoryForm[key as keyof ManagementCategoryResponse] ?? ""));
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
            items: current.items.filter((currentItem) => currentItem.id !== item.id),
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
      </section>

      {message ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {categoryForm ? (
        <form
          onSubmit={saveCategory}
          className="grid gap-5 rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-3xl text-foreground">Page Content</h2>
            <Button type="submit" disabled={pending} className="rounded-sm">
              <Save className="size-4" />
              Save Page
            </Button>
          </div>
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
                  updateCategoryField("description", event.target.value)
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
          <div className="flex items-center gap-4 rounded-sm border border-border bg-background p-3">
            <img
              src={categoryForm.heroImageUrl}
              alt={categoryForm.heroAlt}
              className="aspect-[1.7/1] w-36 rounded-sm object-cover"
            />
            <p className="break-all text-xs text-muted-foreground">
              {categoryForm.heroImageUrl}
            </p>
          </div>
        </form>
      ) : null}

      <section className="grid gap-5 rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-3xl text-foreground">
            {editingItem ? "Edit Item" : "Create Item"}
          </h2>
          {editingItem ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-sm bg-transparent"
              onClick={resetItemForm}
            >
              <X className="size-4" />
              Cancel
            </Button>
          ) : null}
        </div>
        <form onSubmit={saveItem} className="grid gap-4 lg:grid-cols-6">
          <label className="grid gap-2 text-sm font-medium text-foreground lg:col-span-2">
            Name
            <input
              value={itemForm.name}
              required
              onChange={(event) => updateItemField("name", event.target.value)}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Price
            <input
              value={itemForm.price}
              required
              onChange={(event) => updateItemField("price", event.target.value)}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Tag
            <input
              value={itemForm.tag}
              onChange={(event) => updateItemField("tag", event.target.value)}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
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
          <label className="flex items-center gap-2 self-end text-sm font-medium text-foreground">
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
          <label className="grid gap-2 text-sm font-medium text-foreground lg:col-span-3">
            Description
            <textarea
              value={itemForm.description}
              required
              rows={3}
              onChange={(event) =>
                updateItemField("description", event.target.value)
              }
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground lg:col-span-2">
            Image Alt Text
            <input
              value={itemForm.imageAlt}
              onChange={(event) =>
                updateItemField("imageAlt", event.target.value)
              }
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Image
            <input
              name="image"
              type="file"
              accept="image/*"
              className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
          <Button
            type="submit"
            disabled={pending}
            className="h-10 rounded-sm lg:col-span-6"
          >
            {editingItem ? <Save className="size-4" /> : <Plus className="size-4" />}
            {editingItem ? "Save Item" : "Create Item"}
          </Button>
        </form>
      </section>

      <section className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="font-serif text-3xl text-foreground">Items</h2>
          <span className="text-sm text-muted-foreground">
            {payload?.items.length ?? 0} rows
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payload?.items.length ? (
                payload.items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        className="aspect-[1.6/1] w-24 rounded-sm object-cover"
                      />
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="font-semibold text-foreground">{item.name}</p>
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
      </section>
    </div>
  );
}
