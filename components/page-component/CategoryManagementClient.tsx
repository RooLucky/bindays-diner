"use client";

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

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { FormEvent, useEffect, useState } from "react";
import { Edit3, Plus, RefreshCcw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AdminDialogPopup } from "@/components/admin/AdminDialog";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import type { ManagementItemCategoryResponse } from "@/lib/management";

type CategoryApiResponse = {
  categories?: ManagementItemCategoryResponse[];
  category?: ManagementItemCategoryResponse;
  error?: string;
};

export function CategoryManagementClient() {
  const [categories, setCategories] = useState<
    ManagementItemCategoryResponse[]
  >([]);
  const [name, setName] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<ManagementItemCategoryResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState<ManagementItemCategoryResponse | null>(null);

  async function loadCategories() {
    try {
      setPending(true);
      setMessage("");

      const response = await fetch("/api/admin/management/item-categories");
      const data = (await response.json()) as CategoryApiResponse;

      if (!response.ok || !data.categories) {
        setMessage(data.error ?? "Unable to load categories.");
        return;
      }

      setCategories(data.categories);
    } catch {
      setMessage("Unable to load categories. Please try again.");
    } finally {
      setPending(false);
    }
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
    setFormOpen(true);
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    try {
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
      setFormOpen(false);
      toast.success(editingCategory ? "Category updated." : "Category added.");
    } catch {
      toast.error("Unable to save this category. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function deleteCategory(category: ManagementItemCategoryResponse) {
    const response = await fetch(
      `/api/admin/management/item-categories/${category.id}`,
      { method: "DELETE" },
    );
    const data = (await response.json()) as CategoryApiResponse;

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete category.");
      return false;
    }

    setCategories((current) =>
      current.filter((currentCategory) => currentCategory.id !== category.id),
    );

    if (editingCategory?.id === category.id) {
      resetForm();
    }

    toast.success("Category deleted.");
    return true;
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Categories"
        description="Organize menu items with reusable category labels."
      >
        <Button
          type="button"
          variant="outline"
          className="rounded-lg bg-transparent"
          disabled={pending}
          onClick={() => void loadCategories()}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
        <Button
          className="rounded-lg"
          disabled={pending}
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
        >
          <Plus />
          Add category
        </Button>
      </AdminPageHeader>

      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!pending) setFormOpen(open);
        }}
        onOpenChangeComplete={(open) => {
          if (!open) resetForm();
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <AdminDialogPopup className="max-w-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {editingCategory ? "Edit category" : "Add category"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Create a label to organize your menu items.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-md"
                      disabled={pending}
                    />
                  }
                  aria-label="Close category dialog"
                >
                  <X />
                </DialogClose>
              </div>
              <form onSubmit={saveCategory} className="mt-6 grid gap-5">
                <label className="grid flex-1 gap-2 text-sm font-medium text-foreground">
                  Category Name
                  <Input
                    required
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    placeholder="Example: Pasta"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <DialogClose
                    render={
                      <Button
                        variant="outline"
                        className="h-10 rounded-lg"
                        disabled={pending}
                      />
                    }
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-10 rounded-lg"
                  >
                    {editingCategory ? (
                      <Save className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {pending
                      ? "Saving…"
                      : editingCategory
                        ? "Save changes"
                        : "Add category"}
                  </Button>
                </div>
              </form>
            </AdminDialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${deleteTarget?.name ?? "category"}?`}
        description="This category label will be removed. This action cannot be undone."
        onConfirm={() =>
          deleteTarget ? deleteCategory(deleteTarget) : Promise.resolve(false)
        }
      />

      <AdminPanel className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Category Options
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} available options
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[520px] border-collapse text-sm">
            <TableHeader className="bg-muted/60 text-left text-xs font-medium text-muted-foreground">
              <TableRow>
                <TableHead className="px-4 py-3">Name</TableHead>
                <TableHead className="px-4 py-3">Updated</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length ? (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="border-t border-border"
                  >
                    <TableCell className="px-4 py-3 font-semibold text-foreground">
                      {category.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      {new Date(category.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-lg bg-transparent"
                          onClick={() => startEdit(category)}
                          title="Edit category"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="rounded-lg"
                          onClick={() => {
                            setDeleteTarget(category);
                            setDeleteOpen(true);
                          }}
                          aria-label={`Delete ${category.name}`}
                          title="Delete category"
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
                    colSpan={3}
                    className="px-4 py-14 text-center text-muted-foreground"
                  >
                    No categories yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </AdminPanel>
    </div>
  );
}
