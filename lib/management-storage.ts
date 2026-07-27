import { randomUUID } from "node:crypto";

import { deleteR2Object, uploadR2Object } from "@/lib/r2";
import type { ManagementCategorySlug } from "@/lib/management";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function safeFilename(name: string) {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "image";
}

export function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getRequiredString(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

export function getOptionalBoolean(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  return value === "true" || value === "on" || value === "1";
}

export function getOptionalInteger(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be a number.`);
  }

  return parsed;
}

export function getSingleImageFile(formData: FormData, key: string) {
  const values = formData.getAll(key).filter((value) => value instanceof File);

  if (values.length > 1) {
    throw new Error(`Upload only one ${key} file.`);
  }

  const file = values[0] as File | undefined;

  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`${key} must be an image file.`);
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(`${key} must be 5MB or smaller.`);
  }

  return file;
}

export async function replaceManagementImage(input: {
  category: ManagementCategorySlug;
  file: File | null;
  previousKey?: string | null;
}) {
  if (!input.file) {
    return null;
  }

  const prefix =
    input.category === "add-ons"
      ? "add-ons"
      : `management/${input.category}`;
  const key = `${prefix}/${randomUUID()}-${safeFilename(
    input.file.name,
  )}`;
  const body = Buffer.from(await input.file.arrayBuffer());

  await deleteR2Object(input.previousKey);
  const url = await uploadR2Object({
    key,
    body,
    contentType: input.file.type || "application/octet-stream",
  });

  return { key, url };
}
