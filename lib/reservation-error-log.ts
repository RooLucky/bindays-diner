// Log only diagnostic codes, never SMTP responses, SQL, credentials, or order data.
export function logReservationError(stage: string, error: unknown) {
  const detail = error && typeof error === "object"
    ? error as { code?: unknown; cause?: { code?: unknown }; responseCode?: unknown }
    : undefined;
  const code = detail?.code ?? detail?.cause?.code;
  console.error("Reservation operation failed", {
    stage,
    code: typeof code === "string" && /^[A-Z0-9_]{2,40}$/i.test(code) ? code : "UNKNOWN",
    ...(typeof detail?.responseCode === "number" ? { smtpStatus: detail.responseCode } : {}),
  });
}
