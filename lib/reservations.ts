import "server-only";

import { randomBytes, randomUUID } from "node:crypto";
import { join } from "node:path";

import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import type {
  ReservationItem,
  ReservationPaymentDetails,
} from "@/lib/reservation-contracts";
import { deleteR2Object, uploadR2Object } from "@/lib/r2";

const PAYMENT_LINK_VALIDITY_MS = 30 * 60 * 1_000;
const MAX_RECEIPT_SIZE = 8 * 1024 * 1024;
const DINER_RECEIPT_EMAIL = "bindaysdiner2025@gmail.com";
export const RESERVATION_PAYMENT_NUMBER = "09565021661";

const reservationItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  price: z.string().trim().min(1).max(40),
  quantity: z.coerce.number().int().min(1).max(50),
});

const reservationInputSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  deliveryAddress: z.string().trim().min(8).max(800),
  landmark: z.string().trim().max(500).optional().transform((value) => value || null),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(2_000).optional().transform((value) => value || null),
  items: z.array(reservationItemSchema).min(1).max(50),
  subtotal: z.coerce.number().int().min(1).max(1_000_000),
});

type ReservationInput = z.infer<typeof reservationInputSchema>;

function getCustomerMailer() {
  const env = getServerEnv();

  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
    throw new Error("Reservation email is not configured.");
  }

  return {
    from: env.SMTP_FROM,
    transporter: nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    }),
  };
}

function getDinerMailer() {
  const env = getServerEnv();

  if (!env.SMTP2_HOST || !env.SMTP2_PORT || !env.SMTP2_USER || !env.SMTP2_PASS || !env.SMTP2_FROM) {
    throw new Error("Diner receipt email is not configured.");
  }

  return {
    from: env.SMTP2_FROM,
    transporter: nodemailer.createTransport({
      host: env.SMTP2_HOST,
      port: env.SMTP2_PORT,
      secure: env.SMTP2_PORT === 465,
      auth: { user: env.SMTP2_USER, pass: env.SMTP2_PASS },
    }),
  };
}

function parseItems(itemsJson: string): ReservationItem[] {
  try {
    return z.array(reservationItemSchema).parse(JSON.parse(itemsJson));
  } catch {
    return [];
  }
}

function safeFilename(name: string) {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "payment-receipt";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

function toPaymentDetails(
  reservation: typeof reservations.$inferSelect,
): ReservationPaymentDetails {
  return {
    id: reservation.id,
    fullName: reservation.fullName,
    deliveryDate: reservation.deliveryDate,
    deliveryTime: reservation.deliveryTime,
    items: parseItems(reservation.itemsJson),
    subtotal: reservation.subtotal,
    paymentStatus: reservation.paymentStatus,
    paymentLinkExpiresAt: reservation.paymentLinkExpiresAt.toISOString(),
    paidAt: reservation.paidAt?.toISOString() ?? null,
  };
}

async function expireIfNeeded(reservation: typeof reservations.$inferSelect) {
  if (
    reservation.paymentStatus !== "pending" ||
    reservation.paymentLinkExpiresAt.getTime() > Date.now()
  ) {
    return reservation;
  }

  const [updated] = await getDb()
    .update(reservations)
    .set({ paymentStatus: "unpaid", updatedAt: new Date() })
    .where(eq(reservations.id, reservation.id))
    .returning();

  return updated ?? reservation;
}

async function findReservation(id: string, token: string) {
  const [reservation] = await getDb()
    .select()
    .from(reservations)
    .where(eq(reservations.id, id))
    .limit(1);

  if (!reservation || reservation.paymentToken !== token) {
    throw new Error("This payment link is invalid.");
  }

  return expireIfNeeded(reservation);
}

export async function createReservation(input: unknown, origin: string) {
  const parsed: ReservationInput = reservationInputSchema.parse(input);
  const paymentToken = randomBytes(32).toString("hex");
  const paymentLinkExpiresAt = new Date(Date.now() + PAYMENT_LINK_VALIDITY_MS);
  const [reservation] = await getDb()
    .insert(reservations)
    .values({
      ...parsed,
      itemsJson: JSON.stringify(parsed.items),
      paymentToken,
      paymentLinkExpiresAt,
    })
    .returning();

  if (!reservation) {
    throw new Error("Unable to create the reservation.");
  }

  const paymentUrl = new URL(`/reservation/${reservation.id}`, origin);
  paymentUrl.searchParams.set("token", paymentToken);
  const paymentNumberUrl = new URL(paymentUrl);
  paymentNumberUrl.hash = "payment-number";
  const orderRows = parseItems(reservation.itemsJson)
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;color:#3f3f46;">${escapeHtml(item.name)} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#18181b;font-weight:700;">${escapeHtml(item.price)}</td></tr>`,
    )
    .join("");
  const qrAttachments = [
    {
      filename: "maya-payment-qr.jpg",
      path: join(process.cwd(), "public", "payment", "maya.jpg"),
      cid: "bindays-maya-qr",
    },
    {
      filename: "gcash-payment-qr.jpg",
      path: join(process.cwd(), "public", "payment", "gcash.jpg"),
      cid: "bindays-gcash-qr",
    },
  ];

  try {
    const { from, transporter } = getCustomerMailer();
    await transporter.sendMail({
      from,
      to: reservation.email,
      subject: "Complete your Binday's Diner reservation payment",
      text: `Hi ${reservation.fullName},\n\nYour reservation is pending. Pay using Maya or GCash to ${RESERVATION_PAYMENT_NUMBER}, then upload your payment receipt within 30 minutes:\n${paymentUrl}\n\nThis link expires at ${paymentLinkExpiresAt.toLocaleString("en-PH")}.`,
      html: `<div style="margin:0;padding:32px 16px;background:#f7f1e8;font-family:Arial,sans-serif;color:#18181b;"><div style="max-width:600px;margin:0 auto;overflow:hidden;border:1px solid #e7ddd0;border-radius:12px;background:#fffaf4;"><div style="padding:28px 32px;background:#b91c1c;color:#ffffff;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Binday's Diner</p><h1 style="margin:0;font-family:Georgia,serif;font-size:30px;line-height:1.2;">Complete your reservation payment</h1></div><div style="padding:28px 32px;"><p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(reservation.fullName)},</p><p style="margin:0 0 20px;font-size:16px;line-height:1.6;">Your reservation is <strong>pending</strong>. Please pay within 30 minutes using Maya or GCash, then upload your receipt through the secure link below.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border-top:1px solid #eadfd3;border-bottom:1px solid #eadfd3;"><tbody>${orderRows}<tr><td style="padding:12px 0;font-weight:700;">Order total</td><td style="padding:12px 0;text-align:right;color:#b91c1c;font-size:20px;font-weight:700;">P${reservation.subtotal.toLocaleString("en-PH")}</td></tr></tbody></table><p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#6b7280;">Payment number</p><a href="${paymentNumberUrl}" style="display:inline-block;margin:0 0 20px;padding:13px 18px;border-radius:8px;background:#18181b;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1px;text-decoration:none;">${RESERVATION_PAYMENT_NUMBER} &mdash; open to copy</a><p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#52525b;">Choose Maya or GCash, then scan the matching QR code:</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td width="50%" align="center" style="padding:8px;"><img src="cid:bindays-maya-qr" alt="Maya QR code" style="display:block;width:100%;max-width:210px;height:auto;border-radius:8px;"><p style="margin:8px 0 0;font-weight:700;">Maya</p></td><td width="50%" align="center" style="padding:8px;"><img src="cid:bindays-gcash-qr" alt="GCash QR code" style="display:block;width:100%;max-width:210px;height:auto;border-radius:8px;"><p style="margin:8px 0 0;font-weight:700;">GCash</p></td></tr></table><p style="margin:24px 0 0;text-align:center;"><a href="${paymentUrl}" style="display:inline-block;padding:15px 22px;border-radius:8px;background:#b91c1c;color:#ffffff;font-size:14px;font-weight:700;letter-spacing:.7px;text-decoration:none;text-transform:uppercase;">Upload payment receipt</a></p><p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#71717a;">This secure link expires at ${paymentLinkExpiresAt.toLocaleString("en-PH")}. After expiry, the reservation will be marked unpaid.</p></div></div></div>`,
      attachments: qrAttachments,
    });
  } catch (error) {
    await getDb().delete(reservations).where(eq(reservations.id, reservation.id));
    throw error;
  }

  return {
    id: reservation.id,
    paymentLinkExpiresAt: paymentLinkExpiresAt.toISOString(),
  };
}

