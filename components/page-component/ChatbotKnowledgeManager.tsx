"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogViewport,
} from "@/components/ui/alert-dialog";
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

type KnowledgeEntry = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

type KnowledgeForm = Pick<
  KnowledgeEntry,
  "question" | "answer" | "keywords" | "category" | "isActive" | "isFeatured"
>;

const EMPTY_FORM: KnowledgeForm = {
  question: "",
  answer: "",
  keywords: "",
  category: "General",
  isActive: true,
  isFeatured: false,
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const fieldClassName =
  "w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

export function ChatbotKnowledgeManager() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [syncingMenu, setSyncingMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [form, setForm] = useState<KnowledgeForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntry | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/chatbot/knowledge", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        entries?: KnowledgeEntry[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to load chatbot knowledge.");
      }

      setEntries(data.entries ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load chatbot knowledge.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) =>
      [entry.question, entry.answer, entry.keywords, entry.category]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [entries, query]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + pageSize);
  const activeCount = entries.filter((entry) => entry.isActive).length;
  const featuredCount = entries.filter((entry) => entry.isFeatured).length;

  useEffect(() => {
    setCurrentPage(1);
  }, [query, pageSize]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(entry: KnowledgeEntry) {
    setEditing(entry);
    setForm({
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords,
      category: entry.category,
      isActive: entry.isActive,
      isFeatured: entry.isFeatured,
    });
    setFormOpen(true);
  }

  async function syncMenuKnowledge() {
    setSyncingMenu(true);

    try {
      const response = await fetch("/api/admin/chatbot/knowledge/sync-menu", {
        method: "POST",
      });
      const data = (await response.json()) as {
        entries?: KnowledgeEntry[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sync menu knowledge.");
      }

      await loadEntries();
      toast.success(
        `${data.entries?.length ?? 0} menu categories synced with up to 10 active items each.`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sync menu knowledge.",
      );
    } finally {
      setSyncingMenu(false);
    }
  }

  async function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch(
        editing
          ? `/api/admin/chatbot/knowledge/${editing.id}`
          : "/api/admin/chatbot/knowledge",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = (await response.json()) as {
        entry?: KnowledgeEntry;
        error?: string;
      };

      if (!response.ok || !data.entry) {
        throw new Error(data.error ?? "Unable to save the knowledge entry.");
      }

      const savedEntry = data.entry;
      setEntries((current) =>
        editing
          ? current.map((entry) =>
              entry.id === savedEntry.id ? savedEntry : entry,
            )
          : [savedEntry, ...current],
      );
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      toast.success(editing ? "Knowledge entry updated." : "Knowledge entry created.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save the entry.",
      );
    } finally {
      setPending(false);
    }
  }

  async function toggleEntry(entry: KnowledgeEntry) {
    try {
      const response = await fetch(`/api/admin/chatbot/knowledge/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      const data = (await response.json()) as {
        entry?: KnowledgeEntry;
        error?: string;
      };

      if (!response.ok || !data.entry) {
        throw new Error(data.error ?? "Unable to change visibility.");
      }

      const savedEntry = data.entry;
      setEntries((current) =>
        current.map((item) => (item.id === savedEntry.id ? savedEntry : item)),
      );
      toast.success(savedEntry.isActive ? "Answer is now active." : "Answer is now hidden.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to change visibility.",
      );
    }
  }

  async function deleteEntry() {
    if (!deleteTarget) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch(
        `/api/admin/chatbot/knowledge/${deleteTarget.id}`,
        { method: "DELETE" },
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to delete the knowledge entry.");
      }

      setEntries((current) =>
        current.filter((entry) => entry.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Knowledge entry deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete the entry.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
            <Bot className="size-4" />
            Grounded Q and A
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.25rem,7vw,3.75rem)] text-foreground">
            Chatbot Knowledge
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Every public chatbot reply is selected from an active answer here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="rounded-sm"
            onClick={() => void syncMenuKnowledge()}
            disabled={syncingMenu}
          >
            <Database className={syncingMenu ? "size-4 animate-pulse" : "size-4"} />
            {syncingMenu ? "Syncing Menu" : "Sync Menu Data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-sm bg-transparent"
            onClick={() => void loadEntries()}
            disabled={loading}
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
          <Button type="button" className="rounded-sm" onClick={openCreate}>
            <Plus className="size-4" />
            Add Q and A
          </Button>
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-gold-soft text-secondary">
          <Database className="size-5" />
        </span>
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            Live menu knowledge
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            Best sellers, student meals, promos, meal of the day, and main dishes
            are grounded from the first 10 active items in each management category.
            Menu edits refresh these approved answers automatically.
          </p>
        </div>
      </section>

      <section className="grid overflow-hidden rounded-sm border border-border bg-card sm:grid-cols-3">
        {[
          ["Total entries", entries.length],
          ["Active answers", activeCount],
          ["Suggested prompts", featuredCount],
        ].map(([label, value], index) => (
          <div
            key={String(label)}
            className={index > 0 ? "border-t border-border px-5 py-4 sm:border-l sm:border-t-0" : "px-5 py-4"}
          >
            <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 font-serif text-3xl text-foreground">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-foreground">Approved answers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {filteredEntries.length === 0 ? 0 : startIndex + 1}-
              {Math.min(startIndex + pageSize, filteredEntries.length)} of {filteredEntries.length}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search knowledge"
                className={`${fieldClassName} pl-9`}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              Rows
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className={`${fieldClassName} w-24`}
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Question and answer</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Keywords</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-3 size-6 animate-spin" />
                    Loading knowledge...
                  </td>
                </tr>
              ) : paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border align-top">
                    <td className="max-w-xl px-4 py-4">
                      <div className="flex items-start gap-2">
                        {entry.isFeatured ? (
                          <Sparkles className="mt-0.5 size-4 shrink-0 text-brand-gold" />
                        ) : null}
                        <div>
                          <p className="font-semibold text-foreground">{entry.question}</p>
                          <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                            {entry.answer}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">{entry.category}</td>
                    <td className="max-w-xs px-4 py-4 text-xs leading-5 text-muted-foreground">
                      {entry.keywords || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                        {entry.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-sm bg-transparent"
                          onClick={() => void toggleEntry(entry)}
                          title={entry.isActive ? "Hide answer" : "Show answer"}
                        >
                          {entry.isActive ? <EyeOff /> : <Eye />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          className="rounded-sm bg-transparent"
                          onClick={() => openEdit(entry)}
                          title="Edit answer"
                        >
                          <Edit3 />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          className="rounded-sm"
                          onClick={() => setDeleteTarget(entry)}
                          title="Delete answer"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-muted-foreground">
                    <Bot className="mx-auto mb-3 size-8" />
                    No knowledge entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {filteredEntries.length === 0 ? 0 : safePage} of {filteredEntries.length === 0 ? 0 : totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-sm bg-transparent"
              disabled={safePage <= 1 || filteredEntries.length === 0}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-sm bg-transparent"
              disabled={safePage >= totalPages || filteredEntries.length === 0}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      </section>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!pending) {
            setFormOpen(open);
          }
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup className="max-w-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <DialogTitle className="font-serif text-3xl text-foreground">
                    {editing ? "Edit Q and A" : "Add Q and A"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    The public bot can only return answers approved here.
                  </DialogDescription>
                </div>
                <DialogClose className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                  Close
                </DialogClose>
              </div>

              <form className="mt-5 space-y-4" onSubmit={saveEntry}>
                <label className="block text-sm font-semibold text-foreground">
                  Question
                  <input
                    required
                    maxLength={240}
                    value={form.question}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, question: event.target.value }))
                    }
                    className={`${fieldClassName} mt-2`}
                    placeholder="How do I reserve a table?"
                  />
                </label>

                <label className="block text-sm font-semibold text-foreground">
                  Approved answer
                  <textarea
                    required
                    maxLength={3000}
                    rows={6}
                    value={form.answer}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, answer: event.target.value }))
                    }
                    className={`${fieldClassName} mt-2 resize-y`}
                    placeholder="Write the exact answer guests are allowed to receive."
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Category
                    <input
                      required
                      maxLength={80}
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, category: event.target.value }))
                      }
                      className={`${fieldClassName} mt-2`}
                      placeholder="Reservations"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-foreground">
                    Retrieval keywords
                    <input
                      maxLength={600}
                      value={form.keywords}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, keywords: event.target.value }))
                      }
                      className={`${fieldClassName} mt-2`}
                      placeholder="booking table guests schedule"
                    />
                  </label>
                </div>

                <div className="grid gap-3 border-y border-border py-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isActive: event.target.checked }))
                      }
                      className="size-4 accent-primary"
                    />
                    Active for chatbot answers
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, isFeatured: event.target.checked }))
                      }
                      className="size-4 accent-primary"
                    />
                    Show as a suggested question
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <DialogClose className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted">
                    Cancel
                  </DialogClose>
                  <Button type="submit" className="h-10 rounded-sm" disabled={pending}>
                    {pending ? <RefreshCw className="animate-spin" /> : editing ? <Edit3 /> : <Plus />}
                    {pending ? "Saving..." : editing ? "Save changes" : "Create answer"}
                  </Button>
                </div>
              </form>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !pending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogViewport>
            <AlertDialogPopup>
              <AlertDialogTitle className="font-serif text-3xl text-foreground">
                Delete this answer?
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                The chatbot will no longer be able to use this knowledge entry.
              </AlertDialogDescription>
              <div className="mt-6 flex justify-end gap-2">
                <AlertDialogClose className="inline-flex h-9 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted">
                  Cancel
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-sm"
                  disabled={pending}
                  onClick={() => void deleteEntry()}
                >
                  {pending ? <RefreshCw className="animate-spin" /> : <Trash2 />}
                  Delete
                </Button>
              </div>
            </AlertDialogPopup>
          </AlertDialogViewport>
        </AlertDialogPortal>
      </AlertDialog>
    </div>
  );
}
