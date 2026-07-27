"use client";

import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, RefreshCcw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ManagementItemCategoryResponse } from "@/lib/management";

type CategoryApiResponse = {
  categories?: ManagementItemCategoryResponse[];
  category?: ManagementItemCategoryResponse;
  error?: string;
};

export function CategoryManagementClient() {
  const [categories, setCategories] = useState<ManagementItemCategoryResponse[]>(
    [],
  );
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<ManagementItemCategoryResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/admin/management/item-categories");
    const data = (await response.json()) as CategoryApiResponse;

    setPending(false);

    if (!response.ok || !data.categories) {
      setMessage(data.error ?? "Unable to load categories.");
      return;
    }

    setCategories(data.categories);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function resetForm() {
    setEditingCategory(null);
    setName("");
  }

  function startEdit(category: ManagementItemCategoryResponse) {
    setEditingCategory(category);
    setName(category.name);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Category name is required.");
      return;
    }

    setPending(true);
    const response = await fetch(
      editingCategory
        ? `/api/admin/management/item-categories/${editingCategory.id}`
        : "/api/admin/management/item-categories",
      {
        method: editingCategory ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      },
    );
    const data = (await response.json()) as CategoryApiResponse;
    setPending(false);

    if (!response.ok || !data.category) {
      toast.error(data.error ?? "Unable to save category.");
      return;
    }

    setCategories((current) => {
      const next = editingCategory
        ? current.map((category) =>
            category.id === data.category!.id ? data.category! : category,
          )
        : [...current, data.category!];

      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
    resetForm();
    toast.success(editingCategory ? "Category updated." : "Category added.");
  }

  async function deleteCategory(category: ManagementItemCategoryResponse) {
    const confirmed = window.confirm(`Delete ${category.name}?`);

    if (!confirmed) {
      return;
    }

    setPending(true);
    const response = await fetch(
      `/api/admin/management/item-categories/${category.id}`,
      { method: "DELETE" },
    );
    const data = (await response.json()) as CategoryApiResponse;
    setPending(false);

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete category.");
      return;
    }

    setCategories((current) =>
      current.filter((currentCategory) => currentCategory.id !== category.id),
    );

    if (editingCategory?.id === category.id) {
      resetForm();
    }

    toast.success("Category deleted.");
  }

  return (
    <div className="grid gap-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">
            Management
          </p>
          <h1 className="mt-2 font-serif text-5xl text-foreground">
            Categories
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage optional category labels used by all menu item forms.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm bg-transparent"
          disabled={pending}
          onClick={() => void loadCategories()}
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

      <section className="rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <form onSubmit={saveCategory} className="flex flex-col gap-3 sm:flex-row">
          <label className="grid flex-1 gap-2 text-sm font-medium text-foreground">
            Category Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="Example: Pasta"
            />
          </label>
          <div className="flex gap-2 self-end">
            {editingCategory ? (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-sm bg-transparent"
                onClick={resetForm}
              >
                <X className="size-4" />
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={pending} className="h-10 rounded-sm">
              {editingCategory ? (
                <Save className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {editingCategory ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-serif text-3xl text-foreground">
            Category Options
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} available options
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length ? (
                categories.map((category) => (
                  <tr key={category.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-sm bg-transparent"
                          onClick={() => startEdit(category)}
                          title="Edit category"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="rounded-sm"
                          onClick={() => void deleteCategory(category)}
                          title="Delete category"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-14 text-center text-muted-foreground">
                    No categories yet.
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