export async function getReservationPaymentDetails(id: string, token: string) {
  return toPaymentDetails(await findReservation(id, token));
}

export async function submitReservationReceipt(input: {
  id: string;
  token: string;
  receipt: File;
}) {
  const reservation = await findReservation(input.id, input.token);

  if (reservation.paymentStatus === "paid") {
    throw new Error("This reservation has already been paid.");
  }

  if (reservation.paymentStatus === "unpaid") {
    throw new Error("This payment link has expired. The reservation is unpaid.");
  }

  if (
    input.receipt.size === 0 ||
    input.receipt.size > MAX_RECEIPT_SIZE ||
    (!input.receipt.type.startsWith("image/") && input.receipt.type !== "application/pdf")
  ) {
    throw new Error("Upload an image or PDF receipt that is 8MB or smaller.");
  }

  const body = Buffer.from(await input.receipt.arrayBuffer());
  const key = `reservation-receipts/${reservation.id}/${randomUUID()}-${safeFilename(input.receipt.name)}`;
  const receiptUrl = await uploadR2Object({
    key,
    body,
    contentType: input.receipt.type || "application/octet-stream",
  });

  try {
    const { from, transporter } = getDinerMailer();
    await transporter.sendMail({
      from,
      to: DINER_RECEIPT_EMAIL,
      subject: `Payment receipt: ${reservation.fullName} (${reservation.id})`,
      text: `A payment receipt was uploaded for reservation ${reservation.id}.\nCustomer: ${reservation.fullName}\nEmail: ${reservation.email}\nPhone: ${reservation.phone}\nDelivery: ${reservation.deliveryDate} ${reservation.deliveryTime}\nAddress: ${reservation.deliveryAddress}\nReceipt URL: ${receiptUrl}`,
      attachments: [
        {
          filename: safeFilename(input.receipt.name),
          content: body,
          contentType: input.receipt.type,
        },
      ],
    });

    const [updated] = await getDb()
      .update(reservations)
      .set({
        paymentStatus: "paid",
        receiptKey: key,
        receiptUrl,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, reservation.id))
      .returning();

    if (!updated) {
      throw new Error("Unable to record the payment.");
    }

    return toPaymentDetails(updated);
  } catch (error) {
    await deleteR2Object(key);
    throw error;
  }
}
