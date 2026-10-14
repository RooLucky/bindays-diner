"use client";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Flavor = { id: string; name: string };
export function MealFlavorPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const selected = value.split("\n").filter(Boolean);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/admin/management/flavors", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to load flavors. Please retry.");
        const data = await response.json();
        setFlavors(data.flavors);
      }).catch(error => { if (!controller.signal.aborted) setError(error.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  async function createFlavor() {
    if (!name.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/management/flavors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to save flavor.");
      const flavor = data.flavor as Flavor;
      setFlavors(current => [...current.filter(item => item.id !== flavor.id), flavor].sort((a, b) => a.name.localeCompare(b.name)));
      if (!selected.includes(flavor.name) && selected.length < 20) onChange([...selected, flavor.name].join("\n"));
      setName("");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save flavor."); }
    finally { setSaving(false); }
  }
  const options = Array.from(new Set([...flavors.map(item => item.name), ...selected]));
  return <fieldset className="space-y-3 rounded-lg border p-4 md:col-span-6">
    <legend className="px-1 text-sm font-medium">Available flavors (optional)</legend>
    {loading ? <p className="text-sm text-muted-foreground">Loading flavors…</p> : <div className="grid max-h-48 gap-3 overflow-y-auto sm:grid-cols-2">
      {options.map(option => <label key={option} className="flex items-center gap-2 text-sm">
        <Checkbox checked={selected.includes(option)} disabled={saving || (!selected.includes(option) && selected.length >= 20)} onCheckedChange={checked => onChange((checked ? [...selected, option] : selected.filter(item => item !== option)).join("\n"))} />
        {option}
      </label>)}
      {!options.length && <p className="text-sm text-muted-foreground">No flavors yet. Create one below.</p>}
    </div>}
    <div className="flex gap-2">
      <Input aria-label="New flavor name" placeholder="New flavor, e.g. Spicy" value={name} maxLength={80} disabled={saving} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void createFlavor(); } }} />
      <Button type="button" variant="outline" disabled={saving || loading || !name.trim()} onClick={createFlavor}>{saving ? "Adding…" : "Add flavor"}</Button>
    </div>
    {error && <div role="alert" className="text-sm text-destructive">{error} <Button type="button" variant="ghost" onClick={() => setReload(value => value + 1)}>Retry</Button></div>}
    <p className="text-xs text-muted-foreground">Select up to 20 flavors for this meal. New flavors are saved for reuse. All use the meal price.</p>
  </fieldset>;
}
