import { z } from "zod";

export function isValidBirthday(
  value: string,
  today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "1920-01-01" ||
    value > today
  )
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export const loyaltyRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(160),
  birthday: z
    .string()
    .refine(
      (value) => isValidBirthday(value),
      "Choose a valid birthday that is not in the future.",
    ),
  phone: z.string().trim().max(40).optional(),
});
