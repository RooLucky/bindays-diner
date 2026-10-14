export function parseMealFlavors(value: unknown): string[] {
  if (value === null || value === undefined || value === "") return [];
  if (typeof value !== "string" || value.length > 1700)
    throw new Error("Enter up to 20 flavors, one per line.");
  const flavors = value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
  if (flavors.length > 20 || flavors.some((value) => value.length > 80))
    throw new Error("Use up to 20 flavors with at most 80 characters each.");
  const seen = new Set<string>();
  return flavors.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export function isValidMealFlavor(category: string, flavors: string[], selected?: string) {
  const available = category === "student-meal" ? flavors : [];
  return available.length ? !!selected && available.includes(selected) : selected === undefined;
}

